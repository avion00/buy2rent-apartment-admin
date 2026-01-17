from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction, connection
from django.db.models import Sum, Count, Q
from config.swagger_utils import add_viewset_tags
from .models import Apartment
from .serializers import ApartmentSerializer


@add_viewset_tags('Apartments', 'Apartment')
class ApartmentViewSet(viewsets.ModelViewSet):
    queryset = Apartment.objects.select_related('client').all()
    serializer_class = ApartmentSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['type', 'status', 'client']
    search_fields = ['name', 'address', 'client__name']
    ordering_fields = ['name', 'start_date', 'due_date', 'created_at']
    ordering = ['-created_at']
    
    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Get statistics for a specific apartment"""
        apartment = self.get_object()
        
        try:
            from products.models import Product
            from orders.models import Order
            from issues.models import Issue
            from payments.models import Payment
            from datetime import date
            
            products = Product.objects.filter(apartment=apartment)
            
            # Product statistics
            total_items = products.count()
            ordered_items = products.filter(
                Q(status__icontains='Ordered') | 
                Q(status__icontains='Shipped') | 
                Q(status__icontains='Delivered')
            ).count()
            delivered_items = products.filter(status__icontains='Delivered').count()
            
            # Calculate total value from products
            total_value = 0
            for product in products:
                try:
                    unit_price = float(product.unit_price) if product.unit_price else 0
                    qty = int(product.qty) if product.qty else 0
                    total_value += unit_price * qty
                except (ValueError, TypeError):
                    pass
            
            # Payment statistics
            total_payable = 0
            total_paid = 0
            overdue_count = 0
            
            for product in products:
                try:
                    payment_amount = float(product.payment_amount) if product.payment_amount else 0
                    paid_amount = float(product.paid_amount) if product.paid_amount else 0
                    total_payable += payment_amount
                    total_paid += paid_amount
                    
                    # Check if overdue
                    if product.payment_due_date and payment_amount > paid_amount:
                        if product.payment_due_date < date.today():
                            overdue_count += 1
                except (ValueError, TypeError):
                    pass
            
            outstanding_balance = total_payable - total_paid
            
            # Issue statistics
            open_issues = Issue.objects.filter(
                apartment=apartment
            ).exclude(
                resolution_status__in=['Closed', 'Resolved']
            ).count()
            
            return Response({
                'total_items': total_items,
                'ordered_items': ordered_items,
                'delivered_items': delivered_items,
                'total_value': round(total_value, 2),
                'total_payable': round(total_payable, 2),
                'total_paid': round(total_paid, 2),
                'outstanding_balance': round(outstanding_balance, 2),
                'open_issues': open_issues,
                'overdue_payments': overdue_count,
            })
        except Exception as e:
            return Response({
                'total_items': 0,
                'ordered_items': 0,
                'delivered_items': 0,
                'total_value': 0,
                'total_payable': 0,
                'total_paid': 0,
                'outstanding_balance': 0,
                'open_issues': 0,
                'overdue_payments': 0,
                'error': str(e)
            })
    
    @action(detail=True, methods=['get'])
    def activities(self, request, pk=None):
        """Get recent activities for a specific apartment"""
        apartment = self.get_object()
        
        try:
            from orders.models import Order
            from issues.models import Issue
            from payments.models import Payment
            
            activities = []
            
            # Get recent orders
            orders = Order.objects.filter(apartment=apartment).order_by('-created_at')[:5]
            for order in orders:
                activities.append({
                    'id': f'order-{order.id}',
                    'type': 'order',
                    'summary': f'Order {order.po_number} created for {order.vendor_name}',
                    'timestamp': order.created_at.isoformat(),
                    'icon': 'ShoppingCart',
                    'actor': 'System',
                })
            
            # Get recent issues
            issues = Issue.objects.filter(apartment=apartment).order_by('-created_at')[:5]
            for issue in issues:
                activities.append({
                    'id': f'issue-{issue.id}',
                    'type': 'issue',
                    'summary': f'Issue reported: {issue.title}',
                    'timestamp': issue.created_at.isoformat(),
                    'icon': 'Mail',
                    'actor': 'System',
                })
            
            # Get recent payments
            payments = Payment.objects.filter(apartment=apartment).order_by('-created_at')[:5]
            for payment in payments:
                activities.append({
                    'id': f'payment-{payment.id}',
                    'type': 'payment',
                    'summary': f'Payment of {payment.amount_paid} HUF made',
                    'timestamp': payment.created_at.isoformat(),
                    'icon': 'CreditCard',
                    'actor': 'System',
                })
            
            # Sort by timestamp and return top 10
            activities.sort(key=lambda x: x['timestamp'], reverse=True)
            
            return Response(activities[:10])
        except Exception as e:
            return Response([])
    
    def perform_destroy(self, instance):
        """Override to properly handle cascade deletion of related objects"""
        # For SQLite, temporarily disable foreign key constraints
        cursor = connection.cursor()
        is_sqlite = connection.vendor == 'sqlite'
        
        try:
            if is_sqlite:
                cursor.execute('PRAGMA foreign_keys = OFF;')
            
            with transaction.atomic():
                # Delete all related objects
                instance.issues.all().delete()
                instance.products.all().delete()
                instance.orders.all().delete()
                instance.payments.all().delete()
                instance.deliveries.all().delete()
                instance.activities.all().delete()
                instance.ai_notes.all().delete()
                instance.delete()
        finally:
            if is_sqlite:
                cursor.execute('PRAGMA foreign_keys = ON;')
