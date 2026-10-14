from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    ProjectViewSet, ProposalViewSet, MilestoneViewSet, AdminProjectViewSet,
)

router = DefaultRouter()

# IMPORTANT: Register specific prefixes BEFORE the empty prefix.
# Otherwise the empty-prefix detail route `^{pk}/$` will match
# things like "proposals", "milestones", and "admin", causing
# 405 Method Not Allowed errors when you POST to them.
router.register(r'proposals', ProposalViewSet, basename='proposal')
router.register(r'milestones', MilestoneViewSet, basename='milestone')
router.register(r'admin', AdminProjectViewSet, basename='admin-project')

# Empty prefix goes LAST so its `^{pk}/$` pattern doesn't shadow
# the named routes above.
router.register(r'', ProjectViewSet, basename='project')

urlpatterns = [
    path('', include(router.urls)),
]