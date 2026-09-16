from django.urls import path
from .views import AdminPlatformStatsView

urlpatterns = [
    path('admin-stats/', AdminPlatformStatsView.as_view(), name='admin-platform-stats'),
]