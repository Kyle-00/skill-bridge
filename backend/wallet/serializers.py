from rest_framework import serializers
from .models import Wallet, Transaction, EscrowTransaction

class WalletSerializer(serializers.ModelSerializer):
    has_pin = serializers.SerializerMethodField()

    class Meta:
        model = Wallet
        fields = ['id', 'wallet_id', 'balance', 'currency', 'has_pin', 'created_at', 'updated_at']

    def get_has_pin(self, obj):
        return obj.has_pin()

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'transaction_type', 'amount', 'fee', 'description', 'reference', 'status', 'created_at']

class EscrowSerializer(serializers.ModelSerializer):
    class Meta:
        model = EscrowTransaction
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

class SetPinSerializer(serializers.Serializer):
    pin = serializers.CharField(min_length=4, max_length=6)
    old_pin = serializers.CharField(required=False, allow_blank=True)

class ChangePinSerializer(serializers.Serializer):
    old_pin = serializers.CharField()
    new_pin = serializers.CharField(min_length=4, max_length=6)