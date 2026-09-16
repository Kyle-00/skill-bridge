from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GigViewSet, AdminGigViewSet

router = DefaultRouter()
router.register(r'', GigViewSet, basename='gig')

admin_router = DefaultRouter()
admin_router.register(r'', AdminGigViewSet, basename='admin-gig')

urlpatterns = [
    path('admin/', include(admin_router.urls)),
    path('', include(router.urls)),
]