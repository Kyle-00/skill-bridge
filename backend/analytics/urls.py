from django.urls import path
from .views import AdminPlatformStatsView, FreelancerStatsView, ClientStatsView

urlpatterns = [
    path('admin-stats/', AdminPlatformStatsView.as_view(), name='admin-stats'),
    path('freelancer-stats/', FreelancerStatsView.as_view(), name='freelancer-stats'),
    path('client-stats/', ClientStatsView.as_view(), name='client-stats'),
]