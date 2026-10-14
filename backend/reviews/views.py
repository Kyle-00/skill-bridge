from rest_framework import viewsets, permissions, serializers
from rest_framework.exceptions import ValidationError
from .models import Review
from .serializers import ReviewSerializer


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        order = serializer.validated_data.get('order')
        if not order:
            raise serializers.ValidationError({"order": "Order is required."})

        # Determine the reviewee and the reviewer's role based on who is submitting
        if self.request.user == order.client:
            reviewee = order.freelancer
            reviewer_role = 'client'
        elif self.request.user == order.freelancer:
            reviewee = order.client
            reviewer_role = 'freelancer'
        else:
            raise serializers.ValidationError(
                "You are not a participant in this order."
            )

        # Prevent duplicate reviews (unique_together would otherwise throw a 500)
        if Review.objects.filter(order=order, reviewer=self.request.user).exists():
            raise ValidationError("You have already reviewed this order.")

        # Only allow reviews on completed orders
        if order.status != 'completed':
            raise ValidationError(
                "You can only review an order after it is completed."
            )

        serializer.save(
            reviewer=self.request.user,
            reviewee=reviewee,
            reviewer_role=reviewer_role,
            is_verified=True,
        )