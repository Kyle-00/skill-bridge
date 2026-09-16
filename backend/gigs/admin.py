from django.contrib import admin
from .models import Gig

@admin.register(Gig)
class GigAdmin(admin.ModelAdmin):
    list_display = ('title', 'freelancer', 'price', 'delivery_days', 'is_active', 'views', 'created_at')
    list_filter = ('category', 'is_active', 'freelancer')
    search_fields = ('title', 'description')
    ordering = ('-created_at',)
    readonly_fields = ('views', 'clicks', 'created_at') 