from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve

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
    path('api/v1/matching/', include('matching.urls')),
    path('api/v1/uploads/', include('uploads.urls')),
]

# Serve uploaded media locally when not using S3 (dev / no bucket configured)
if not settings.AWS_STORAGE_BUCKET_NAME:
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    ]