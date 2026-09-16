from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProjectViewSet, ProposalViewSet, MilestoneViewSet, AdminProjectViewSet,
)

router = DefaultRouter()
router.register(r'proposals', ProposalViewSet, basename='proposal')
router.register(r'milestones', MilestoneViewSet, basename='milestone')
router.register(r'', ProjectViewSet, basename='project')

admin_router = DefaultRouter()
admin_router.register(r'', AdminProjectViewSet, basename='admin-project')

urlpatterns = [
    path('admin/', include(admin_router.urls)),
    path('', include(router.urls)),
]