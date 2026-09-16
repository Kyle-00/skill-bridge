import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import ChatRoom, Message
from accounts.models import User

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        msg = await self.save_message(self.scope['user'], data['message'])
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': msg['content'],
                'sender': msg['sender__username'],
                'timestamp': msg['created_at']
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def save_message(self, user, content):
        room = ChatRoom.objects.get(id=self.room_id)
        msg = Message.objects.create(room=room, sender=user, content=content)
        return {
            'content': msg.content,
            'sender__username': msg.sender.username,
            'created_at': msg.created_at.isoformat()
        }