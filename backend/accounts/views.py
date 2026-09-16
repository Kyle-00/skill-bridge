import requests
from django.conf import settings
from django.contrib.auth import authenticate
from rest_framework import status, permissions, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, FreelancerProfile, ClientProfile
from .serializers import (
    UserSerializer, RegisterSerializer, GoogleVerifySerializer,
    FreelancerProfileSerializer, ClientProfileSerializer,
)


# -------------------- LOGIN (email or username) --------------------
class EmailOrUsernameTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def validate(self, attrs):
        identifier = attrs.get('email')
        password = attrs.get('password')

        if not identifier or not password:
            raise serializers.ValidationError('Email/username and password required.')

        user = User.objects.filter(email__iexact=identifier).first()
        if not user:
            user = User.objects.filter(username__iexact=identifier).first()

        if not user or not user.check_password(password):
            raise serializers.ValidationError('Invalid credentials.')
        if not user.is_active:
            raise serializers.ValidationError('Account is disabled.')

        refresh = RefreshToken.for_user(user)
        return {'refresh': str(refresh), 'access': str(refresh.access_token)}


class EmailOrUsernameTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailOrUsernameTokenObtainPairSerializer


# -------------------- REGISTER --------------------
class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            if user.role in ('freelancer', 'both'):
                FreelancerProfile.objects.get_or_create(user=user)
            if user.role in ('client', 'both'):
                ClientProfile.objects.get_or_create(user=user)

            try:
                from wallet.models import Wallet
                Wallet.objects.get_or_create(user=user)
            except Exception:
                pass

            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# -------------------- GOOGLE --------------------
class GoogleVerifyView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = GoogleVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        token = serializer.validated_data['token']
        role = serializer.validated_data.get('role', 'both')

        try:
            response = requests.get(
                f'https://oauth2.googleapis.com/tokeninfo?id_token={token}', timeout=10
            )
            if response.status_code != 200:
                return Response({'error': 'Invalid Google token.'}, status=400)

            payload = response.json()
            google_id = payload.get('sub')
            email = payload.get('email')
            name = (payload.get('name') or '').split(' ', 1)
            first_name = name[0] if name else ''
            last_name = name[1] if len(name) > 1 else ''

            if not google_id or not email:
                return Response({'error': 'Missing user info.'}, status=400)

            user = User.objects.filter(google_id=google_id).first()
            if not user:
                user = User.objects.filter(email__iexact=email).first()
                if user:
                    user.google_id = google_id
                    user.is_verified = True
                    user.save()
                else:
                    base = email.split('@')[0]
                    username = base
                    counter = 1
                    while User.objects.filter(username=username).exists():
                        username = f'{base}{counter}'
                        counter += 1
                    user = User.objects.create_user(
                        username=username, email=email,
                        first_name=first_name, last_name=last_name,
                        role=role, google_id=google_id,
                        password=None, is_verified=True,
                    )

            if user.role in ('freelancer', 'both'):
                FreelancerProfile.objects.get_or_create(user=user)
            if user.role in ('client', 'both'):
                ClientProfile.objects.get_or_create(user=user)
            try:
                from wallet.models import Wallet
                Wallet.objects.get_or_create(user=user)
            except Exception:
                pass

            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            })

        except Exception as e:
            return Response({'error': str(e)}, status=500)


# -------------------- PROFILE --------------------
class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


class FreelancerProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile, _ = FreelancerProfile.objects.get_or_create(user=request.user)
        return Response(FreelancerProfileSerializer(profile).data)

    def put(self, request):
        profile, _ = FreelancerProfile.objects.get_or_create(user=request.user)
        s = FreelancerProfileSerializer(profile, data=request.data, partial=True)
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=400)


class ClientProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile, _ = ClientProfile.objects.get_or_create(user=request.user)
        return Response(ClientProfileSerializer(profile).data)

    def put(self, request):
        profile, _ = ClientProfile.objects.get_or_create(user=request.user)
        s = ClientProfileSerializer(profile, data=request.data, partial=True)
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=400)


# -------------------- DELETE ACCOUNT --------------------
class DeleteAccountView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        password = request.data.get('password', '')
        user = request.user

        if not password:
            return Response({'error': 'Password is required.'}, status=400)
        if not user.check_password(password):
            return Response({'error': 'Incorrect password.'}, status=400)
        if user.is_superuser:
            return Response({'error': 'Superuser accounts cannot be deleted.'}, status=400)

        user.delete()
        return Response({'status': 'Account deleted successfully.'})


# -------------------- ADMIN: USER MANAGEMENT --------------------
class AdminUserListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        users = User.objects.all().order_by('-created_at')
        return Response(UserSerializer(users, many=True).data)


class AdminUserDetailView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

        if 'is_verified' in request.data:
            user.is_verified = bool(request.data['is_verified'])
        if 'is_active' in request.data:
            user.is_active = bool(request.data['is_active'])
        user.save()
        return Response(UserSerializer(user).data)

    def delete(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
        if user.is_superuser:
            return Response({'error': 'Cannot delete superuser'}, status=400)
        user.delete()
        return Response({'status': 'deleted'})