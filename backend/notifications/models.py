from django.db import models
from accounts.models import User


class Notification(models.Model):
    recipient = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='notifications'
    )
    actor = models.ForeignKey(
        User, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='notifications_created'
    )
    verb = models.CharField(max_length=50)
    message = models.CharField(max_length=255, blank=True)
    target = models.CharField(max_length=255, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.verb} -> {self.recipient.username}'