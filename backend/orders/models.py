from django.db import models
from accounts.models import User
from gigs.models import Gig
from projects.models import Project


class Order(models.Model):
    ORDER_TYPES = (('gig', 'Gig'), ('project', 'Project'))
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('funded', 'Funded'),
        ('in_progress', 'In Progress'),
        ('delivered', 'Delivered'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('disputed', 'Disputed'),
    )

    order_type = models.CharField(max_length=20, choices=ORDER_TYPES)
    gig = models.ForeignKey(Gig, null=True, blank=True, on_delete=models.SET_NULL)
    project = models.ForeignKey(Project, null=True, blank=True, on_delete=models.SET_NULL)
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders_as_client')
    freelancer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders_as_freelancer')

    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    platform_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    escrow_funded = models.BooleanField(default=False)
    funded_at = models.DateTimeField(null=True, blank=True)

    # Deliverable fields
    deliverable_url = models.URLField(blank=True, null=True)
    deliverable_message = models.TextField(blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)

    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} — {self.status}"


class Transaction(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    provider = models.CharField(max_length=20, choices=(
        ('stripe', 'Stripe'),
        ('mpesa', 'M-Pesa'),
        ('crypto', 'Cryptocurrency'),
        ('bank', 'Bank Transfer'),
    ))
    provider_ref = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=20, choices=(
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed'),
    ), default='pending')
    created_at = models.DateTimeField(auto_now_add=True)