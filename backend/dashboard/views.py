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
        try:
            # Get date ranges
            today = timezone.now().date()
            last_30_days = today - timedelta(days=30)
            last_7_days = today - timedelta(days=7)
            
            # Apartment statistics
            try:
                apartment_stats = {
                    'total': Apartment.objects.count(),
                    'by_status': {
                        'planning': Apartment.objects.filter(status='planning').count(),
                        'in_progress': Apartment.objects.filter(status='in_progress').count(),
                        'completed': Apartment.objects.filter(status='completed').count(),
                        'on_hold': Apartment.objects.filter(status='on_hold').count(),
                    },
                    'total_budget': float(Apartment.objects.aggregate(total=Sum('budget'))['total'] or 0),
                    'avg_budget': float(Apartment.objects.aggregate(avg=Avg('budget'))['avg'] or 0),
                }
            except Exception:
                apartment_stats = {'total': 0, 'by_status': {'planning': 0, 'in_progress': 0, 'completed': 0, 'on_hold': 0}, 'total_budget': 0, 'avg_budget': 0}
            
            # Client statistics
            try:
                client_stats = {
                    'total': Client.objects.count(),
                    'active': Client.objects.filter(status='active').count(),
                    'new_this_month': Client.objects.filter(created_at__date__gte=last_30_days).count(),
                }
            except Exception:
                client_stats = {'total': 0, 'active': 0, 'new_this_month': 0}
            
            # Vendor statistics
            try:
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
            except Exception:
                vendor_stats = {'total': 0, 'active': 0, 'by_type': {'furniture': 0, 'appliances': 0, 'decor': 0, 'other': 0}}
            
            # Product statistics
            try:
                product_stats = {
                    'total': Product.objects.count(),
                    'in_stock': Product.objects.filter(availability_status='in_stock').count(),
                    'out_of_stock': Product.objects.filter(availability_status='out_of_stock').count(),
                    'categories': Product.objects.values('category').distinct().count(),
                }
            except Exception:
                product_stats = {'total': 0, 'in_stock': 0, 'out_of_stock': 0, 'categories': 0}
            
            # Order statistics
            try:
                order_stats = {
                    'total': Order.objects.count(),
                    'this_month': Order.objects.filter(created_at__date__gte=last_30_days).count(),
                    'pending': Order.objects.filter(status__in=['draft', 'confirmed']).count(),
                    'delivered': Order.objects.filter(status='delivered').count(),
                    'total_value': float(Order.objects.aggregate(total=Sum('total'))['total'] or 0),
                    'avg_order_value': float(Order.objects.aggregate(avg=Avg('total'))['avg'] or 0),
                }
            except Exception:
                order_stats = {'total': 0, 'this_month': 0, 'pending': 0, 'delivered': 0, 'total_value': 0, 'avg_order_value': 0}
            
            # Delivery statistics - Status values: 'Scheduled', 'In Transit', 'Delivered', 'Delayed', 'Cancelled', 'Returned', 'Issue Reported'
            try:
                delivery_stats = {
                    'total': Delivery.objects.count(),
                    'scheduled': Delivery.objects.filter(status='Scheduled').count(),
                    'in_transit': Delivery.objects.filter(status='In Transit').count(),
                    'delivered': Delivery.objects.filter(status='Delivered').count(),
                    'delayed': Delivery.objects.filter(status='Delayed').count(),
                }
            except Exception:
                delivery_stats = {'total': 0, 'scheduled': 0, 'in_transit': 0, 'delivered': 0, 'delayed': 0}
            
            # Payment statistics
            try:
                payment_stats = {
                    'total_payments': Payment.objects.count(),
                    'total_amount': Payment.objects.aggregate(total=Sum('total_amount'))['total'] or 0,
                    'total_paid': Payment.objects.aggregate(total=Sum('amount_paid'))['total'] or 0,
                    'unpaid': Payment.objects.filter(status='Unpaid').count(),
                    'partial': Payment.objects.filter(status='Partial').count(),
                    'paid': Payment.objects.filter(status='Paid').count(),
                    'overdue': Payment.objects.filter(status__in=['Unpaid', 'Partial'], due_date__lt=today).count(),
                }
            except Exception:
                payment_stats = {'total_payments': 0, 'total_amount': 0, 'total_paid': 0, 'unpaid': 0, 'partial': 0, 'paid': 0, 'overdue': 0}
            
            # Issue statistics
            try:
                # Issue statuses: 'Open', 'Pending Vendor Response', 'Resolution Agreed', 'Closed'
                issue_stats = {
                    'total': Issue.objects.count(),
                    'open': Issue.objects.filter(resolution_status='Open').count(),
                    'pending_response': Issue.objects.filter(resolution_status='Pending Vendor Response').count(),
                    'resolution_agreed': Issue.objects.filter(resolution_status='Resolution Agreed').count(),
                    'closed': Issue.objects.filter(resolution_status='Closed').count(),
                    'critical': Issue.objects.filter(priority='high', resolution_status__in=['Open', 'Pending Vendor Response']).count(),
                }
            except Exception:
                issue_stats = {'total': 0, 'open': 0, 'in_progress': 0, 'resolved': 0, 'critical': 0}
            
            # Activity statistics
            try:
                activity_stats = {
                    'total': Activity.objects.count(),
                    'today': Activity.objects.filter(created_at__date=today).count(),
                    'this_week': Activity.objects.filter(created_at__date__gte=last_7_days).count(),
                }
            except Exception:
                activity_stats = {'total': 0, 'today': 0, 'this_week': 0}
            
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
        except Exception as e:
            return Response({
                'apartments': {'total': 0, 'by_status': {'planning': 0, 'in_progress': 0, 'completed': 0, 'on_hold': 0}, 'total_budget': 0, 'avg_budget': 0},
                'clients': {'total': 0, 'active': 0, 'new_this_month': 0},
                'vendors': {'total': 0, 'active': 0, 'by_type': {'furniture': 0, 'appliances': 0, 'decor': 0, 'other': 0}},
                'products': {'total': 0, 'in_stock': 0, 'out_of_stock': 0, 'categories': 0},
                'orders': {'total': 0, 'this_month': 0, 'pending': 0, 'delivered': 0, 'total_value': 0, 'avg_order_value': 0},
                'deliveries': {'total': 0, 'scheduled': 0, 'in_transit': 0, 'delivered': 0, 'delayed': 0},
                'payments': {'total_payments': 0, 'total_amount': 0, 'total_paid': 0, 'unpaid': 0, 'partial': 0, 'paid': 0, 'overdue': 0},
                'issues': {'total': 0, 'open': 0, 'in_progress': 0, 'resolved': 0, 'critical': 0},
                'activities': {'total': 0, 'today': 0, 'this_week': 0},
                'summary': {'total_revenue': 0, 'total_orders': 0, 'active_projects': 0, 'open_issues': 0},
                'error': str(e)
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
        try:
            today = timezone.now().date()
            month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            
            # Monthly order trends
            monthly_orders = []
            try:
                for i in range(5, -1, -1):
                    target_month = today.month - i
                    target_year = today.year
                    while target_month <= 0:
                        target_month += 12
                        target_year -= 1
                    
                    orders = Order.objects.filter(
                        created_at__year=target_year,
                        created_at__month=target_month
                    )
                    
                    monthly_orders.append({
                        'month': month_names[target_month - 1],
                        'orders': orders.count(),
                        'value': float(orders.aggregate(Sum('total'))['total__sum'] or 0)
                    })
            except Exception:
                monthly_orders = [{'month': m, 'orders': 0, 'value': 0} for m in ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov']]
            
            # Vendor spending
            vendor_chart = []
            try:
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
            except Exception:
                pass
            
            # Apartment status distribution
            apartment_status = []
            try:
                apartment_status = [
                    {'status': 'Planning', 'count': Apartment.objects.filter(status='planning').count()},
                    {'status': 'In Progress', 'count': Apartment.objects.filter(status='in_progress').count()},
                    {'status': 'Completed', 'count': Apartment.objects.filter(status='completed').count()},
                    {'status': 'On Hold', 'count': Apartment.objects.filter(status='on_hold').count()}
                ]
            except Exception:
                apartment_status = [{'status': s, 'count': 0} for s in ['Planning', 'In Progress', 'Completed', 'On Hold']]
            
            # Payment/Spending trends (last 6 months)
            payment_trends = []
            try:
                for i in range(5, -1, -1):
                    target_month = today.month - i
                    target_year = today.year
                    while target_month <= 0:
                        target_month += 12
                        target_year -= 1
                    
                    monthly_paid = Payment.objects.filter(
                        created_at__year=target_year,
                        created_at__month=target_month
                    ).aggregate(total=Sum('amount_paid'))['total'] or 0
                    
                    payment_trends.append({
                        'month': month_names[target_month - 1],
                        'amount': float(monthly_paid)
                    })
            except Exception:
                payment_trends = [{'month': m, 'amount': 0} for m in ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov']]
            
            # Issue resolution time
            resolution_times = []
            try:
                resolved_issues = Issue.objects.filter(
                    resolution_status='Closed',
                    resolved_at__isnull=False
                ).order_by('-resolved_at')[:20]
                
                for issue in resolved_issues:
                    if issue.resolved_at and issue.created_at:
                        time_diff = issue.resolved_at - issue.created_at
                        resolution_times.append({
                            'issue_id': str(issue.id),
                            'hours': time_diff.total_seconds() / 3600,
                            'priority': issue.priority
                        })
            except Exception:
                pass
            
            return Response({
                'monthly_orders': monthly_orders,
                'vendor_spending': vendor_chart,
                'apartment_status': apartment_status,
                'payment_trends': payment_trends,
                'issue_resolution_times': resolution_times,
            })
        except Exception as e:
            return Response({
                'monthly_orders': [],
                'vendor_spending': [],
                'apartment_status': [],
                'payment_trends': [],
                'issue_resolution_times': [],
                'error': str(e)
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
        try:
            # Get recent activities
            activities = []
            try:
                recent_activities = Activity.objects.select_related(
                    'apartment', 'user'
                ).order_by('-created_at')[:30]
                
                for activity in recent_activities:
                    # Get icon based on activity type
                    icon_map = {
                        'order': 'shopping-cart',
                        'payment': 'credit-card',
                        'delivery': 'truck',
                        'issue': 'alert-circle',
                        'product': 'package',
                        'apartment': 'building',
                        'client': 'users',
                        'vendor': 'store',
                        'user': 'user',
                        'status': 'activity',
                        'ai': 'bot',
                    }
                    
                    # Get action color
                    action_colors = {
                        'created': 'green',
                        'updated': 'blue',
                        'deleted': 'red',
                        'status_changed': 'yellow',
                        'payment_received': 'green',
                        'delivered': 'green',
                        'completed': 'green',
                        'cancelled': 'red',
                    }
                    
                    activity_type = getattr(activity, 'activity_type', '') or getattr(activity, 'type', 'status')
                    action = getattr(activity, 'action', 'updated')
                    title = getattr(activity, 'title', '') or getattr(activity, 'summary', '')[:50]
                    description = getattr(activity, 'description', '') or getattr(activity, 'summary', '')
                    
                    activities.append({
                        'id': str(activity.id),
                        'type': activity_type,
                        'action': action,
                        'title': title,
                        'description': description,
                        'icon': icon_map.get(activity_type, 'activity'),
                        'color': action_colors.get(action, 'gray'),
                        'apartment': activity.apartment.name if activity.apartment else None,
                        'user': activity.user.get_full_name() if activity.user else (activity.actor if hasattr(activity, 'actor') else None),
                        'object_id': getattr(activity, 'object_id', ''),
                        'object_type': getattr(activity, 'object_type', ''),
                        'metadata': getattr(activity, 'metadata', {}),
                        'created_at': activity.created_at.isoformat(),
                    })
            except Exception as e:
                print(f"Error fetching activities: {e}")
            
            # Get recent orders
            orders = []
            try:
                recent_orders = Order.objects.select_related(
                    'apartment', 'vendor'
                ).order_by('-created_at')[:10]
                
                for order in recent_orders:
                    orders.append({
                        'id': str(order.id),
                        'po_number': order.po_number,
                        'apartment': order.apartment.name if order.apartment else 'Unknown',
                        'vendor': order.vendor.name if order.vendor else 'Unknown',
                        'total': float(order.total) if order.total else 0,
                        'status': order.status,
                        'placed_on': order.placed_on.isoformat() if order.placed_on else None,
                    })
            except Exception:
                pass
            
            # Get recent issues
            issues = []
            try:
                recent_issues = Issue.objects.select_related(
                    'apartment', 'reported_by'
                ).order_by('-created_at')[:10]
                
                for issue in recent_issues:
                    issues.append({
                        'id': str(issue.id),
                        'title': issue.title,
                        'apartment': issue.apartment.name if issue.apartment else None,
                        'priority': issue.priority,
                        'status': issue.resolution_status,
                        'created_at': issue.created_at.isoformat(),
                    })
            except Exception:
                pass
            
            # Get recent payments
            payments = []
            try:
                recent_payments = Payment.objects.select_related(
                    'vendor', 'apartment'
                ).order_by('-created_at')[:10]
                
                for payment in recent_payments:
                    payments.append({
                        'id': str(payment.id),
                        'vendor': payment.vendor.name if payment.vendor else None,
                        'apartment': payment.apartment.name if payment.apartment else None,
                        'order_reference': payment.order_reference,
                        'total_amount': payment.total_amount,
                        'amount_paid': payment.amount_paid,
                        'outstanding': payment.outstanding_amount,
                        'status': payment.status,
                        'due_date': payment.due_date.isoformat() if payment.due_date else None,
                    })
            except Exception:
                pass
            
            return Response({
                'activities': activities,
                'recent_orders': orders,
                'recent_issues': issues,
                'recent_payments': payments,
            })
        except Exception as e:
            return Response({
                'activities': [],
                'recent_orders': [],
                'recent_issues': [],
                'recent_payments': [],
                'error': str(e)
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
        try:
            today = timezone.now().date()
            last_month = today - timedelta(days=30)
            last_week = today - timedelta(days=7)
            week_start = today - timedelta(days=today.weekday())
            week_end = week_start + timedelta(days=6)
            
            # Safe defaults
            active_apartments = 0
            apartments_trend = 0
            pending_orders = 0
            orders_trend = 0
            open_issues = 0
            deliveries_this_week = 0
            deliveries_trend = 0
            overdue_payments = 0
            overdue_trend = 0
            
            try:
                active_apartments = Apartment.objects.count()
                apartments_last_month = Apartment.objects.filter(created_at__date__lt=last_month).count()
                apartments_trend = ((active_apartments - apartments_last_month) / max(apartments_last_month, 1)) * 100 if apartments_last_month else 0
            except Exception:
                pass
            
            try:
                pending_orders = Order.objects.filter(status__in=['draft', 'confirmed', 'processing']).count()
                pending_last_week = Order.objects.filter(status__in=['draft', 'confirmed', 'processing'], created_at__date__lt=last_week).count()
                orders_trend = ((pending_orders - pending_last_week) / max(pending_last_week, 1)) * 100 if pending_last_week else 0
            except Exception:
                pass
            
            try:
                # Issue statuses: 'Open', 'Pending Vendor Response', 'Resolution Agreed', 'Closed'
                open_issues = Issue.objects.filter(resolution_status__in=['Open', 'Pending Vendor Response', 'Resolution Agreed']).count()
            except Exception:
                pass
            
            try:
                # Count deliveries with expected_date OR actual_date this week
                deliveries_this_week = Delivery.objects.filter(
                    Q(expected_date__gte=week_start, expected_date__lte=week_end) |
                    Q(actual_date__gte=week_start, actual_date__lte=week_end)
                ).count()
                deliveries_last_week = Delivery.objects.filter(
                    Q(expected_date__gte=week_start - timedelta(days=7), expected_date__lt=week_start) |
                    Q(actual_date__gte=week_start - timedelta(days=7), actual_date__lt=week_start)
                ).count()
                deliveries_trend = ((deliveries_this_week - deliveries_last_week) / max(deliveries_last_week, 1)) * 100 if deliveries_last_week else 0
            except Exception:
                pass
            
            try:
                overdue_payments = Payment.objects.filter(status__in=['Unpaid', 'Partial'], due_date__lt=today).count()
                overdue_last_month = Payment.objects.filter(status__in=['Unpaid', 'Partial'], due_date__lt=last_month).count()
                overdue_trend = ((overdue_payments - overdue_last_month) / max(overdue_last_month, 1)) * 100 if overdue_last_month else 0
            except Exception:
                pass
            
            return Response({
                'active_apartments': {
                    'value': active_apartments,
                    'trend': round(apartments_trend, 1),
                    'trend_label': 'vs last month'
                },
                'pending_orders': {
                    'value': pending_orders,
                    'trend': round(orders_trend, 1),
                    'trend_label': 'vs last week'
                },
                'open_issues': {
                    'value': open_issues,
                    'trend': 0,
                    'trend_label': 'no change'
                },
                'deliveries_this_week': {
                    'value': deliveries_this_week,
                    'trend': round(deliveries_trend, 1),
                    'trend_label': 'vs last week'
                },
                'overdue_payments': {
                    'value': overdue_payments,
                    'trend': round(overdue_trend, 1),
                    'trend_label': 'vs last month'
                },
            })
        except Exception as e:
            return Response({
                'active_apartments': {'value': 0, 'trend': 0, 'trend_label': 'vs last month'},
                'pending_orders': {'value': 0, 'trend': 0, 'trend_label': 'vs last week'},
                'open_issues': {'value': 0, 'trend': 0, 'trend_label': 'no change'},
                'deliveries_this_week': {'value': 0, 'trend': 0, 'trend_label': 'vs last week'},
                'overdue_payments': {'value': 0, 'trend': 0, 'trend_label': 'vs last month'},
                'error': str(e)
            })


class DashboardOverviewView(APIView):
    """
    Get complete dashboard overview data for frontend
    """
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        tags=['Dashboard'],
        summary='Get complete dashboard overview',
        responses={
            200: OpenApiResponse(description='Complete dashboard data')
        }
    )
    def get(self, request):
        try:
            today = timezone.now().date()
            last_month = today - timedelta(days=30)
            last_week = today - timedelta(days=7)
            week_start = today - timedelta(days=today.weekday())
            week_end = week_start + timedelta(days=6)
            
            # KPI Stats - with safe defaults
            try:
                active_apartments = Apartment.objects.count()
                apartments_last_month = Apartment.objects.filter(created_at__date__lt=last_month).count()
            except Exception:
                active_apartments = 0
                apartments_last_month = 0
            
            try:
                pending_orders = Order.objects.filter(status__in=['draft', 'confirmed', 'processing']).count()
                pending_last_week = Order.objects.filter(status__in=['draft', 'confirmed', 'processing'], created_at__date__lt=last_week).count()
            except Exception:
                pending_orders = 0
                pending_last_week = 0
            
            try:
                # Issue statuses: 'Open', 'Pending Vendor Response', 'Resolution Agreed', 'Closed'
                open_issues = Issue.objects.filter(resolution_status__in=['Open', 'Pending Vendor Response', 'Resolution Agreed']).count()
            except Exception:
                open_issues = 0
            
            try:
                # Count deliveries with expected_date OR actual_date this week
                deliveries_this_week = Delivery.objects.filter(
                    Q(expected_date__gte=week_start, expected_date__lte=week_end) |
                    Q(actual_date__gte=week_start, actual_date__lte=week_end)
                ).count()
                deliveries_last_week = Delivery.objects.filter(
                    Q(expected_date__gte=week_start - timedelta(days=7), expected_date__lt=week_start) |
                    Q(actual_date__gte=week_start - timedelta(days=7), actual_date__lt=week_start)
                ).count()
            except Exception:
                deliveries_this_week = 0
                deliveries_last_week = 0
            
            try:
                overdue_payments = Payment.objects.filter(status__in=['Unpaid', 'Partial'], due_date__lt=today).count()
            except Exception:
                overdue_payments = 0
            
            # Orders vs Deliveries chart data (last 6 months)
            orders_chart = []
            month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            for i in range(5, -1, -1):
                try:
                    # Calculate month offset
                    target_month = today.month - i
                    target_year = today.year
                    while target_month <= 0:
                        target_month += 12
                        target_year -= 1
                    
                    month_name = month_names[target_month - 1]
                    
                    # Count orders for this month
                    ordered = Order.objects.filter(
                        created_at__year=target_year,
                        created_at__month=target_month
                    ).count()
                    
                    # Count delivered deliveries for this month (status='Delivered')
                    delivered = Delivery.objects.filter(
                        status='Delivered',
                        actual_date__year=target_year,
                        actual_date__month=target_month
                    ).count()
                    
                    orders_chart.append({
                        'month': month_name,
                        'ordered': ordered,
                        'delivered': delivered
                    })
                except Exception:
                    orders_chart.append({
                        'month': f'M{6-i}',
                        'ordered': 0,
                        'delivered': 0
                    })
            
            # Spending trend (last 6 months)
            spending_chart = []
            for i in range(5, -1, -1):
                try:
                    target_month = today.month - i
                    target_year = today.year
                    while target_month <= 0:
                        target_month += 12
                        target_year -= 1
                    
                    month_name = month_names[target_month - 1]
                    
                    monthly_spent = Payment.objects.filter(
                        created_at__year=target_year,
                        created_at__month=target_month
                    ).aggregate(total=Sum('amount_paid'))['total'] or 0
                    
                    spending_chart.append({
                        'month': month_name,
                        'amount': monthly_spent
                    })
                except Exception:
                    spending_chart.append({
                        'month': f'M{6-i}',
                        'amount': 0
                    })
            
            # Calculate trends safely
            def safe_trend(current, previous):
                if previous == 0:
                    return 0
                return round(((current - previous) / previous) * 100, 1)
            
            return Response({
                'kpi': {
                    'active_apartments': {
                        'value': active_apartments,
                        'trend': safe_trend(active_apartments, apartments_last_month),
                        'trend_label': 'vs last month'
                    },
                    'pending_orders': {
                        'value': pending_orders,
                        'trend': safe_trend(pending_orders, pending_last_week),
                        'trend_label': 'vs last week'
                    },
                    'open_issues': {
                        'value': open_issues,
                        'trend': 0,
                        'trend_label': 'no change'
                    },
                    'deliveries_this_week': {
                        'value': deliveries_this_week,
                        'trend': safe_trend(deliveries_this_week, deliveries_last_week),
                        'trend_label': 'vs last week'
                    },
                    'overdue_payments': {
                        'value': overdue_payments,
                        'trend': 0,
                        'trend_label': 'vs last month'
                    },
                },
                'orders_chart': orders_chart,
                'spending_chart': spending_chart,
            })
        except Exception as e:
            # Return safe defaults on any error
            return Response({
                'kpi': {
                    'active_apartments': {'value': 0, 'trend': 0, 'trend_label': 'vs last month'},
                    'pending_orders': {'value': 0, 'trend': 0, 'trend_label': 'vs last week'},
                    'open_issues': {'value': 0, 'trend': 0, 'trend_label': 'no change'},
                    'deliveries_this_week': {'value': 0, 'trend': 0, 'trend_label': 'vs last week'},
                    'overdue_payments': {'value': 0, 'trend': 0, 'trend_label': 'vs last month'},
                },
                'orders_chart': [{'month': m, 'ordered': 0, 'delivered': 0} for m in ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov']],
                'spending_chart': [{'month': m, 'amount': 0} for m in ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov']],
                'error': str(e)
            })
