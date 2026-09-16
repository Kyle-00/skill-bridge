from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.db.models import Avg, Sum
from django.utils import timezone
from datetime import timedelta

from accounts.models import User
from gigs.models import Gig
from projects.models import Project
from orders.models import Order, Transaction
from reviews.models import Review


class AdminPlatformStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        now = timezone.now()
        last_7 = now - timedelta(days=7)

        total_users = User.objects.count()
        new_users_7d = User.objects.filter(created_at__gte=last_7).count()
        freelancers = User.objects.filter(role__in=['freelancer', 'both']).count()
        clients = User.objects.filter(role__in=['client', 'both']).count()

        total_gigs = Gig.objects.count()
        active_gigs = Gig.objects.filter(is_active=True).count()
        total_projects = Project.objects.count()
        open_projects = Project.objects.filter(status='open').count()

        total_orders = Order.objects.count()
        completed_orders = Order.objects.filter(status='completed').count()
        platform_revenue = Transaction.objects.filter(
            status='success'
        ).aggregate(total=Sum('fee'))['total'] or 0

        avg_rating = Review.objects.aggregate(avg=Avg('quality'))['avg'] or 0

        recent_users = list(
            User.objects.order_by('-created_at')[:5].values(
                'id', 'username', 'email', 'role', 'created_at'
            )
        )

        return Response({
            'users': {
                'total': total_users,
                'new_7d': new_users_7d,
                'freelancers': freelancers,
                'clients': clients,
            },
            'gigs': {'total': total_gigs, 'active': active_gigs},
            'projects': {'total': total_projects, 'open': open_projects},
            'orders': {'total': total_orders, 'completed': completed_orders},
            'revenue': float(platform_revenue),
            'avg_rating': round(avg_rating, 2),
            'recent_users': recent_users,
        })