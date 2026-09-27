from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ChatRoom, Message
from .serializers import ChatRoomSerializer, MessageSerializer


class ChatRoomViewSet(viewsets.ModelViewSet):
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ChatRoom.objects.filter(
            participants=self.request.user
        ).order_by('-created_at')

    def get_serializer_context(self):
        return {'request': self.request}

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        room = self.get_object()
        room.messages.filter(is_read=False).exclude(sender=request.user).update(is_read=True)
        return Response({'status': 'ok'})

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        count = Message.objects.filter(
            room__participants=request.user, is_read=False
        ).exclude(sender=request.user).count()
        return Response({'unread': count})


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        room_id = self.request.query_params.get('room')
        since = self.request.query_params.get('since')

        qs = Message.objects.filter(room__participants=self.request.user)
        if room_id:
            qs = qs.filter(room_id=room_id)
        if since:
            try:
                qs = qs.filter(id__gt=int(since))
            except (ValueError, TypeError):
                pass
        return qs.order_by('created_at')

    def perform_create(self, serializer):
        msg = serializer.save(sender=self.request.user)

        # Notify the other participant
        try:
            from notifications.models import Notification
            for p in msg.room.participants.all():
                if p.id != self.request.user.id:
                    sender_name = self.request.user.get_full_name() or self.request.user.username
                    Notification.objects.create(
                        recipient=p,
                        actor=self.request.user,
                        verb='new_message',
                        message=f'New message from {sender_name}',
                        target=f'/chat/{msg.room.id}',
                    )
        except Exception:
            pass