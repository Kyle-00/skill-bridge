import os

from django.core.asgi import get_asgi_application

# 1. Set the settings module BEFORE any Django-related import
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# 2. Initialize Django's AppRegistry FIRST
#    This must happen before importing anything that touches models
django_asgi_app = get_asgi_application()

# 3. Now it is safe to import Channels and your app modules
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from chat.routing import websocket_urlpatterns

# 4. Wire up the protocol router
application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})