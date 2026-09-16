import stripe
from django.conf import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

def create_payment_intent(order, customer_email):
    intent = stripe.PaymentIntent.create(
        amount=int(order.total_amount * 100),
        currency='usd',
        customer_email=customer_email,
        metadata={'order_id': order.id},
        payment_method_types=['card'],
    )
    return intent.client_secret