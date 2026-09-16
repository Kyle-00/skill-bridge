from django.db import models
from accounts.models import User
from orders.models import Order

class Review(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='reviews')
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_given')
    reviewee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_received')
    quality = models.PositiveSmallIntegerField(choices=[(i, i) for i in range(1, 6)])
    communication = models.PositiveSmallIntegerField(choices=[(i, i) for i in range(1, 6)])
    timeliness = models.PositiveSmallIntegerField(choices=[(i, i) for i in range(1, 6)])
    professionalism = models.PositiveSmallIntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(blank=True)
    reviewer_role = models.CharField(max_length=20, choices=(('client', 'Client'), ('freelancer', 'Freelancer')))
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('order', 'reviewer')