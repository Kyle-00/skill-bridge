from django.contrib import admin
from .models import Project, Proposal, Milestone

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'client', 'category', 'budget_min', 'budget_max', 'status', 'deadline')
    list_filter = ('category', 'status', 'created_at')
    search_fields = ('title', 'description', 'client__username')

@admin.register(Proposal)
class ProposalAdmin(admin.ModelAdmin):
    list_display = ('id', 'project', 'freelancer', 'proposed_price', 'estimated_days', 'status')
    list_filter = ('status', 'created_at')
    search_fields = ('project__title', 'freelancer__username')

@admin.register(Milestone)
class MilestoneAdmin(admin.ModelAdmin):
    list_display = ('id', 'project', 'freelancer', 'description', 'amount', 'due_date', 'status')
    list_filter = ('status', 'due_date')
    search_fields = ('project__title', 'freelancer__username')