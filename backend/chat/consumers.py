import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from .models import ChatRoom, Message


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'
        self.user = self.scope.get('user')

        print(f'[WS] Connect attempt: room={self.room_id}, user={getattr(self.user, "username", "None")}')

        if not self.user or isinstance(self.user, AnonymousUser) or not self.user.is_authenticated:
            print('[WS] Rejecting anonymous user')
            await self.close()
            return

        in_room = await self.user_in_room(self.user.id, self.room_id)
        if not in_room:
            print(f'[WS] User {self.user.username} is not in room {self.room_id}')
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        print(f'[WS] Accepted user {self.user.username} for room {self.room_id}')

    async def disconnect(self, close_code):
        print(f'[WS] Disconnect: room={self.room_id}, code={close_code}')
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return

        # Respond to keepalive pings
        if data.get('type') == 'ping':
            await self.send(text_data=json.dumps({'type': 'pong'}))
            return

        content = (data.get('message') or '').strip()
        if not content:
            return

        msg = await self.save_message(self.user.id, self.room_id, content)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'id': msg['id'],
                'message': msg['content'],
                'sender_id': msg['sender_id'],
                'sender_name': msg['sender_name'],
                'timestamp': msg['created_at'],
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def save_message(self, user_id, room_id, content):
        from accounts.models import User
        user = User.objects.get(id=user_id)
        room = ChatRoom.objects.get(id=room_id)
        msg = Message.objects.create(room=room, sender=user, content=content)
        return {
            'id': msg.id,
            'content': msg.content,
            'sender_id': user.id,
            'sender_name': user.get_full_name() or user.username,
            'created_at': msg.created_at.isoformat(),
        }

    @database_sync_to_async
    def user_in_room(self, user_id, room_id):
        return ChatRoom.objects.filter(id=room_id, participants__id=user_id).exists()