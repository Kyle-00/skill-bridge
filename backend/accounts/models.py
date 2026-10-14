from decimal import Decimal
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    ROLE_CHOICES = (
        ('client', 'Client'),
        ('freelancer', 'Freelancer'),
        ('both', 'Both'),
    )
    PLAN_CHOICES = (
        ('free', 'Free'),
        ('pro', 'Pro'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='both')
    plan = models.CharField(max_length=20, choices=PLAN_CHOICES, default='free')
    plan_expires_at = models.DateTimeField(null=True, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    is_verified = models.BooleanField(default=False)
    trust_score = models.FloatField(default=0.0)
    google_id = models.CharField(max_length=255, blank=True, null=True, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email

    def has_active_pro_plan(self):
        """Returns True if the user currently has an active Pro plan."""
        if self.plan != 'pro':
            return False
        if self.plan_expires_at and self.plan_expires_at < timezone.now():
            return False
        return True


class FreelancerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='freelancer_profile')
    title = models.CharField(max_length=255)
    overview = models.TextField()
    skills = models.JSONField(default=list)
    portfolio = models.JSONField(default=list)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    availability = models.BooleanField(default=True)
    profile_video = models.URLField(blank=True)


class ClientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='client_profile')
    company_name = models.CharField(max_length=255, blank=True)
    payment_verified = models.BooleanField(default=False)


class SubscriptionPayment(models.Model):
    """Tracks Pro plan subscription payments via M-Pesa or Stripe."""
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed'),
    )
    METHOD_CHOICES = (
        ('mpesa', 'M-Pesa'),
        ('stripe', 'Stripe'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscription_payments')
    plan = models.CharField(max_length=20, default='pro')
    amount_usd = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('9.99'))
    amount_kes = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    method = models.CharField(max_length=20, choices=METHOD_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    reference = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.username} - {self.plan} - {self.status}'