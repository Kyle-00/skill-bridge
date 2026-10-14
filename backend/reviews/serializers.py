from rest_framework import serializers
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.SerializerMethodField()
    reviewee_name = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            'id',
            'order',
            'reviewer',
            'reviewer_name',
            'reviewee',
            'reviewee_name',
            'quality',
            'communication',
            'timeliness',
            'professionalism',
            'comment',
            'reviewer_role',
            'is_verified',
            'created_at',
        ]
        read_only_fields = [
            'reviewer',
            'reviewee',       # set by perform_create
            'reviewer_role',  # set by perform_create
            'is_verified',
            'created_at',
        ]

    def get_reviewer_name(self, obj):
        if not obj.reviewer:
            return ''
        full = f'{obj.reviewer.first_name} {obj.reviewer.last_name}'.strip()
        return full or obj.reviewer.username

    def get_reviewee_name(self, obj):
        if not obj.reviewee:
            return ''
        full = f'{obj.reviewee.first_name} {obj.reviewee.last_name}'.strip()
        return full or obj.reviewee.username