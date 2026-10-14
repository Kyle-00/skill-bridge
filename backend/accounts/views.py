import os
from decimal import Decimal
import requests
import stripe
from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework import status, permissions, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    User, FreelancerProfile, ClientProfile, SubscriptionPayment,
)
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    GoogleVerifySerializer,
    FreelancerProfileSerializer,
    ClientProfileSerializer,
    create_role_resources,
)

stripe.api_key = settings.STRIPE_SECRET_KEY


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _get_or_create_freelancer_profile(user):
    """Never fails — creates a blank profile if one doesn't exist."""
    profile, _ = FreelancerProfile.objects.get_or_create(
        user=user,
        defaults={
            'title': '',
            'overview': '',
            'skills': [],
            'portfolio': [],
        },
    )
    return profile


def _get_or_create_client_profile(user):
    profile, _ = ClientProfile.objects.get_or_create(
        user=user,
        defaults={'company_name': ''},
    )
    return profile


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------
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
                return Response({'error': 'Invalid Google token.'}, status=400)
            payload = response.json()
            google_id = payload.get('sub')
            email = payload.get('email')
            name = (payload.get('name') or '').split(' ', 1)
            first_name = name[0] if name else ''
            last_name = name[1] if len(name) > 1 else ''

            if not google_id or not email:
                return Response({'error': 'Missing user info from Google.'}, status=400)

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

            return Response({
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'is_new_user': is_new_user,
            })

        except requests.RequestException as e:
            return Response({'error': f'Google verification failed: {str(e)}'}, status=500)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


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
        profile = _get_or_create_freelancer_profile(request.user)
        return Response(FreelancerProfileSerializer(profile).data)

    def put(self, request):
        profile = _get_or_create_freelancer_profile(request.user)
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
        profile = _get_or_create_client_profile(request.user)
        return Response(ClientProfileSerializer(profile).data)

    def put(self, request):
        profile = _get_or_create_client_profile(request.user)
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
        ).order_by('-date_joined')
        return Response(UserSerializer(freelancers, many=True).data)


class ChooseRoleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        role = request.data.get('role')
        if role not in ('client', 'freelancer', 'both'):
            return Response(
                {'error': 'Role must be one of: client, freelancer, both.'},
                status=400,
            )
        user = request.user
        user.role = role
        user.save()
        create_role_resources(user, role)
        return Response(UserSerializer(user).data)


# ---------------------------------------------------------------------------
# Profile Completion — pure calculation (also used by analytics)
# ---------------------------------------------------------------------------
def compute_profile_completion(user):
    role = user.role or 'both'
    missing = []

    basic_checks = [
        (user.first_name, 'First name'),
        (user.last_name, 'Last name'),
        (user.email, 'Email'),
        (user.phone_number, 'Phone number'),
    ]

    if role == 'freelancer':
        basic_weight, freelancer_weight, client_weight = 10, 15, 0
    elif role == 'client':
        basic_weight, freelancer_weight, client_weight = 15, 0, 40
    else:
        basic_weight, freelancer_weight, client_weight = 10, 7.5, 30

    score = 0.0

    for val, label in basic_checks:
        if val:
            score += basic_weight
        else:
            missing.append(label)

    if role in ('freelancer', 'both'):
        fp = getattr(user, 'freelancer_profile', None)
        fp_checks = [
            (fp.title if fp else None, 'Professional title'),
            (fp.overview if fp else None, 'Overview'),
            (fp.skills if fp else None, 'Skills'),
            (fp.portfolio if fp else None, 'Portfolio'),
        ]
        for val, label in fp_checks:
            if val:
                score += freelancer_weight
            else:
                missing.append(label)

    if role in ('client', 'both'):
        cp = getattr(user, 'client_profile', None)
        if cp and cp.company_name:
            score += client_weight
        else:
            missing.append('Company name')

    return {
        'percentage': int(round(score)),
        'missing_fields': missing,
    }


class ProfileCompletionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(compute_profile_completion(request.user))


# ---------------------------------------------------------------------------
# Subscription
# ---------------------------------------------------------------------------
class SubscribeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    PRO_PRICE_USD = Decimal('9.99')

    def post(self, request):
        method = request.data.get('method', 'stripe')
        user = request.user

        if user.has_active_pro_plan():
            return Response(
                {'error': 'You already have an active Pro plan.'},
                status=400,
            )

        if method == 'mpesa':
            return self._handle_mpesa(request, user)
        elif method == 'stripe':
            return self._handle_stripe(request, user)

        return Response({'error': 'Payment method must be "mpesa" or "stripe".'}, status=400)

    def _handle_mpesa(self, request, user):
        phone = request.data.get('phone_number', '')
        digits = ''.join(filter(str.isdigit, str(phone)))
        if digits.startswith('0'):
            digits = '254' + digits[1:]
        elif digits.startswith('7') or digits.startswith('1'):
            digits = '254' + digits
        if not digits.startswith('254') or len(digits) != 12:
            return Response({'error': 'Invalid Kenyan phone number.'}, status=400)

        try:
            from wallet.services.exchange import get_usd_to_kes_rate
            rate = get_usd_to_kes_rate()
        except Exception:
            rate = Decimal('130')

        amount_kes = int(self.PRO_PRICE_USD * rate)

        payment = SubscriptionPayment.objects.create(
            user=user, plan='pro',
            amount_usd=self.PRO_PRICE_USD, amount_kes=amount_kes,
            method='mpesa', status='pending',
        )

        try:
            from orders.services.mpesa import stk_push
            result = stk_push(digits, amount_kes, f'SUB{user.id}')
        except Exception as e:
            payment.status = 'failed'
            payment.save()
            return Response({'error': f'STK push failed: {str(e)}'}, status=500)

        if result.get('ResponseCode') == '0':
            payment.reference = result.get('CheckoutRequestID', '')
            payment.save()
            return Response({
                'status': 'pending',
                'message': 'STK push sent. Enter your M-Pesa PIN.',
                'checkout_request_id': result.get('CheckoutRequestID'),
                'amount_usd': float(self.PRO_PRICE_USD),
                'amount_kes': amount_kes,
                'exchange_rate': float(rate),
            })

        payment.status = 'failed'
        payment.save()
        return Response({'error': 'STK push failed'}, status=400)

    def _handle_stripe(self, request, user):
        try:
            intent = stripe.PaymentIntent.create(
                amount=int(self.PRO_PRICE_USD * 100),
                currency='usd',
                metadata={'type': 'subscription', 'user_id': user.id, 'plan': 'pro'},
                payment_method_types=['card'],
                receipt_email=user.email,
            )
            SubscriptionPayment.objects.create(
                user=user, plan='pro',
                amount_usd=self.PRO_PRICE_USD,
                method='stripe', status='pending',
                reference=intent.id,
            )
            return Response({
                'client_secret': intent.client_secret,
                'intent_id': intent.id,
                'amount_usd': float(self.PRO_PRICE_USD),
            })
        except stripe.error.StripeError as e:
            return Response({'error': str(e)}, status=400)


class SubscriptionStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'plan': user.plan,
            'is_pro': user.has_active_pro_plan(),
            'plan_expires_at': user.plan_expires_at,
        })