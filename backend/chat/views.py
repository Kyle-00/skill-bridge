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

    @action(detail=False, methods=['post'])
    def start(self, request):
        other_user_id = request.data.get('user_id')
        if not other_user_id:
            return Response({'error': 'user_id is required'}, status=400)

        if int(other_user_id) == request.user.id:
            return Response({'error': 'Cannot chat with yourself'}, status=400)

        room = ChatRoom.objects.filter(
            participants=request.user
        ).filter(participants__id=other_user_id).first()

        if not room:
            room = ChatRoom.objects.create()
            room.participants.add(request.user, other_user_id)

        return Response(ChatRoomSerializer(room).data)


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        room_id = self.request.query_params.get('room')
        qs = Message.objects.filter(room__participants=self.request.user)
        if room_id:
            qs = qs.filter(room_id=room_id)
        return qs.order_by('created_at')

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)