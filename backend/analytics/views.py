from datetime import timedelta

from django.db.models import Avg, Count, Sum
from django.db.models.functions import TruncMonth
from django.utils import timezone
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from gigs.models import Gig
from orders.models import Order, Transaction
from projects.models import Project
from reviews.models import Review
from wallet.models import Transaction as WalletTransaction


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


class FreelancerStatsView(APIView):
    """Earnings, ratings, and activity for the logged-in freelancer."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Earnings per month for the last 6 months
        monthly = (
            WalletTransaction.objects.filter(
                wallet__user=user,
                transaction_type='escrow',
                status='success',
                created_at__gte=timezone.now() - timedelta(days=180),
            )
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(total=Sum('amount'))
            .order_by('month')
        )
        monthly_map = {m['month'].strftime('%b'): float(m['total']) for m in monthly}

        # Build a full 6-month axis so the chart never has gaps
        labels = []
        for i in range(5, -1, -1):
            d = timezone.now() - timedelta(days=30 * i)
            labels.append(d.strftime('%b'))
        earnings_series = [round(monthly_map.get(l, 0), 2) for l in labels]

        completed = Order.objects.filter(freelancer=user, status='completed')
        total = Order.objects.filter(freelancer=user).count()
        done_count = completed.count()

        ratings = Review.objects.filter(reviewee=user).aggregate(
            quality=Avg('quality'),
            communication=Avg('communication'),
            timeliness=Avg('timeliness'),
            professionalism=Avg('professionalism'),
            count=Count('id'),
        )

        # Top gigs by completed revenue
        top_gigs = (
            Order.objects.filter(
                freelancer=user, status='completed', gig__isnull=False
            )
            .values('gig__title')
            .annotate(revenue=Sum('total_amount'), sales=Count('id'))
            .order_by('-revenue')[:5]
        )

        pending_milestones = user.orders_as_freelancer.filter(
            order_milestones__status='submitted'
        ).distinct().count()

        disputes_lost = user.orders_as_freelancer.filter(
            disputes__status='resolved_refund'
        ).count()

        return Response({
            'earnings': {'labels': labels, 'series': earnings_series},
            'lifetime_earnings': round(sum(earnings_series), 2),
            'orders': {
                'total': total,
                'completed': done_count,
                'in_progress': Order.objects.filter(
                    freelancer=user, status='in_progress'
                ).count(),
                'completion_rate': round((done_count / total * 100) if total else 0, 1),
            },
            'ratings': {
                'quality': round(ratings['quality'] or 0, 1),
                'communication': round(ratings['communication'] or 0, 1),
                'timeliness': round(ratings['timeliness'] or 0, 1),
                'professionalism': round(ratings['professionalism'] or 0, 1),
                'count': ratings['count'],
            },
            'top_gigs': [
                {
                    'title': g['gig__title'],
                    'revenue': float(g['revenue']),
                    'sales': g['sales'],
                }
                for g in top_gigs
            ],
            'pending_milestone_reviews': pending_milestones,
            'disputes_lost': disputes_lost,
        })