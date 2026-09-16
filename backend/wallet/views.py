import json
import stripe
from datetime import timedelta
from decimal import Decimal, InvalidOperation
from django.conf import settings
from django.db import transaction
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Wallet, Transaction
from .serializers import (
    WalletSerializer, TransactionSerializer,
    SetPinSerializer, ChangePinSerializer,
)
from .services.exchange import get_usd_to_kes_rate

stripe.api_key = settings.STRIPE_SECRET_KEY


# =============================================================
# HELPER: Auto-expire stale pending transactions
# =============================================================
def expire_stale_pending_transactions(minutes=10):
    """
    Marks any pending transaction older than `minutes` as failed.
    Prevents transactions from being stuck in 'pending' forever
    when a payment provider never sends the callback.
    """
    cutoff = timezone.now() - timedelta(minutes=minutes)
    stale = Transaction.objects.filter(
        status='pending',
        created_at__lt=cutoff,
    )
    count = stale.count()
    if count:
        stale.update(
            status='failed',
            description='Timed out — no callback received from payment provider',
        )
        print(f'⏰ Auto-expired {count} stale pending transaction(s)')
    return count


# =============================================================
# WALLET VIEWSET
# =============================================================
class WalletViewSet(viewsets.ModelViewSet):
    serializer_class = WalletSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Wallet.objects.filter(user=self.request.user)

    def _get_wallet(self, user):
        wallet, _ = Wallet.objects.get_or_create(user=user)
        return wallet

    def _to_decimal(self, value):
        try:
            return Decimal(str(value))
        except (InvalidOperation, TypeError, ValueError):
            return None

    # ---------- BALANCE ----------
    @action(detail=False, methods=['get'])
    def balance(self, request):
        expire_stale_pending_transactions()
        wallet = self._get_wallet(request.user)
        return Response({
            'balance': float(wallet.balance),
            'wallet_id': wallet.wallet_id,
            'currency': wallet.currency,
            'has_pin': wallet.has_pin(),
        })

    # ---------- PIN MANAGEMENT ----------
    @action(detail=False, methods=['post'])
    def set_pin(self, request):
        wallet = self._get_wallet(request.user)
        serializer = SetPinSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if wallet.has_pin():
            old_pin = serializer.validated_data.get('old_pin', '')
            if not wallet.check_pin(old_pin):
                return Response({'error': 'Current PIN is incorrect.'}, status=400)

        wallet.set_pin(serializer.validated_data['pin'])
        return Response({'status': 'PIN set successfully'})

    @action(detail=False, methods=['post'])
    def change_pin(self, request):
        wallet = self._get_wallet(request.user)
        serializer = ChangePinSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if not wallet.check_pin(serializer.validated_data['old_pin']):
            return Response({'error': 'Current PIN is incorrect.'}, status=400)

        wallet.set_pin(serializer.validated_data['new_pin'])
        return Response({'status': 'PIN changed successfully'})

    # ---------- DEPOSIT (legacy) ----------
    @action(detail=False, methods=['post'])
    def deposit(self, request):
        amount = self._to_decimal(request.data.get('amount', 0))
        payment_method = request.data.get('payment_method', 'stripe')

        if amount is None or amount <= 0:
            return Response({'error': 'Amount must be greater than 0'}, status=400)

        wallet = self._get_wallet(request.user)
        tx = Transaction.objects.create(
            wallet=wallet,
            transaction_type='deposit',
            amount=amount,
            status='success',
            description=f'Deposit via {payment_method}',
        )
        wallet.balance += amount
        wallet.save()
        return Response({
            'status': 'success',
            'balance': float(wallet.balance),
            'transaction_id': tx.id,
        })

    # ---------- WITHDRAW ----------
    @action(detail=False, methods=['post'])
    def withdraw(self, request):
        amount = self._to_decimal(request.data.get('amount', 0))
        method = request.data.get('method', 'mpesa')
        phone = request.data.get('phone_number', '')
        bank_name = request.data.get('bank_name', '')
        bank_account = request.data.get('bank_account', '')
        pin = str(request.data.get('pin', ''))

        wallet = self._get_wallet(request.user)

        if not wallet.has_pin():
            return Response({'error': 'Please set a wallet PIN first.'}, status=400)
        if not wallet.check_pin(pin):
            return Response({'error': 'Invalid PIN.'}, status=400)
        if amount is None or amount <= 0:
            return Response({'error': 'Amount must be greater than 0'}, status=400)
        if wallet.balance < amount:
            return Response({'error': 'Insufficient balance'}, status=400)

        fee_rate = Decimal('0.015') if method == 'mpesa' else Decimal('0.02')
        fee = (amount * fee_rate).quantize(Decimal('0.01'))
        net = amount - fee

        description = f'Withdrawal via {method.upper()}'

        if method == 'mpesa' and phone:
            digits = ''.join(filter(str.isdigit, str(phone)))
            if digits.startswith('0'):
                digits = '254' + digits[1:]
            elif digits.startswith('7') or digits.startswith('1'):
                digits = '254' + digits
            try:
                rate = get_usd_to_kes_rate()
                kes_amount = int(net * rate)
                description += f' — KES {kes_amount} to {digits}'
            except Exception:
                description += f' — {digits}'
        elif method == 'bank' and bank_name:
            description += f' — {bank_name} ({bank_account})'

        with transaction.atomic():
            locked_wallet = Wallet.objects.select_for_update().get(pk=wallet.pk)

            if locked_wallet.balance < amount:
                return Response({'error': 'Insufficient balance'}, status=400)

            tx = Transaction.objects.create(
                wallet=locked_wallet,
                transaction_type='withdrawal',
                amount=amount,
                fee=fee,
                status='success',
                description=description,
            )
            locked_wallet.balance -= amount
            locked_wallet.save()

        return Response({
            'status': 'success',
            'balance': float(locked_wallet.balance),
            'transaction_id': tx.id,
            'net_amount': float(net),
        })

    # ---------- TRANSFER ----------
    @action(detail=False, methods=['post'])
    def transfer(self, request):
        amount = self._to_decimal(request.data.get('amount', 0))
        to_wallet_id = (request.data.get('to_wallet_id') or '').strip().upper()
        pin = str(request.data.get('pin', ''))

        from_wallet = self._get_wallet(request.user)

        if not from_wallet.has_pin():
            return Response({'error': 'Please set a wallet PIN first.'}, status=400)
        if not from_wallet.check_pin(pin):
            return Response({'error': 'Invalid PIN.'}, status=400)
        if amount is None or amount <= 0:
            return Response({'error': 'Amount must be greater than 0'}, status=400)
        if not to_wallet_id:
            return Response({'error': 'Recipient wallet ID required'}, status=400)
        if from_wallet.balance < amount:
            return Response({'error': 'Insufficient balance'}, status=400)

        try:
            to_wallet = Wallet.objects.get(wallet_id=to_wallet_id)
        except Wallet.DoesNotExist:
            return Response({'error': 'Recipient wallet not found'}, status=404)

        if to_wallet.user == request.user:
            return Response({'error': 'Cannot transfer to yourself'}, status=400)

        with transaction.atomic():
            from_wallet = Wallet.objects.select_for_update().get(pk=from_wallet.pk)
            to_wallet = Wallet.objects.select_for_update().get(pk=to_wallet.pk)

            if from_wallet.balance < amount:
                return Response({'error': 'Insufficient balance'}, status=400)

            from_wallet.balance -= amount
            from_wallet.save()

            Transaction.objects.create(
                wallet=from_wallet,
                transaction_type='transfer',
                amount=-amount,
                status='success',
                description=f'Transfer to {to_wallet.user.username} ({to_wallet.wallet_id})',
                reference=to_wallet_id,
            )

            to_wallet.balance += amount
            to_wallet.save()

            Transaction.objects.create(
                wallet=to_wallet,
                transaction_type='transfer',
                amount=amount,
                status='success',
                description=f'Transfer from {request.user.username} ({from_wallet.wallet_id})',
                reference=from_wallet.wallet_id,
            )

        return Response({
            'status': 'success',
            'balance': float(from_wallet.balance),
            'recipient': to_wallet.user.username,
        })

    # ---------- LOOKUP RECIPIENT ----------
    @action(detail=False, methods=['get'])
    def lookup(self, request):
        wallet_id = (request.query_params.get('wallet_id') or '').strip().upper()
        if not wallet_id:
            return Response({'error': 'wallet_id is required'}, status=400)

        try:
            wallet = Wallet.objects.get(wallet_id=wallet_id)
            return Response({
                'wallet_id': wallet.wallet_id,
                'username': wallet.user.username,
                'full_name': f'{wallet.user.first_name} {wallet.user.last_name}'.strip(),
            })
        except Wallet.DoesNotExist:
            return Response({'error': 'Wallet not found'}, status=404)

    # ---------- TRANSACTIONS ----------
    @action(detail=False, methods=['get'])
    def transactions(self, request):
        expire_stale_pending_transactions()
        wallet = self._get_wallet(request.user)
        txs = wallet.transactions.all().order_by('-created_at')[:50]
        return Response(TransactionSerializer(txs, many=True).data)


# =============================================================
# EXCHANGE RATE — public endpoint
# =============================================================
class ExchangeRateView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        rate = get_usd_to_kes_rate()
        return Response({
            'usd_to_kes': float(rate),
            'kes_to_usd': float(1 / rate) if rate else 0,
            'currency_pair': 'USD/KES',
        })


# =============================================================
# STRIPE — Create PaymentIntent
# =============================================================
class StripeCreateIntentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        amount = request.data.get('amount')
        try:
            amount = float(amount)
        except (TypeError, ValueError):
            return Response({'error': 'Invalid amount'}, status=400)

        if amount < 1:
            return Response({'error': 'Minimum is $1.00'}, status=400)
        if amount > 10000:
            return Response({'error': 'Maximum is $10,000'}, status=400)

        try:
            intent = stripe.PaymentIntent.create(
                amount=int(round(amount * 100)),
                currency='usd',
                metadata={
                    'user_id': request.user.id,
                    'type': 'wallet_deposit',
                },
                payment_method_types=['card'],
                receipt_email=request.user.email,
            )
            return Response({
                'client_secret': intent.client_secret,
                'intent_id': intent.id,
            })
        except stripe.error.StripeError as e:
            return Response({'error': str(e)}, status=400)


# =============================================================
# STRIPE — Webhook
# =============================================================
@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except (ValueError, stripe.error.SignatureVerificationError) as e:
            return Response({'error': str(e)}, status=400)

        event_type = event['type']

        if event_type in ('payment_intent.succeeded', 'charge.succeeded'):
            obj = event['data']['object']
            obj_data = obj.to_dict() if hasattr(obj, 'to_dict') else dict(obj)

            metadata = obj_data.get('metadata') or {}
            user_id = metadata.get('user_id')
            intent_id = obj_data.get('id')
            amount_cents = obj_data.get('amount', 0)

            # For charge events, fetch the PaymentIntent for metadata
            if event_type == 'charge.succeeded' and not user_id:
                pi_id = obj_data.get('payment_intent')
                if pi_id:
                    try:
                        pi = stripe.PaymentIntent.retrieve(pi_id)
                        pi_data = pi.to_dict() if hasattr(pi, 'to_dict') else dict(pi)
                        metadata = pi_data.get('metadata') or {}
                        user_id = metadata.get('user_id')
                        intent_id = pi_id
                        amount_cents = pi_data.get('amount', amount_cents)
                    except Exception as e:
                        print(f'Failed to fetch PaymentIntent: {e}')

            if not user_id:
                return Response({'received': True, 'note': 'no user_id'})

            if Transaction.objects.filter(reference=intent_id).exists():
                return Response({'received': True, 'note': 'already processed'})

            try:
                wallet = Wallet.objects.get(user_id=user_id)
            except Wallet.DoesNotExist:
                return Response({'received': True, 'note': 'no wallet'})

            amount = Decimal(amount_cents) / Decimal(100)

            with transaction.atomic():
                wallet.balance += amount
                wallet.save()
                Transaction.objects.create(
                    wallet=wallet,
                    transaction_type='deposit',
                    amount=amount,
                    status='success',
                    description='Stripe card deposit',
                    reference=intent_id,
                )

            return Response({'received': True, 'credited': float(amount)})

        return Response({'received': True})


# =============================================================
# M-PESA — Initiate STK Push
# =============================================================
class MpesaStkPushView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        amount = request.data.get('amount')
        phone = request.data.get('phone_number')

        try:
            amount = float(amount)
        except (TypeError, ValueError):
            return Response({'error': 'Invalid amount'}, status=400)

        if amount < 1:
            return Response({'error': 'Minimum is $1.00'}, status=400)
        if not phone:
            return Response({'error': 'Phone number is required'}, status=400)

        digits = ''.join(filter(str.isdigit, str(phone)))
        if digits.startswith('0'):
            digits = '254' + digits[1:]
        elif digits.startswith('7') or digits.startswith('1'):
            digits = '254' + digits
        if not digits.startswith('254') or len(digits) != 12:
            return Response({'error': 'Invalid Kenyan phone number'}, status=400)

        rate = get_usd_to_kes_rate()
        amount_kes = int(Decimal(str(amount)) * rate)

        if amount_kes < 1:
            return Response({'error': 'Amount too small'}, status=400)

        try:
            from orders.services.mpesa import stk_push
            result = stk_push(digits, amount_kes, f'WALLET{request.user.id}')
        except Exception as e:
            return Response({'error': f'STK push failed: {str(e)}'}, status=500)

        if result.get('ResponseCode') == '0':
            wallet, _ = Wallet.objects.get_or_create(user=request.user)
            Transaction.objects.create(
                wallet=wallet,
                transaction_type='deposit',
                amount=Decimal(str(amount)),
                status='pending',
                description=f'M-Pesa deposit (KES {amount_kes} @ {rate})',
                reference=result.get('CheckoutRequestID', ''),
            )
            return Response({
                'status': 'pending',
                'message': 'STK push sent. Enter your M-Pesa PIN.',
                'checkout_request_id': result.get('CheckoutRequestID'),
                'merchant_request_id': result.get('MerchantRequestID'),
                'amount_usd': amount,
                'amount_kes': amount_kes,
                'exchange_rate': float(rate),
            })

        return Response(
            {'error': result.get('errorMessage') or result.get('ResponseDescription', 'STK push failed')},
            status=400,
        )


# =============================================================
# M-PESA — Callback from Safaricom
# =============================================================
@method_decorator(csrf_exempt, name='dispatch')
class MpesaCallbackView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return Response({'ResultCode': 1, 'ResultDesc': 'Bad JSON'})

        stk_callback = data.get('Body', {}).get('stkCallback', {})
        result_code = stk_callback.get('ResultCode')
        checkout_id = stk_callback.get('CheckoutRequestID')
        result_desc = stk_callback.get('ResultDesc', '')

        print(f'M-Pesa callback: code={result_code} id={checkout_id} desc={result_desc}')

        if result_code == 0 and checkout_id:
            try:
                tx = Transaction.objects.get(reference=checkout_id)
                if tx.status == 'pending':
                    with transaction.atomic():
                        tx.status = 'success'
                        tx.description = f'M-Pesa deposit (KES {int(tx.amount * Decimal("130"))})'
                        tx.save()
                        wallet = tx.wallet
                        wallet.balance += tx.amount
                        wallet.save()
                        print(f' Credited wallet {wallet.wallet_id} with ${tx.amount}')
            except Transaction.DoesNotExist:
                print(f' No pending transaction with reference {checkout_id}')

        elif result_code != 0:
            try:
                tx = Transaction.objects.get(reference=checkout_id)
                tx.status = 'failed'
                tx.description = f'M-Pesa deposit failed: {result_desc}'
                tx.save()
                print(f'Transaction {checkout_id} failed: {result_desc}')
            except Transaction.DoesNotExist:
                print(f'No transaction found for failed callback {checkout_id}')

        return Response({'ResultCode': 0, 'ResultDesc': 'Success'})