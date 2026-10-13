import stripe
from django.conf import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

def create_payment_intent(amount, order_id):
    """
    Creates a Stripe PaymentIntent.
    Matches the call signature in orders/views.py: create_payment_intent(amount, order.id)
    """
    intent = stripe.PaymentIntent.create(
        amount=int(amount * 100),  # Convert to cents
        currency='usd',
        metadata={'order_id': order_id},
        payment_method_types=['card'],
    )
    return intent.client_secret