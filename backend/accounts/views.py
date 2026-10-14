import os
from decimal import Decimal
import requests
import stripe
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
from rest_framework import status, permissions, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, FreelancerProfile, ClientProfile, SubscriptionPayment
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    GoogleVerifySerializer,
    FreelancerProfileSerializer,
    ClientProfileSerializer,
    create_role_resources,
)

stripe.api_key = settings.STRIPE_SECRET_KEY


class EmailOrUsernameTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def validate(self, attrs):
        identifier = attrs.get('email')
        password = attrs.get('password')
        if not identifier or not password:
            raise serializers.ValidationError('Email/username and password are required.')
        user = User.objects.filter(email__iexact=identifier).first()
        if not user:
            user = User.objects.filter(username__iexact=identifier).first()
        if not user or not user.check_password(password):
            raise serializers.ValidationError('Invalid credentials.')
        if not user.is_active:
            raise serializers.ValidationError('Account is disabled.')
        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }


class EmailOrUsernameTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailOrUsernameTokenObtainPairSerializer


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            create_role_resources(user, user.role)
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    'user': UserSerializer(user).data,
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
                f'https://oauth2.googleapis.com/tokeninfo?id_token={token}',
                timeout=10,
            )
            if response.status_code != 200:
                return Response(
                    {'error': 'Invalid Google token.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            payload = response.json()
            google_id = payload.get('sub')
            email = payload.get('email')
            name = (payload.get('name') or '').split(' ', 1)
            first_name = name[0] if name else ''
            last_name = name[1] if len(name) > 1 else ''

            if not google_id or not email:
                return Response(
                    {'error': 'Missing user info from Google.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            user = User.objects.filter(google_id=google_id).first()
            is_new_user = False

            if not user:
                user = User.objects.filter(email__iexact=email).first()
                if user:
                    user.google_id = google_id
                    if not user.is_verified:
                        user.is_verified = True
                    user.save()
                else:
                    is_new_user = True
                    base_username = email.split('@')[0]
                    username = base_username
                    counter = 1
                    while User.objects.filter(username=username).exists():
                        username = f'{base_username}{counter}'
                        counter += 1
                    user = User.objects.create_user(
                        username=username,
                        email=email,
                        first_name=first_name,
                        last_name=last_name,
                        role=role,
                        google_id=google_id,
                        password=None,
                        is_verified=True,
                    )

            create_role_resources(user, user.role)
            refresh = RefreshToken.for_user(user)

            return Response(
                {
                    'user': UserSerializer(user).data,
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'is_new_user': is_new_user,
                }
            )

        except requests.RequestException as e:
            return Response(
                {'error': f'Google verification failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FreelancerProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile, _ = FreelancerProfile.objects.get_or_create(user=request.user)
        return Response(FreelancerProfileSerializer(profile).data)

    def put(self, request):
        profile, _ = FreelancerProfile.objects.get_or_create(user=request.user)
        serializer = FreelancerProfileSerializer(
            profile, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ClientProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile, _ = ClientProfile.objects.get_or_create(user=request.user)
        return Response(ClientProfileSerializer(profile).data)

    def put(self, request):
        profile, _ = ClientProfile.objects.get_or_create(user=request.user)
        serializer = ClientProfileSerializer(
            profile, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeleteAccountView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        password = request.data.get('password', '')
        user = request.user
        if not password:
            return Response({'error': 'Password is required.'}, status=400)
        if not user.check_password(password):
            return Response({'error': 'Incorrect password.'}, status=400)
        user.delete()
        return Response({'message': 'Account deleted.'})


class AdminUserListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        users = User.objects.all().order_by('-date_joined')
        return Response(UserSerializer(users, many=True).data)


class AdminUserDetailView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        return Response(UserSerializer(user).data)

    def put(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


class FreelancerListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        freelancers = User.objects.filter(
            role__in=['freelancer', 'both'], is_active=True
        ).order_by('-date_join」ed' if False else '-date_joined')
        return Response(UserSerializer(freelancers, many=True).data)


class ChooseRoleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        role = request.data.get('role')
        if role not in ('client', 'freelancer', 'both'):
            return Response(
                {'error': 'Role must be one of: client, freelancer, both.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = request.user
        user.role = role
        user.save()

        create_role_resources(user, role)

        return Response(UserSerializer(user).data)


class SubscribeView(APIView):
    """
    Subscribe to the Pro plan via M-Pesa (STK push) or Stripe (card).

    Request body:
        method: 'mpesa' | 'stripe'
        phone_number: required only if method == 'mpesa'

    Response:
        M-Pesa: {status: 'pending', checkout_request_id, amount_kes, exchange_rate}
        Stripe: {client_secret, intent_id, amount_usd}
    """
    permission_classes = [permissions.IsAuthenticated]

    PRO_PRICE_USD = Decimal('9.99')

    def post(self, request):
        method = request.data.get('method', 'stripe')
        user = request.user

        if user.has_active_pro_plan():
            return Response(
                {'error': 'You already have an active Pro plan.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if method == 'mpesa':
            return self._handle_mpesa(request, user)
        elif method == 'stripe':
            return self._handle_stripe(request, user)

        return Response(
            {'error': 'Payment method must be "mpesa" or "stripe".'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    def _handle_mpesa(self, request, user):
        phone = request.data.get('phone_number', '')
        digits = ''.join(filter(str.isdigit, str(phone)))
        if digits.startswith('0'):
            digits = '254' + digits[1:]
        elif digits.startswith('7') or digits.startswith('1'):
            digits = '254' + digits
        if not digits.startswith('254') or len(digits) != 12:
            return Response(
                {'error': 'Invalid Kenyan phone number. Use 2547XXXXXXXX.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            from wallet.services.exchange import get_usd_to_kes_rate
            rate = get_usd_to_kes_rate()
        except Exception:
            rate = Decimal('130')

        amount_kes = int(self.PRO_PRICE_USD * rate)

        payment = SubscriptionPayment.objects.create(
            user=user,
            plan='pro',
            amount_usd=self.PRO_PRICE_USD,
            amount_kes=amount_kes,
            method='mpesa',
            status='pending',
        )

        try:
            from orders.services.mpesa import stk_push
            result = stk_push(digits, amount_kes, f'SUB{user.id}')
        except Exception as e:
            payment.status = 'failed'
            payment.save()
            return Response(
                {'error': f'STK push failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        if result.get('ResponseCode') == '0':
            payment.reference = result.get('CheckoutRequestID', '')
            payment.save()
            return Response({
                'status': 'pending',
                'message': 'STK push sent. Enter your M-Pesa PIN to complete the upgrade.',
                'checkout_request_id': result.get('CheckoutRequestID'),
                'amount_usd': float(self.PRO_PRICE_USD),
                'amount_kes': amount_kes,
                'exchange_rate': float(rate),
            })

        payment.status = 'failed'
        payment.save()
        return Response(
            {'error': result.get('errorMessage') or result.get('ResponseDescription', 'STK push failed')},
            status=status.HTTP_400_BAD_REQUEST,
        )

    def _handle_stripe(self, request, user):
        try:
            intent = stripe.PaymentIntent.create(
                amount=int(self.PRO_PRICE_USD * 100),
                currency='usd',
                metadata={
                    'type': 'subscription',
                    'user_id': user.id,
                    'plan': 'pro',
                },
                payment_method_types=['card'],
                receipt_email=user.email,
            )
            SubscriptionPayment.objects.create(
                user=user,
                plan='pro',
                amount_usd=self.PRO_PRICE_USD,
                method='stripe',
                status='pending',
                reference=intent.id,
            )
            return Response({
                'client_secret': intent.client_secret,
                'intent_id': intent.id,
                'amount_usd': float(self.PRO_PRICE_USD),
            })
        except stripe.error.StripeError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )


class SubscriptionStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'plan': user.plan,
            'is_pro': user.has_active_pro_plan(),
            'plan_expires_at': user.plan_expires_at,
        })