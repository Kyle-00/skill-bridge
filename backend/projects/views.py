from decimal import Decimal
from django.db import transaction as db_transaction
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions, filters, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from orders.models import Order
from chat.models import ChatRoom
from notifications.models import Notification

from .models import Project, Proposal, Milestone
from .serializers import (
    ProjectSerializer, ProposalSerializer, MilestoneSerializer,
)


PLATFORM_FEE_RATE = Decimal('0.05')


def get_or_create_room(user_a, user_b):
    room = (
        ChatRoom.objects.filter(participants=user_a)
        .filter(participants=user_b)
        .first()
    )
    if room:
        return room
    room = ChatRoom.objects.create()
    room.participants.add(user_a, user_b)
    return room


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().order_by('-created_at')
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category', 'status']
    search_fields = ['title', 'description']

    def get_queryset(self):
        queryset = super().get_queryset()
        client_id = self.request.query_params.get('client')
        if client_id:
            queryset = queryset.filter(client_id=client_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(client=self.request.user)

    @action(detail=True, methods=['get'], url_path='proposals-list')
    def proposals_list(self, request, pk=None):
        project = self.get_object()
        if project.client_id != request.user.id:
            return Response({'error': 'Not allowed'}, status=403)
        proposals = project.proposals.all().order_by('-created_at')
        return Response(ProposalSerializer(proposals, many=True).data)

    @action(detail=True, methods=['post'], url_path='accept-proposal')
    def accept_proposal(self, request, pk=None):
        project = self.get_object()

        if project.client_id != request.user.id:
            return Response(
                {'error': 'Only the project owner can accept proposals'},
                status=403,
            )

        if project.status != 'open':
            return Response(
                {'error': 'Project is no longer open'},
                status=400,
            )

        proposal_id = request.data.get('proposal_id')
        if not proposal_id:
            return Response(
                {'error': 'proposal_id is required'},
                status=400,
            )

        proposal = get_object_or_404(Proposal, id=proposal_id, project=project)

        with db_transaction.atomic():
            proposal.status = 'accepted'
            proposal.save()

            # Auto-reject all other proposals on this project
            project.proposals.exclude(id=proposal.id).update(status='rejected')

            project.status = 'in_progress'
            project.save()

            total = Decimal(str(proposal.proposed_price))
            fee = (total * PLATFORM_FEE_RATE).quantize(Decimal('0.01'))

            order = Order.objects.create(
                order_type='project',
                project=project,
                client=request.user,
                freelancer=proposal.freelancer,
                total_amount=total,
                platform_fee=fee,
                status='pending',
            )

            room = get_or_create_room(request.user, proposal.freelancer)

            Notification.objects.create(
                recipient=proposal.freelancer,
                actor=request.user,
                verb='proposal_accepted',
                target=f'/orders/{order.id}',
            )

        return Response({
            'status': 'accepted',
            'order_id': order.id,
            'chat_room_id': room.id,
        })


class ProposalViewSet(viewsets.ModelViewSet):
    queryset = Proposal.objects.all().order_by('-created_at')
    serializer_class = ProposalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        project_id = self.request.data.get('project')

        if not project_id:
            raise serializers.ValidationError(
                {'project': 'This field is required.'}
            )

        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            raise serializers.ValidationError(
                {'project': 'Project does not exist.'}
            )

        if project.client_id == self.request.user.id:
            raise serializers.ValidationError(
                {'project': 'You cannot bid on your own project.'}
            )

        if project.status != 'open':
            raise serializers.ValidationError(
                {'project': 'This project is no longer accepting proposals.'}
            )

        if Proposal.objects.filter(
            project=project, freelancer=self.request.user
        ).exists():
            raise serializers.ValidationError(
                {'project': 'You already submitted a proposal for this project.'}
            )

        proposal = serializer.save(
            freelancer=self.request.user,
            project=project,
        )

        Notification.objects.create(
            recipient=project.client,
            actor=self.request.user,
            verb='new_proposal',
            target=f'/projects/{project.id}/manage',
        )
        return proposal


class MilestoneViewSet(viewsets.ModelViewSet):
    queryset = Milestone.objects.all().order_by('-id')
    serializer_class = MilestoneSerializer
    permission_classes = [permissions.IsAuthenticated]


class AdminProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().order_by('-created_at')
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        project = self.get_object()
        project.status = 'cancelled'
        project.save()
        return Response({'status': project.status})