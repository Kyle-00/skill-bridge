from rest_framework import serializers
from accounts.serializers import UserSerializer
from .models import Order, Transaction


class OrderSerializer(serializers.ModelSerializer):
    client = UserSerializer(read_only=True)
    freelancer = UserSerializer(read_only=True)
    gig_title = serializers.SerializerMethodField()
    project_title = serializers.SerializerMethodField()
    chat_room_id = serializers.SerializerMethodField()
    has_review = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = [
            'client', 'freelancer', 'platform_fee',
            'escrow_funded', 'funded_at', 'delivered_at',
            'completed_at', 'created_at',
        ]

    def get_gig_title(self, obj):
        return obj.gig.title if obj.gig else None

    def get_project_title(self, obj):
        return obj.project.title if obj.project else None

    def get_chat_room_id(self, obj):
        from chat.models import ChatRoom
        room = ChatRoom.objects.filter(
            participants=obj.client
        ).filter(participants=obj.freelancer).first()
        return room.id if room else None

    def get_has_review(self, obj):
        return obj.reviews.exists()


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = ['created_at']