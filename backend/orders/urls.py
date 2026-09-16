from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, TransactionViewSet, AdminOrderViewSet


router = DefaultRouter()
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'', OrderViewSet, basename='order')

admin_router = DefaultRouter()
admin_router.register(r'', AdminOrderViewSet, basename='admin-order')

urlpatterns = [
    path('admin/', include(admin_router.urls)),
    path('', include(router.urls)),
]