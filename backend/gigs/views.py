from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Gig
from .serializers import GigSerializer


class GigViewSet(viewsets.ModelViewSet):
    queryset = Gig.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = GigSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'subcategory', 'freelancer']
    search_fields = ['title', 'description']
    ordering_fields = ['price', 'delivery_days', 'created_at']

    def perform_create(self, serializer):
        serializer.save(freelancer=self.request.user)


class AdminGigViewSet(viewsets.ModelViewSet):
    queryset = Gig.objects.all().order_by('-created_at')
    serializer_class = GigSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        gig = self.get_object()
        gig.is_active = not gig.is_active
        gig.save()
        return Response({'is_active': gig.is_active})