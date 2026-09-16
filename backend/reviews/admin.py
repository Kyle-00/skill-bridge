from django.contrib import admin
from .models import Review

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'reviewer', 'reviewee', 'quality', 'communication', 'timeliness', 'professionalism', 'is_verified')
    list_filter = ('reviewer_role', 'is_verified', 'created_at')
    search_fields = ('reviewer__username', 'reviewee__username', 'comment')
    readonly_fields = ('created_at',)