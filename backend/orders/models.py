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

    # Deliverable fields (single-deliverable flow; milestones below for split work)
    deliverable_url = models.URLField(blank=True, null=True)
    deliverable_file = models.FileField(upload_to='deliverables/%Y/%m/', blank=True, null=True)
    deliverable_message = models.TextField(blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)

    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Order #{self.id} — {self.status}'

    @property
    def milestone_total(self):
        return sum(m.amount for m in self.order_milestones.all())


class OrderMilestone(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('funded', 'Funded'),
        ('submitted', 'Submitted'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='order_milestones')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    position = models.PositiveIntegerField(default=1)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    escrow_funded = models.BooleanField(default=False)
    funded_at = models.DateTimeField(null=True, blank=True)

    deliverable_url = models.URLField(blank=True, null=True)
    deliverable_file = models.FileField(upload_to='milestones/%Y/%m/', blank=True, null=True)
    deliverable_message = models.TextField(blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['position', 'id']

    def __str__(self):
        return f'Milestone {self.position} of order #{self.order_id}'


class Dispute(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending Review'),
        ('resolved_release', 'Resolved — Released to Freelancer'),
        ('resolved_refund', 'Resolved — Refunded to Client'),
    )

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='disputes')
    opened_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='disputes_opened')
    reason = models.TextField()
    evidence = models.JSONField(default=list, blank=True)  # list of uploaded file URLs

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    resolution_note = models.TextField(blank=True)
    resolved_by = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.SET_NULL,
        related_name='disputes_resolved',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f'Dispute on order #{self.order_id} ({self.status})'


class Transaction(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    provider = models.CharField(max_length=20, choices=(
        ('stripe', 'Stripe'),
        ('mpesa', 'M-Pesa'),
        ('wallet', 'Wallet'),
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