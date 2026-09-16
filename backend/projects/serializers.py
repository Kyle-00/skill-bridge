from rest_framework import serializers
from accounts.serializers import UserSerializer
from .models import Project, Proposal, Milestone


class ProjectSerializer(serializers.ModelSerializer):
    client = UserSerializer(read_only=True)
    proposal_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = ['client', 'status', 'created_at', 'updated_at']

    def get_proposal_count(self, obj):
        return obj.proposals.count()


class ProposalSerializer(serializers.ModelSerializer):
    freelancer = UserSerializer(read_only=True)
    project_title = serializers.SerializerMethodField()

    class Meta:
        model = Proposal
        fields = '__all__'
        read_only_fields = ['freelancer', 'status', 'created_at']

    def get_project_title(self, obj):
        return obj.project.title if obj.project else None


class MilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Milestone
        fields = '__all__'
        read_only_fields = ['status', 'funded_at', 'submitted_at', 'approved_at']