from decimal import Decimal
import json
from django.db import models
from django.db import transaction as db_transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from gigs.models import Gig
from projects.models import Project
from chat.models import ChatRoom
from notifications.utils import notify
from wallet.models import Wallet, Transaction as WalletTransaction

from .models import Order, Transaction
from .serializers import OrderSerializer, TransactionSerializer
from .services.mpesa import stk_push
from .services.stripe import create_payment_intent

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

        existing = Order.objects.filter(
            gig=gig,
            client=request.user,
            status__in=['pending', 'in_progress', 'delivered'],
        ).first()
        if existing:
            return Response(
                {
                    'error': 'You already have an active order for this gig.',
                    'order_id': existing.id,
                },
                status=400,
            )

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

        client_name = request.user.get_full_name() or request.user.username
        notify(
            gig.freelancer,
            request.user,
            'order_created',
            f'{client_name} ordered your gig "{gig.title}"',
            f'/orders/{order.id}',
        )

        return Response(
            {
                'order': self.get_serializer(order).data,
                'chat_room_id': room.id,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=['post'], url_path='fund-escrow')
    def fund_escrow(self, request, pk=None):
        order = self.get_object()
        if order.client_id != request.user.id:
            return Response({'error': 'Only the client can fund escrow'}, status=403)
        if order.escrow_funded:
            return Response({'error': 'Escrow is already funded'}, status=400)

        amount = order.total_amount
        payment_method = request.data.get('payment_method', 'wallet')

        try:
            if payment_method == 'mpesa':
                phone = request.data.get('phone')
                if not phone:
                    return Response({'error': 'Phone number is required for M-Pesa'}, status=400)
                stk_push(phone, amount, order.id)
                return Response({'message': 'M-Pesa STK push sent. Await confirmation.'})

            elif payment_method == 'stripe':
                client_secret = create_payment_intent(amount, order.id)
                return Response({'client_secret': client_secret})

            else:  # wallet
                wallet, _ = Wallet.objects.get_or_create(user=request.user)
                if wallet.balance < amount:
                    return Response({'error': 'Insufficient wallet balance'}, status=400)
                wallet.balance -= amount
                wallet.save()
                WalletTransaction.objects.create(
                    wallet=wallet,
                    amount=-amount,
                    transaction_type='escrow_fund',
                    description=f'Funded escrow for order #{order.id}',
                    order_id=order.id,
                )
                order.escrow_funded = True
                order.status = 'in_progress'
                order.funded_at = timezone.now()
                order.save()

                notify(
                    order.freelancer,
                    request.user,
                    'escrow_funded',
                    f'Escrow funded for order #{order.id}. You can start working.',
                    f'/orders/{order.id}',
                )
                return Response({'message': 'Escrow funded successfully'})

        except Exception as e:
            return Response({'error': str(e)}, status=500)

    @action(detail=True, methods=['post'], url_path='mark-funded')
    def mark_funded(self, request, pk=None):
        order = self.get_object()
        if order.client_id != request.user.id:
            return Response({'error': 'Only the client can mark as funded'}, status=403)
        order.escrow_funded = True
        order.status = 'in_progress'
        order.funded_at = timezone.now()
        order.save()
        return Response({'message': 'Escrow marked as funded'})

    @action(detail=True, methods=['post'], url_path='submit-work')
    def submit_work(self, request, pk=None):
        order = self.get_object()
        if order.freelancer_id != request.user.id:
            return Response({'error': 'Only the freelancer can submit work'}, status=403)
        if order.status not in ('in_progress', 'revision'):
            return Response({'error': 'Order is not in a deliverable state'}, status=400)

        deliverable_message = request.data.get('deliverable_message', '')
        deliverable_url = request.data.get('deliverable_url', '')

        if request.FILES.get('deliverable_file'):
            file_obj = request.FILES['deliverable_file']
            from uploads.services import save_upload
            deliverable_url = save_upload(file_obj, folder='deliverables')

        order.deliverable_message = deliverable_message
        order.deliverable_url = deliverable_url
        order.status = 'delivered'
        order.delivered_at = timezone.now()
        order.save()

        notify(
            order.client,
            request.user,
            'work_delivered',
            f'Work delivered for order #{order.id}. Review and approve.',
            f'/orders/{order.id}',
        )
        return Response({'message': 'Work submitted'})

    @action(detail=True, methods=['post'], url_path='approve-work')
    def approve_work(self, request, pk=None):
        order = self.get_object()
        if order.client_id != request.user.id:
            return Response({'error': 'Only the client can approve work'}, status=403)
        if order.status != 'delivered':
            return Response({'error': 'Order is not delivered yet'}, status=400)

        freelancer_wallet, _ = Wallet.objects.get_or_create(user=order.freelancer)
        payout = order.total_amount - order.platform_fee

        with db_transaction.atomic():
            freelancer_wallet.balance += payout
            freelancer_wallet.save()
            WalletTransaction.objects.create(
                wallet=freelancer_wallet,
                amount=payout,
                transaction_type='payout',
                description=f'Payout for order #{order.id}',
                order_id=order.id,
            )
            order.status = 'completed'
            order.completed_at = timezone.now()
            order.save()

        notify(
            order.freelancer,
            request.user,
            'work_approved',
            f'Your work for order #{order.id} was approved. KES {payout} released.',
            f'/orders/{order.id}',
        )
        return Response({'message': 'Work approved and funds released'})

    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel(self, request, pk=None):
        order = self.get_object()
        if request.user.id not in (order.client_id, order.freelancer_id):
            return Response({'error': 'Not allowed'}, status=403)
        if order.status == 'completed':
            return Response({'error': 'Cannot cancel a completed order'}, status=400)

        with db_transaction.atomic():
            if order.escrow_funded:
                client_wallet, _ = Wallet.objects.get_or_create(user=order.client)
                client_wallet.balance += order.total_amount
                client_wallet.save()
                WalletTransaction.objects.create(
                    wallet=client_wallet,
                    amount=order.total_amount,
                    transaction_type='refund',
                    description=f'Refund for cancelled order #{order.id}',
                    order_id=order.id,
                )
            order.status = 'cancelled'
            order.save()

        notify(
            order.freelancer if request.user.id == order.client_id else order.client,
            request.user,
            'order_cancelled',
            f'Order #{order.id} was cancelled.',
            f'/orders/{order.id}',
        )
        return Response({'message': 'Order cancelled'})

    @action(detail=True, methods=['post'], url_path='dispute')
    def dispute(self, request, pk=None):
        order = self.get_object()
        if request.user.id not in (order.client_id, order.freelancer_id):
            return Response({'error': 'Not allowed'}, status=403)
        reason = request.data.get('reason', '')
        if not reason:
            return Response({'error': 'Reason is required'}, status=400)

        order.status = 'disputed'
        order.dispute_reason = reason
        order.save()

        notify(
            order.freelancer if request.user.id == order.client_id else order.client,
            request.user,
            'order_disputed',
            f'Order #{order.id} was disputed: {reason}',
            f'/orders/{order.id}',
        )
        return Response({'message': 'Dispute opened'})


class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Transaction.objects.filter(
            models.Q(order__client=user) | models.Q(order__freelancer=user)
        ).distinct().order_by('-created_at')


class DisputeViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Order.objects.filter(
            models.Q(client=user) | models.Q(freelancer=user),
            status='disputed'
        ).distinct().order_by('-created_at')


class AdminOrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAdminUser]


class AdminDisputeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Order.objects.filter(status='disputed').order_by('-created_at')
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAdminUser]


@method_decorator(csrf_exempt, name='dispatch')
class MpesaCallbackView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            data = request.data
            # STK Push callback structure
            stk_callback = data.get('Body', {}).get('stkCallback', {})
            result_code = stk_callback.get('ResultCode')
            checkout_request_id = stk_callback.get('CheckoutRequestID')
            
            if result_code == 0:
                # Payment successful. Find order via the callback metadata or reference.
                # Assuming order_id is passed as AccountReference in stk_push (truncated to 12 chars)
                # A more robust way is to use the CheckoutRequestID to map to the order.
                # For now, we'll assume the order ID is in the metadata or we search by CheckoutRequestID.
                # In a real app, you'd store the CheckoutRequestID in the Order model.
                # Let's just log it for now.
                print(f"M-Pesa Payment successful for CheckoutRequestID: {checkout_request_id}")
                # Logic to find order and mark as funded goes here.
                # For demonstration, we'll just return success.
            return Response({'ResultCode': 0, 'ResultDesc': 'Success'})
        except Exception as e:
            return Response({'ResultCode': 1, 'ResultDesc': str(e)}, status=400)


@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        # In a real app, verify the webhook signature using STRIPE_WEBHOOK_SECRET
        try:
            event = json.loads(payload)
            if event['type'] == 'payment_intent.succeeded':
                payment_intent = event['data']['object']
                order_id = payment_intent.get('metadata', {}).get('order_id')
                if order_id:
                    order = Order.objects.filter(id=order_id).first()
                    if order and not order.escrow_funded:
                        order.escrow_funded = True
                        order.status = 'in_progress'
                        order.funded_at = timezone.now()
                        order.save()
                        notify(
                            order.freelancer,
                            order.client,
                            'escrow_funded',
                            f'Escrow funded via Stripe for order #{order.id}. You can start working.',
                            f'/orders/{order.id}',
                        )
            return Response({'status': 'success'})
        except Exception as e:
            return Response({'error': str(e)}, status=400)