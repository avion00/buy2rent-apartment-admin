from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Sum, Q, Avg
from django.utils import timezone
from datetime import timedelta, datetime
from drf_spectacular.utils import extend_schema, OpenApiResponse

from apartments.models import Apartment
from clients.models import Client
from vendors.models import Vendor
from products.models import Product
from orders.models import Order
from deliveries.models import Delivery
from payments.models import Payment
from issues.models import Issue
from activities.models import Activity


class DashboardStatsView(APIView):
    """
    Get dashboard statistics including counts, totals, and recent metrics
    """
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        tags=['Dashboard'],
        summary='Get dashboard statistics',
        responses={
            200: OpenApiResponse(description='Dashboard statistics')
        }
    )
    def get(self, request):
        # Get date ranges
        today = timezone.now().date()
        last_30_days = today - timedelta(days=30)
        last_7_days = today - timedelta(days=7)
        
        # Apartment statistics
        apartment_stats = {
            'total': Apartment.objects.count(),
            'by_status': {
                'planning': Apartment.objects.filter(status='planning').count(),
                'in_progress': Apartment.objects.filter(status='in_progress').count(),
                'completed': Apartment.objects.filter(status='completed').count(),
                'on_hold': Apartment.objects.filter(status='on_hold').count(),
            },
            'total_budget': Apartment.objects.aggregate(
                total=Sum('budget')
            )['total'] or 0,
            'avg_budget': Apartment.objects.aggregate(
                avg=Avg('budget')
            )['avg'] or 0,
        }
        
        # Client statistics
        client_stats = {
            'total': Client.objects.count(),
            'active': Client.objects.filter(status='active').count(),
            'new_this_month': Client.objects.filter(
                created_at__gte=last_30_days
            ).count(),
        }
        
        # Vendor statistics
        vendor_stats = {
            'total': Vendor.objects.count(),
            'active': Vendor.objects.filter(status='active').count(),
            'by_type': {
                'furniture': Vendor.objects.filter(vendor_type='furniture').count(),
                'appliances': Vendor.objects.filter(vendor_type='appliances').count(),
                'decor': Vendor.objects.filter(vendor_type='decor').count(),
                'other': Vendor.objects.filter(vendor_type='other').count(),
            }
        }
        
        # Product statistics
        product_stats = {
            'total': Product.objects.count(),
            'in_stock': Product.objects.filter(availability_status='in_stock').count(),
            'out_of_stock': Product.objects.filter(availability_status='out_of_stock').count(),
            'categories': Product.objects.values('category').distinct().count(),
        }
        
        # Order statistics
        order_stats = {
            'total': Order.objects.count(),
            'this_month': Order.objects.filter(placed_on__gte=last_30_days).count(),
            'pending': Order.objects.filter(
                status__in=['draft', 'confirmed']
            ).count(),
            'delivered': Order.objects.filter(status='delivered').count(),
            'total_value': Order.objects.aggregate(
                total=Sum('total')
            )['total'] or 0,
            'avg_order_value': Order.objects.aggregate(
                avg=Avg('total')
            )['avg'] or 0,
        }
        
        # Delivery statistics
        delivery_stats = {
            'total': Delivery.objects.count(),
            'scheduled': Delivery.objects.filter(status='scheduled').count(),
            'in_transit': Delivery.objects.filter(status='in_transit').count(),
            'delivered': Delivery.objects.filter(status='delivered').count(),
            'delayed': Delivery.objects.filter(
                status='in_transit',
                scheduled_date__lt=today
            ).count(),
        }
        
        # Payment statistics
        payment_stats = {
            'total_payments': Payment.objects.count(),
            'total_amount': Payment.objects.aggregate(
                total=Sum('amount')
            )['total'] or 0,
            'pending': Payment.objects.filter(status='pending').count(),
            'completed': Payment.objects.filter(status='completed').count(),
            'this_month': Payment.objects.filter(
                payment_date__gte=last_30_days
            ).aggregate(total=Sum('amount'))['total'] or 0,
        }
        
        # Issue statistics
        issue_stats = {
            'total': Issue.objects.count(),
            'open': Issue.objects.filter(resolution_status='open').count(),
            'in_progress': Issue.objects.filter(resolution_status='in_progress').count(),
            'resolved': Issue.objects.filter(resolution_status='resolved').count(),
            'critical': Issue.objects.filter(
                priority='high',
                resolution_status__in=['open', 'in_progress']
            ).count(),
        }
        
        # Activity statistics
        activity_stats = {
            'total': Activity.objects.count(),
            'today': Activity.objects.filter(
                created_at__date=today
            ).count(),
            'this_week': Activity.objects.filter(
                created_at__date__gte=last_7_days
            ).count(),
        }
        
        return Response({
            'apartments': apartment_stats,
            'clients': client_stats,
            'vendors': vendor_stats,
            'products': product_stats,
            'orders': order_stats,
            'deliveries': delivery_stats,
            'payments': payment_stats,
            'issues': issue_stats,
            'activities': activity_stats,
            'summary': {
                'total_revenue': payment_stats['total_amount'],
                'total_orders': order_stats['total'],
                'active_projects': apartment_stats['by_status']['in_progress'],
                'open_issues': issue_stats['open'],
            }
        })


class DashboardChartsView(APIView):
    """
    Get chart data for dashboard visualizations
    """
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        tags=['Dashboard'],
        summary='Get dashboard chart data',
        responses={
            200: OpenApiResponse(description='Chart data for dashboard')
        }
    )
    def get(self, request):
        # Get the last 6 months of data
        today = timezone.now().date()
        six_months_ago = today - timedelta(days=180)
        
        # Monthly order trends
        monthly_orders = []
        for i in range(6):
            month_start = today.replace(day=1) - timedelta(days=30*i)
            month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
            
            orders = Order.objects.filter(
                placed_on__gte=month_start,
                placed_on__lte=month_end
            )
            
            monthly_orders.append({
                'month': month_start.strftime('%B'),
                'orders': orders.count(),
                'value': orders.aggregate(Sum('total'))['total__sum'] or 0
            })
        
        monthly_orders.reverse()
        
        # Vendor spending
        vendor_spending = Vendor.objects.annotate(
            total_orders=Count('orders'),
            total_spent=Sum('orders__total')
        ).filter(total_spent__gt=0).order_by('-total_spent')[:5]
        
        vendor_chart = [
            {
                'vendor': vendor.name,
                'amount': float(vendor.total_spent or 0),
                'orders': vendor.total_orders
            }
            for vendor in vendor_spending
        ]
        
        # Apartment status distribution
        apartment_status = [
            {
                'status': 'Planning',
                'count': Apartment.objects.filter(status='planning').count()
            },
            {
                'status': 'In Progress',
                'count': Apartment.objects.filter(status='in_progress').count()
            },
            {
                'status': 'Completed',
                'count': Apartment.objects.filter(status='completed').count()
            },
            {
                'status': 'On Hold',
                'count': Apartment.objects.filter(status='on_hold').count()
            }
        ]
        
        # Payment trends (last 30 days)
        payment_trends = []
        for i in range(30):
            date = today - timedelta(days=i)
            daily_payments = Payment.objects.filter(
                payment_date=date
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            payment_trends.append({
                'date': date.strftime('%Y-%m-%d'),
                'amount': float(daily_payments)
            })
        
        payment_trends.reverse()
        
        # Issue resolution time
        resolved_issues = Issue.objects.filter(
            resolution_status='resolved',
            resolved_at__isnull=False
        ).order_by('-resolved_at')[:20]
        
        resolution_times = []
        for issue in resolved_issues:
            if issue.resolved_at and issue.created_at:
                time_diff = issue.resolved_at - issue.created_at
                resolution_times.append({
                    'issue_id': str(issue.id),
                    'hours': time_diff.total_seconds() / 3600,
                    'priority': issue.priority
                })
        
        return Response({
            'monthly_orders': monthly_orders,
            'vendor_spending': vendor_chart,
            'apartment_status': apartment_status,
            'payment_trends': payment_trends,
            'issue_resolution_times': resolution_times,
        })


class DashboardRecentActivitiesView(APIView):
    """
    Get recent activities across all modules
    """
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        tags=['Dashboard'],
        summary='Get recent activities',
        responses={
            200: OpenApiResponse(description='Recent activities list')
        }
    )
    def get(self, request):
        # Get recent activities
        recent_activities = Activity.objects.select_related(
            'apartment', 'user'
        ).order_by('-created_at')[:20]
        
        activities = []
        for activity in recent_activities:
            activities.append({
                'id': str(activity.id),
                'type': activity.activity_type,
                'description': activity.description,
                'apartment': activity.apartment.name if activity.apartment else None,
                'user': activity.user.get_full_name() if activity.user else None,
                'created_at': activity.created_at.isoformat(),
            })
        
        # Get recent orders
        recent_orders = Order.objects.select_related(
            'apartment', 'vendor'
        ).order_by('-created_at')[:10]
        
        orders = []
        for order in recent_orders:
            orders.append({
                'id': str(order.id),
                'po_number': order.po_number,
                'apartment': order.apartment.name,
                'vendor': order.vendor.name,
                'total': float(order.total),
                'status': order.status,
                'placed_on': order.placed_on.isoformat(),
            })
        
        # Get recent issues
        recent_issues = Issue.objects.select_related(
            'apartment', 'reported_by'
        ).order_by('-created_at')[:10]
        
        issues = []
        for issue in recent_issues:
            issues.append({
                'id': str(issue.id),
                'title': issue.title,
                'apartment': issue.apartment.name if issue.apartment else None,
                'priority': issue.priority,
                'status': issue.resolution_status,
                'created_at': issue.created_at.isoformat(),
            })
        
        # Get recent payments
        recent_payments = Payment.objects.select_related(
            'vendor'
        ).order_by('-payment_date')[:10]
        
        payments = []
        for payment in recent_payments:
            payments.append({
                'id': str(payment.id),
                'vendor': payment.vendor.name if payment.vendor else None,
                'amount': float(payment.amount),
                'status': payment.status,
                'payment_date': payment.payment_date.isoformat(),
            })
        
        return Response({
            'activities': activities,
            'recent_orders': orders,
            'recent_issues': issues,
            'recent_payments': payments,
        })


class DashboardQuickStatsView(APIView):
    """
    Get quick stats for dashboard header
    """
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        tags=['Dashboard'],
        summary='Get quick dashboard stats',
        responses={
            200: OpenApiResponse(description='Quick statistics')
        }
    )
    def get(self, request):
        today = timezone.now().date()
        
        return Response({
            'active_projects': Apartment.objects.filter(
                status='in_progress'
            ).count(),
            'pending_orders': Order.objects.filter(
                status__in=['draft', 'confirmed']
            ).count(),
            'open_issues': Issue.objects.filter(
                resolution_status__in=['open', 'in_progress']
            ).count(),
            'deliveries_today': Delivery.objects.filter(
                scheduled_date=today
            ).count(),
            'total_vendors': Vendor.objects.filter(status='active').count(),
            'total_products': Product.objects.count(),
        })
