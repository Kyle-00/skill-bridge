from decimal import Decimal
from django.db import models
from django.db import transaction as db_transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.models import User
from gigs.models import Gig
from projects.models import Project, Proposal
from chat.models import ChatRoom
from notifications.models import Notification
from wallet.models import Wallet, Transaction as WalletTransaction

from .models import Order, Transaction
from .serializers import OrderSerializer, TransactionSerializer
from .services.mpesa import stk_push
from .services.stripe import create_payment_intent


PLATFORM_FEE_RATE = Decimal('0.05')


def get_or_create_room(user_a, user_b):
    room = ChatRoom.objects.filter(participants=user_a).filter(participants=user_b).first()
    if room:
        return room
    room = ChatRoom.objects.create()
    room.participants.add(user_a, user_b)
    return room


def notify(recipient, actor, verb, target=''):
    Notification.objects.create(
        recipient=recipient,
        actor=actor,
        verb=verb,
        target=target,
    )


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Order.objects.filter(
            models.Q(client=user) | models.Q(freelancer=user)
        ).distinct().order_by('-created_at')

    @action(detail=False, methods=['post'], url_path='buy-gig')
    def buy_gig(self, request):
        gig_id = request.data.get('gig_id')
        if not gig_id:
            return Response({'error': 'gig_id is required'}, status=400)

        gig = get_object_or_404(Gig, id=gig_id, is_active=True)

        if gig.freelancer_id == request.user.id:
            return Response({'error': 'You cannot buy your own gig'}, status=400)

        total_amount = Decimal(str(gig.price))
        platform_fee = (total_amount * PLATFORM_FEE_RATE).quantize(Decimal('0.01'))

        with db_transaction.atomic():
            order = Order.objects.create(
                order_type='gig',
                gig=gig,
                client=request.user,
                freelancer=gig.freelancer,
                total_amount=total_amount,
                platform_fee=platform_fee,
                status='pending',
            )
            room = get_or_create_room(request.user, gig.freelancer)
            notify(gig.freelancer, request.user, 'new_order', f'/orders/{order.id}')

        return Response({
            'order': self.get_serializer(order).data,
            'chat_room_id': room.id,
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='fund-escrow')
    def fund_escrow(self, request, pk=None):
        order = self.get_object()

        if order.client_id != request.user.id:
            return Response({'error': 'Only the client can fund this order'}, status=403)
        if order.escrow_funded:
            return Response({'error': 'Escrow already funded'}, status=400)

        method = request.data.get('payment_method')

        if method == 'mpesa':
            phone = request.data.get('phone_number')
            if not phone:
                return Response({'error': 'Phone number required'}, status=400)
            return Response(stk_push(phone, order.total_amount, order.id))
        elif method == 'stripe':
            secret = create_payment_intent(order, request.user.email)
            return Response({'client_secret': secret})

        return Response({'error': 'Invalid payment method'}, status=400)

    @action(detail=True, methods=['post'], url_path='mark-funded')
    def mark_funded(self, request, pk=None):
        order = self.get_object()
        if order.client_id != request.user.id:
            return Response({'error': 'Not allowed'}, status=403)

        order.escrow_funded = True
        order.status = 'in_progress'
        order.funded_at = timezone.now()
        order.save()

        notify(order.freelancer, request.user, 'order_funded', f'/orders/{order.id}')
        return Response(self.get_serializer(order).data)

    @action(detail=True, methods=['post'], url_path='submit-work')
    def submit_work(self, request, pk=None):
        order = self.get_object()
        if order.freelancer_id != request.user.id:
            return Response({'error': 'Only the freelancer can submit work'}, status=403)

        deliverable_url = request.data.get('deliverable_url', '').strip()
        deliverable_message = request.data.get('deliverable_message', '').strip()

        if not deliverable_url and not deliverable_message:
            return Response(
                {'error': 'Provide a deliverable URL or a message.'},
                status=400,
            )

        order.deliverable_url = deliverable_url
        order.deliverable_message = deliverable_message
        order.delivered_at = timezone.now()
        order.status = 'delivered'
        order.save()

        notify(order.client, request.user, 'work_delivered', f'/orders/{order.id}')
        return Response(self.get_serializer(order).data)

    @action(detail=True, methods=['post'], url_path='approve-work')
    def approve_work(self, request, pk=None):
        order = self.get_object()
        if order.client_id != request.user.id:
            return Response({'error': 'Only the client can approve'}, status=403)

        if order.status != 'delivered':
            return Response(
                {'error': 'Work has not been delivered yet.'},
                status=400,
            )

        with db_transaction.atomic():
            freelancer_wallet, _ = Wallet.objects.get_or_create(user=order.freelancer)
            payout = order.total_amount - order.platform_fee
            freelancer_wallet.balance += payout
            freelancer_wallet.save()

            WalletTransaction.objects.create(
                wallet=freelancer_wallet,
                transaction_type='escrow',
                amount=payout,
                status='success',
                description=f'Payment for order #{order.id}',
                reference=f'ORDER-{order.id}',
            )

            order.status = 'completed'
            order.completed_at = timezone.now()
            order.save()

            notify(order.freelancer, request.user, 'payment_released', f'/orders/{order.id}')

        return Response(self.get_serializer(order).data)


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all().order_by('-created_at')
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]


class AdminOrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        order = self.get_object()
        order.status = 'cancelled'
        order.save()
        return Response({'status': order.status})