import uuid
from django.db import models
from django.contrib.auth.hashers import make_password, check_password
from accounts.models import User


class Wallet(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wallet')
    wallet_id = models.CharField(max_length=20, unique=True, editable=False, blank=True)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default='USD')
    pin_hash = models.CharField(max_length=128, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.wallet_id:
            # Generate unique wallet ID like SB-AB12CD34
            new_id = 'SB-' + uuid.uuid4().hex[:8].upper()
            while Wallet.objects.filter(wallet_id=new_id).exists():
                new_id = 'SB-' + uuid.uuid4().hex[:8].upper()
            self.wallet_id = new_id
        super().save(*args, **kwargs)

    def set_pin(self, raw_pin):
        self.pin_hash = make_password(str(raw_pin))
        self.save()

    def check_pin(self, raw_pin):
        if not self.pin_hash:
            return False
        return check_password(str(raw_pin), self.pin_hash)

    def has_pin(self):
        return bool(self.pin_hash)

    def __str__(self):
        return f"{self.user.email} — {self.wallet_id}"


class Transaction(models.Model):
    TRANSACTION_TYPES = (
        ('deposit', 'Deposit'),
        ('withdrawal', 'Withdrawal'),
        ('transfer', 'Transfer'),
        ('escrow', 'Escrow Release'),
        ('refund', 'Refund'),
    )
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    )

    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    description = models.CharField(max_length=255, blank=True)
    reference = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.transaction_type} — {self.amount}"


class EscrowTransaction(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('funded', 'Funded'),
        ('released', 'Released'),
        ('refunded', 'Refunded'),
        ('disputed', 'Disputed'),
    )

    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='escrow_client')
    freelancer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='escrow_freelancer')
    order = models.ForeignKey('orders.Order', on_delete=models.CASCADE, related_name='escrow')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    funded_at = models.DateTimeField(null=True, blank=True)
    released_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Escrow #{self.id} — {self.amount}"