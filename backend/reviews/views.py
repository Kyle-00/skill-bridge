from rest_framework import viewsets, permissions, serializers
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
        if self.request.user == order.client:
            reviewee = order.freelancer
            reviewer_role = 'client'
        elif self.request.user == order.freelancer:
            reviewee = order.client
            reviewer_role = 'freelancer'
        else:
            raise serializers.ValidationError("You are not a participant in this order.")
        serializer.save(reviewer=self.request.user, reviewee=reviewee, reviewer_role=reviewer_role)