from django.db import models
from accounts.models import User

class Gig(models.Model):
    freelancer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='gigs')
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=100)
    subcategory = models.CharField(max_length=100, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_days = models.PositiveIntegerField()
    revisions = models.PositiveIntegerField(default=1)
    extras = models.JSONField(default=list)
    packages = models.JSONField(default=dict)
    is_active = models.BooleanField(default=True)
    views = models.PositiveIntegerField(default=0)
    clicks = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title