from rest_framework import serializers
from accounts.models import User
from gigs.models import Gig
from projects.models import Project
from orders.models import Order
from reviews.models import Review

class PlatformStatsSerializer(serializers.Serializer):
    total_users = serializers.IntegerField()
    total_freelancers = serializers.IntegerField()
    total_clients = serializers.IntegerField()
    total_gigs = serializers.IntegerField()
    total_projects = serializers.IntegerField()
    total_orders = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    avg_rating = serializers.FloatField()