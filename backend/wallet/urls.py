from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WalletViewSet, ExchangeRateView, StripeCreateIntentView,
    StripeWebhookView, MpesaStkPushView, MpesaCallbackView,
)

router = DefaultRouter()
router.register(r'', WalletViewSet, basename='wallet')

urlpatterns = [
    path('exchange-rate/', ExchangeRateView.as_view(), name='exchange-rate'),
    path('stripe/create-intent/', StripeCreateIntentView.as_view()),
    path('webhook/stripe/', StripeWebhookView.as_view()),
    path('mpesa/stk-push/', MpesaStkPushView.as_view()),
    path('webhook/mpesa/', MpesaCallbackView.as_view()),
    path('', include(router.urls)),
]