from rest_framework import serializers
from .models import Gig


class GigSerializer(serializers.ModelSerializer):
    freelancer_name = serializers.SerializerMethodField()
    freelancer_username = serializers.SerializerMethodField()
    freelancer_title = serializers.SerializerMethodField()

    class Meta:
        model = Gig
        fields = '__all__'
        read_only_fields = ['freelancer', 'views', 'clicks', 'created_at', 'updated_at']

    def get_freelancer_name(self, obj):
        full = f'{obj.freelancer.first_name} {obj.freelancer.last_name}'.strip()
        return full or obj.freelancer.username

    def get_freelancer_username(self, obj):
        return obj.freelancer.username

    def get_freelancer_title(self, obj):
        profile = getattr(obj.freelancer, 'freelancer_profile', None)
        return profile.title if profile else ''