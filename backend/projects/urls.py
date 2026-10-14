from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProjectViewSet, ProposalViewSet, MilestoneViewSet, AdminProjectViewSet,
)

router = DefaultRouter()
# The outer config/urls.py already mounts this file at api/v1/projects/
# so we use an empty prefix here. Otherwise the URL becomes
# api/v1/projects/projects/ which is wrong.
router.register(r'', ProjectViewSet, basename='project')
router.register(r'proposals', ProposalViewSet, basename='proposal')
router.register(r'milestones', MilestoneViewSet, basename='milestone')
router.register(r'admin', AdminProjectViewSet, basename='admin-project')

urlpatterns = [
    path('', include(router.urls)),
]