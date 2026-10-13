from django.urls import path
from .views import AdminPlatformStatsView, FreelancerStatsView

urlpatterns = [
    path('admin-stats/', AdminPlatformStatsView.as_view(), name='admin-platform-stats'),
    path('freelancer-stats/', FreelancerStatsView.as_view(), name='freelancer-stats'),
]