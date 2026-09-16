from django.contrib import admin
from .models import User, FreelancerProfile, ClientProfile

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'email', 'role', 'is_verified', 'trust_score', 'created_at')
    list_filter = ('role', 'is_verified', 'created_at')
    search_fields = ('username', 'email', 'phone_number')
    readonly_fields = ('created_at',)

@admin.register(FreelancerProfile)
class FreelancerProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'title', 'hourly_rate', 'availability')
    search_fields = ('user__username', 'title')
    list_filter = ('availability',)

@admin.register(ClientProfile)
class ClientProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'company_name', 'payment_verified')
    search_fields = ('user__username', 'company_name')