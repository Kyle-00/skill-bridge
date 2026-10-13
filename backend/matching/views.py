from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from projects.models import Project
from accounts.models import User
from gigs.models import Gig
from .services import score_project_for_freelancer, score_freelancer_for_project


class ProjectMatchesView(APIView):
    """Freelancer: open projects scored against YOUR skills."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role == 'client':
            return Response({'error': 'Clients do not get project matches.'}, status=400)

        projects = Project.objects.filter(status='open').order_by('-created_at')[:100]
        results = []
        for p in projects:
            score, reasons = score_project_for_freelancer(p, request.user)
            results.append({
                'id': p.id,
                'title': p.title,
                'description': p.description,
                'category': p.category,
                'budget_min': str(p.budget_min),
                'budget_max': str(p.budget_max),
                'deadline': p.deadline,
                'client': p.client.username,
                'created_at': p.created_at,
                'match_score': score,
                'match_reasons': reasons,
            })
        results.sort(key=lambda r: r['match_score'], reverse=True)
        return Response(results)


class FreelancerMatchesView(APIView):
    """Client: freelancers scored against one of your projects."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        project_id = request.query_params.get('project_id')
        if not project_id:
            return Response({'error': 'project_id is required.'}, status=400)

        project = Project.objects.filter(id=project_id, client=request.user).first()
        if not project:
            return Response({'error': 'Project not found.'}, status=404)

        freelancers = User.objects.filter(
            role__in=['freelancer', 'both']
        ).select_related('freelancer_profile')[:200]

        results = []
        for f in freelancers:
            score, reasons = score_freelancer_for_project(project, f)
            profile = getattr(f, 'freelancer_profile', None)
            results.append({
                'id': f.id,
                'username': f.username,
                'display_name': (f'{f.first_name} {f.last_name}'.strip()) or f.username,
                'title': profile.title if profile else '',
                'skills': profile.skills if profile else [],
                'hourly_rate': str(profile.hourly_rate) if profile and profile.hourly_rate else None,
                'trust_score': f.trust_score,
                'match_score': score,
                'match_reasons': reasons,
            })
        results.sort(key=lambda r: r['match_score'], reverse=True)
        return Response(results)


class GigMatchesView(APIView):
    """Anyone: trending active gigs with engagement score (views/clicks)."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        gigs = Gig.objects.filter(is_active=True).order_by('-created_at')[:100]
        data = [{
            'id': g.id,
            'title': g.title,
            'category': g.category,
            'price': str(g.price),
            'delivery_days': g.delivery_days,
            'freelancer': g.freelancer.username,
            'views': g.views,
            'clicks': g.clicks,
            'match_score': min(100, g.views + g.clicks * 5),
        } for g in gigs]
        return Response(data)