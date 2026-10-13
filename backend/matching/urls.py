from django.urls import path
from .views import ProjectMatchesView, FreelancerMatchesView, GigMatchesView

urlpatterns = [
    path('projects/', ProjectMatchesView.as_view(), name='match-projects'),
    path('freelancers/', FreelancerMatchesView.as_view(), name='match-freelancers'),
    path('gigs/', GigMatchesView.as_view(), name='match-gigs'),
]