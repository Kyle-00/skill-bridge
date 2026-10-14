from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView,
    GoogleVerifyView,
    UserProfileView,
    FreelancerProfileView,
    ClientProfileView,
    DeleteAccountView,
    AdminUserListView,
    AdminUserDetailView,
    FreelancerListView,
    EmailOrUsernameTokenObtainPairView,
    ChooseRoleView,
    SubscribeView,
    SubscriptionStatusView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', EmailOrUsernameTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('google/verify/', GoogleVerifyView.as_view(), name='google_verify'),
    path('choose-role/', ChooseRoleView.as_view(), name='choose-role'),

    # Subscriptions
    path('subscribe/', SubscribeView.as_view(), name='subscribe'),
    path('subscription-status/', SubscriptionStatusView.as_view(), name='subscription-status'),

    path('freelancers/', FreelancerListView.as_view(), name='freelancer_list'),

    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('profile/freelancer/', FreelancerProfileView.as_view(), name='freelancer_profile'),
    path('profile/client/', ClientProfileView.as_view(), name='client_profile'),

    path('delete-account/', DeleteAccountView.as_view(), name='delete_account'),

    path('admin/users/', AdminUserListView.as_view(), name='admin_users'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin_user_detail'),
]