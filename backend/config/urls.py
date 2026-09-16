from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/accounts/', include('accounts.urls')),
    path('api/v1/gigs/', include('gigs.urls')),
    path('api/v1/projects/', include('projects.urls')),
    path('api/v1/orders/', include('orders.urls')),
    path('api/v1/reviews/', include('reviews.urls')),
    path('api/v1/chat/', include('chat.urls')),
    path('api/v1/notifications/', include('notifications.urls')),
    path('api/v1/analytics/', include('analytics.urls')),
    path('api/v1/wallet/', include('wallet.urls')),
]