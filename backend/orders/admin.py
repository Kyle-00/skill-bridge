from django.contrib import admin
from .models import Order, Transaction

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'order_type', 'client', 'freelancer', 'total_amount', 'platform_fee', 'status', 'escrow_funded')
    list_filter = ('order_type', 'status', 'escrow_funded', 'created_at')
    search_fields = ('client__username', 'freelancer__username', 'gig__title', 'project__title')
    readonly_fields = ('created_at', 'funded_at', 'completed_at')

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'amount', 'fee', 'provider', 'provider_ref', 'status', 'created_at')
    list_filter = ('provider', 'status', 'created_at')
    search_fields = ('provider_ref', 'order__id')