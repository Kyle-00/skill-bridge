from rest_framework import serializers
from .models import User, FreelancerProfile, ClientProfile, SubscriptionPayment


class UserSerializer(serializers.ModelSerializer):
    is_pro = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'role',
            'plan', 'plan_expires_at', 'is_pro',
            'phone_number', 'is_verified', 'trust_score',
            'is_superuser', 'is_staff',
        ]
        read_only_fields = [
            'is_superuser', 'is_staff', 'trust_score', 'is_verified',
            'plan', 'plan_expires_at',
        ]

    def get_is_pro(self, obj):
        return obj.has_active_pro_plan()

    def update(self, instance, validated_data):
        role = validated_data.get('role')
        user = super().update(instance, validated_data)
        if role:
            create_role_resources(user, role)
        return user


class SubscriptionPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPayment
        fields = '__all__'
        read_only_fields = ['user', 'status', 'reference', 'completed_at']


def create_role_resources(user, role):
    """Create the profile(s) and wallet that a role needs. Idempotent."""
    if role in ('freelancer', 'both'):
        FreelancerProfile.objects.get_or_create(user=user)
    if role in ('client', 'both'):
        ClientProfile.objects.get_or_create(user=user)
    try:
        from wallet.models import Wallet
        Wallet.objects.get_or_create(user=user)
    except Exception:
        pass


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role', 'phone_number',
                  'first_name', 'last_name']

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', 'both'),
            phone_number=validated_data.get('phone_number', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )


class GoogleVerifySerializer(serializers.Serializer):
    token = serializers.CharField()
    role = serializers.CharField(required=False, default='both')


class FreelancerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = FreelancerProfile
        exclude = ['user']


class ClientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientProfile
        exclude = ['user']