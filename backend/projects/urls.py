from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProjectViewSet, ProposalViewSet, MilestoneViewSet, AdminProjectViewSet,
)

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'proposals', ProposalViewSet, basename='proposal')
router.register(r'milestones', MilestoneViewSet, basename='milestone')
router.register(r'admin/projects', AdminProjectViewSet, basename='admin-project')

urlpatterns = [
    path('', include(router.urls)),
]