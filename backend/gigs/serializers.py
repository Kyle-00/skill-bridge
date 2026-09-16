from rest_framework import serializers
from .models import Gig

class GigSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gig
        fields = '__all__'
        read_only_fields = ['freelancer', 'views', 'clicks', 'created_at']