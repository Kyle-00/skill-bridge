from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('client', 'Client'),
        ('freelancer', 'Freelancer'),
        ('both', 'Both'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='both')
    phone_number = models.CharField(max_length=20, blank=True)
    is_verified = models.BooleanField(default=False)
    trust_score = models.FloatField(default=0.0)
    google_id = models.CharField(max_length=255, blank=True, null=True, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email

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