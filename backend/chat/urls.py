from rest_framework.routers import DefaultRouter
from .views import ChatRoomViewSet, MessageViewSet

router = DefaultRouter()
router.register(r'rooms', ChatRoomViewSet)
router.register(r'messages', MessageViewSet)
urlpatterns = router.urls