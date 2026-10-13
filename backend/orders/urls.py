from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    OrderViewSet, TransactionViewSet, AdminOrderViewSet,
    DisputeViewSet, AdminDisputeViewSet,
    MpesaCallbackView, StripeWebhookView,
)

router = DefaultRouter()
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'disputes', DisputeViewSet, basename='dispute')
router.register(r'', OrderViewSet, basename='order')

admin_router = DefaultRouter()
admin_router.register(r'disputes', AdminDisputeViewSet, basename='admin-dispute')
admin_router.register(r'', AdminOrderViewSet, basename='admin-order')

urlpatterns = [
    path('admin/', include(admin_router.urls)),
    path('mpesa-callback/', MpesaCallbackView.as_view(), name='mpesa-callback'),
    path('stripe-webhook/', StripeWebhookView.as_view(), name='stripe-webhook'),
    path('', include(router.urls)),
]