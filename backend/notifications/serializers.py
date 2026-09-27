from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    actor_name = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ['id', 'verb', 'message', 'target', 'is_read',
                  'actor_name', 'created_at']
        read_only_fields = ['verb', 'message', 'target', 'actor_name', 'created_at']

    def get_actor_name(self, obj):
        if not obj.actor:
            return ''
        full = f'{obj.actor.first_name} {obj.actor.last_name}'.strip()
        return full or obj.actor.username