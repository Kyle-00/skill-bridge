from decimal import Decimal
import json
import traceback
from django.core.cache import cache
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

from .models import Order, OrderMilestone, Transaction
from .serializers import OrderSerializer, TransactionSerializer
from .services.mpesa import stk_push
from .services.stripe import create_payment_intent


def get_platform_fee_rate(user):
    if user and user.has_active_pro_plan():
        return Decimal('0.03')
    return Decimal('0.05')


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


def safe_notify(recipient, actor, verb, message, target=''):
    try:
        notify(recipient, actor, verb, message, target)
    except Exception as e:
        print(f'Notification failed (non-fatal): {e}')


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Order.objects.filter(
            models.Q(client=user) | models.Q(freelancer=user)
        ).distinct().order_by('-created_at')

    # -----------------------------------------------------------------------
    # BUY GIG
    # -----------------------------------------------------------------------
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
            status__in=['pending', 'funded', 'in_progress', 'delivered'],
        ).first()
        if existing:
            return Response(
                {'error': 'You already have an active order for this gig.',
                 'order_id': existing.id},
                status=400,
            )

        total_amount = Decimal(str(gig.price))
        fee_rate = get_platform_fee_rate(gig.freelancer)
        platform_fee = (total_amount * fee_rate).quantize(Decimal('0.01'))

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
        safe_notify(
            gig.freelancer, request.user, 'order_created',
            f'{client_name} ordered your gig "{gig.title}"',
            f'/orders/{order.id}',
        )

        return Response(
            {'order': self.get_serializer(order).data, 'chat_room_id': room.id},
            status=status.HTTP_201_CREATED,
        )

    # -----------------------------------------------------------------------
    # FUND ESCROW
    # -----------------------------------------------------------------------
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
                    return Response(
                        {'error': 'Phone number is required for M-Pesa'},
                        status=400,
                    )
                result = stk_push(phone, amount, order.id)
                if result.get('ResponseCode') == '0':
                    checkout_id = result.get('CheckoutRequestID')
                    if checkout_id:
                        cache.set(
                            f'mpesa_order_{checkout_id}', order.id, timeout=3600
                        )
                    Transaction.objects.create(
                        order=order,
                        amount=amount,
                        provider='mpesa',
                        provider_ref=checkout_id or '',
                        status='pending',
                    )
                    return Response({
                        'status': 'pending',
                        'message': 'STK push sent. Enter your M-Pesa PIN.',
                        'checkout_request_id': checkout_id,
                    })
                return Response(
                    {'error': result.get('errorMessage')
                     or result.get('ResponseDescription', 'STK push failed')},
                    status=400,
                )

            elif payment_method == 'stripe':
                client_secret = create_payment_intent(amount, order.id)
                Transaction.objects.create(
                    order=order,
                    amount=amount,
                    provider='stripe',
                    status='pending',
                )
                return Response({
                    'client_secret': client_secret,
                    'amount': float(amount),
                })

            else:  # wallet
                wallet, _ = Wallet.objects.get_or_create(user=request.user)
                if wallet.balance < amount:
                    return Response(
                        {'error': 'Insufficient wallet balance'}, status=400
                    )
                with db_transaction.atomic():
                    wallet.balance -= amount
                    wallet.save()
                    # Valid transaction_type from the choices: 'escrow'
                    WalletTransaction.objects.create(
                        wallet=wallet,
                        amount=-amount,
                        transaction_type='escrow',
                        status='success',
                        description=f'Funded escrow for order #{order.id}',
                        reference=f'ORDER-{order.id}',
                    )
                    order.escrow_funded = True
                    order.status = 'in_progress'
                    order.funded_at = timezone.now()
                    order.save()
                    Transaction.objects.create(
                        order=order,
                        amount=amount,
                        provider='wallet',
                        status='success',
                    )

                safe_notify(
                    order.freelancer, request.user, 'escrow_funded',
                    f'Escrow funded for order #{order.id}. You can start working.',
                    f'/orders/{order.id}',
                )
                return Response({'message': 'Escrow funded successfully'})

        except Exception as e:
            traceback.print_exc()
            return Response({'error': str(e)}, status=500)

    # -----------------------------------------------------------------------
    # MARK FUNDED
    # -----------------------------------------------------------------------
    @action(detail=True, methods=['post'], url_path='mark-funded')
    def mark_funded(self, request, pk=None):
        order = self.get_object()
        if order.client_id != request.user.id:
            return Response({'error': 'Only the client can mark as funded'}, status=403)
        if order.escrow_funded:
            return Response({'error': 'Already funded'}, status=400)
        try:
            with db_transaction.atomic():
                order.escrow_funded = True
                order.status = 'in_progress'
                order.funded_at = timezone.now()
                order.save()
                Transaction.objects.filter(order=order, status='pending').update(
                    status='success'
                )

            safe_notify(
                order.freelancer, request.user, 'escrow_funded',
                f'Escrow funded for order #{order.id}. You can start working.',
                f'/orders/{order.id}',
            )
            return Response({'message': 'Escrow marked as funded'})
        except Exception as e:
            traceback.print_exc()
            return Response({'error': str(e)}, status=500)

    # -----------------------------------------------------------------------
    # SUBMIT WORK
    # -----------------------------------------------------------------------
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
            try:
                from uploads.services import save_upload
                file_obj = request.FILES['deliverable_file']
                deliverable_url = save_upload(file_obj, folder='deliverables')
            except Exception as e:
                return Response(
                    {'error': f'File upload failed: {e}'}, status=400
                )

        order.deliverable_message = deliverable_message
        order.deliverable_url = deliverable_url
        order.status = 'delivered'
        order.delivered_at = timezone.now()
        order.save()

        safe_notify(
            order.client, request.user, 'work_delivered',
            f'Work delivered for order #{order.id}. Review and approve.',
            f'/orders/{order.id}',
        )
        return Response({'message': 'Work submitted'})

    # -----------------------------------------------------------------------
    # APPROVE WORK — the fix
    # -----------------------------------------------------------------------
    @action(detail=True, methods=['post'], url_path='approve-work')
    def approve_work(self, request, pk=None):
        order = self.get_object()
        if order.client_id != request.user.id:
            return Response({'error': 'Only the client can approve work'}, status=403)
        if order.status != 'delivered':
            return Response({'error': 'Order is not delivered yet'}, status=400)

        try:
            with db_transaction.atomic():
                freelancer_wallet, _ = Wallet.objects.get_or_create(
                    user=order.freelancer
                )
                payout = order.total_amount - order.platform_fee

                # Add funds to freelancer's wallet
                freelancer_wallet.balance += payout
                freelancer_wallet.save()

                # Correct transaction_type ('escrow' is a valid choice)
                # and correct reference field (no order_id in the model)
                WalletTransaction.objects.create(
                    wallet=freelancer_wallet,
                    amount=payout,
                    transaction_type='escrow',
                    status='success',
                    description=f'Payment received for order #{order.id}',
                    reference=f'ORDER-{order.id}',
                )

                # Mark the order completed
                order.status = 'completed'
                order.completed_at = timezone.now()
                order.save()

                # Mark related order Transactions as successful
                Transaction.objects.filter(order=order, status='pending').update(
                    status='success'
                )

            safe_notify(
                order.freelancer, request.user, 'work_approved',
                f'Your work for order #{order.id} was approved. '
                f'${payout} was added to your wallet.',
                f'/orders/{order.id}',
            )

            return Response({
                'message': 'Work approved and funds released to freelancer.',
                'payout': str(payout),
                'freelancer_wallet_balance': str(freelancer_wallet.balance),
            })

        except Exception as e:
            traceback.print_exc()
            return Response({'error': str(e)}, status=500)

    # -----------------------------------------------------------------------
    # CANCEL — refund to client
    # -----------------------------------------------------------------------
    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel(self, request, pk=None):
        order = self.get_object()
        if request.user.id not in (order.client_id, order.freelancer_id):
            return Response({'error': 'Not allowed'}, status=403)
        if order.status == 'completed':
            return Response({'error': 'Cannot cancel a completed order'}, status=400)
        if order.status == 'cancelled':
            return Response({'error': 'Order is already cancelled'}, status=400)

        refund_done = False
        refund_error = None

        if order.escrow_funded:
            try:
                client_wallet, _ = Wallet.objects.get_or_create(user=order.client)
                with db_transaction.atomic():
                    client_wallet.balance += order.total_amount
                    client_wallet.save()
                    WalletTransaction.objects.create(
                        wallet=client_wallet,
                        amount=order.total_amount,
                        transaction_type='refund',
                        status='success',
                        description=f'Refund for cancelled order #{order.id}',
                        reference=f'ORDER-{order.id}',
                    )
                refund_done = True
            except Exception as e:
                traceback.print_exc()
                refund_error = str(e)

        order.status = 'cancelled'
        order.save()

        other_party = (
            order.freelancer if request.user.id == order.client_id else order.client
        )
        safe_notify(
            other_party, request.user, 'order_cancelled',
            f'Order #{order.id} was cancelled.',
            f'/orders/{order.id}',
        )

        return Response({
            'message': (
                'Order cancelled and escrow refunded.'
                if refund_done
                else 'Order cancelled.'
            ),
            'refunded': refund_done,
            'refund_error': refund_error,
        })

    # -----------------------------------------------------------------------
    # DISPUTE
    # -----------------------------------------------------------------------
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

        safe_notify(
            order.freelancer if request.user.id == order.client_id else order.client,
            request.user, 'order_disputed',
            f'Order #{order.id} was disputed: {reason}',
            f'/orders/{order.id}',
        )
        return Response({'message': 'Dispute opened'})

    # -----------------------------------------------------------------------
    # MILESTONES
    # -----------------------------------------------------------------------
    @action(detail=True, methods=['get', 'post'], url_path='milestones')
    def milestones(self, request, pk=None):
        order = self.get_object()

        if request.method == 'GET':
            qs = order.order_milestones.all()
            return Response([
                {
                    'id': m.id,
                    'title': m.title,
                    'description': m.description,
                    'amount': str(m.amount),
                    'status': m.status,
                    'position': m.position,
                    'created_at': m.created_at,
                }
                for m in qs
            ])

        if request.user.id not in (order.client_id, order.freelancer_id):
            return Response({'error': 'Not allowed'}, status=403)

        title = (request.data.get('title') or '').strip()
        amount = request.data.get('amount')
        description = (request.data.get('description') or '').strip()

        if not title or not amount:
            return Response({'error': 'title and amount are required'}, status=400)

        try:
            amount_dec = Decimal(str(amount))
        except Exception:
            return Response({'error': 'amount must be a number'}, status=400)

        last = order.order_milestones.order_by('-position').first()
        next_pos = (last.position + 1) if last else 1

        milestone = OrderMilestone.objects.create(
            order=order,
            title=title,
            description=description,
            amount=amount_dec,
            position=next_pos,
            status='pending',
        )

        return Response(
            {
                'id': milestone.id,
                'title': milestone.title,
                'description': milestone.description,
                'amount': str(milestone.amount),
                'status': milestone.status,
                'position': milestone.position,
            },
            status=201,
        )

    # -----------------------------------------------------------------------
    # CHAT ROOM
    # -----------------------------------------------------------------------
    @action(detail=True, methods=['get'], url_path='chat-room')
    def chat_room(self, request, pk=None):
        order = self.get_object()
        if request.user.id not in (order.client_id, order.freelancer_id):
            return Response({'error': 'Not allowed'}, status=403)
        room = get_or_create_room(order.client, order.freelancer)
        return Response({'chat_room_id': room.id})


# ---------------------------------------------------------------------------
# Other viewsets
# ---------------------------------------------------------------------------
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
            status='disputed',
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
            stk_callback = data.get('Body', {}).get('stkCallback', {})
            result_code = stk_callback.get('ResultCode')
            checkout_id = stk_callback.get('CheckoutRequestID')

            if result_code == 0 and checkout_id:
                try:
                    tx = WalletTransaction.objects.get(reference=checkout_id)
                    if tx.status == 'pending':
                        with db_transaction.atomic():
                            tx.status = 'success'
                            tx.save()
                            wallet = tx.wallet
                            wallet.balance += tx.amount
                            wallet.save()
                except WalletTransaction.DoesNotExist:
                    pass

                order_id = cache.get(f'mpesa_order_{checkout_id}')
                if order_id:
                    order = Order.objects.filter(id=order_id).first()
                    if order and not order.escrow_funded:
                        order.escrow_funded = True
                        order.status = 'in_progress'
                        order.funded_at = timezone.now()
                        order.save()
                        Transaction.objects.filter(
                            order=order, provider_ref=checkout_id
                        ).update(status='success')
                        safe_notify(
                            order.freelancer, order.client, 'escrow_funded',
                            f'Escrow funded for order #{order.id}. You can start working.',
                            f'/orders/{order.id}',
                        )
                    cache.delete(f'mpesa_order_{checkout_id}')

            elif result_code != 0 and checkout_id:
                Transaction.objects.filter(
                    provider_ref=checkout_id
                ).update(status='failed')

            return Response({'ResultCode': 0, 'ResultDesc': 'Success'})
        except Exception as e:
            print(f'M-Pesa callback error: {e}')
            return Response({'ResultCode': 1, 'ResultDesc': str(e)}, status=400)


@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        payload = request.body
        try:
            event = json.loads(payload)
            if event['type'] == 'payment_intent.succeeded':
                pi = event['data']['object']
                order_id = pi.get('metadata', {}).get('order_id')
                if order_id:
                    order = Order.objects.filter(id=order_id).first()
                    if order and not order.escrow_funded:
                        order.escrow_funded = True
                        order.status = 'in_progress'
                        order.funded_at = timezone.now()
                        order.save()
                        safe_notify(
                            order.freelancer, order.client, 'escrow_funded',
                            f'Escrow funded for order #{order.id}.',
                            f'/orders/{order.id}',
                        )
            return Response({'status': 'success'})
        except Exception as e:
            return Response({'error': str(e)}, status=400)