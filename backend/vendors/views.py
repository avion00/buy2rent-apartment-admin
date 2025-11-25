from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Sum, Avg, F
from config.swagger_utils import add_viewset_tags
from .models import Vendor
from .serializers import VendorSerializer, VendorDetailSerializer
from .vendor_view_serializers import VendorViewDetailSerializer


@add_viewset_tags('Vendors', 'Vendor')
class VendorViewSet(viewsets.ModelViewSet):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'company_name', 'email', 'contact_person']
    ordering_fields = ['name', 'created_at', 'reliability', 'orders_count']
    ordering = ['name']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return VendorDetailSerializer
        return VendorSerializer

    @action(detail=True, methods=['get'])
    def products(self, request, pk=None):
        """
        Get all products for this vendor
        """
        vendor = self.get_object()
        from products.serializers import ProductSerializer
        products = vendor.products.select_related('apartment').all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def orders(self, request, pk=None):
        """
        Get all orders for this vendor
        """
        vendor = self.get_object()
        from orders.serializers import OrderListSerializer
        orders = vendor.orders.select_related('apartment').all()
        serializer = OrderListSerializer(orders, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def issues(self, request, pk=None):
        """
        Get all issues for this vendor
        """
        vendor = self.get_object()
        from issues.serializers import IssueSerializer
        issues = vendor.issues.select_related('apartment', 'product').all()
        serializer = IssueSerializer(issues, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def payments(self, request, pk=None):
        """
        Get all payments for this vendor
        """
        vendor = self.get_object()
        from payments.serializers import PaymentSerializer
        payments = vendor.payments.select_related('apartment').all()
        serializer = PaymentSerializer(payments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """
        Get comprehensive statistics for this vendor
        """
        vendor = self.get_object()
        
        # Product statistics
        products = vendor.products.all()
        total_products = products.count()
        delivered_products = products.filter(status='Delivered').count()
        products_with_issues = products.exclude(issue_state='No Issue').count()
        
        # Order statistics
        orders = vendor.orders.all()
        total_orders = orders.count()
        delivered_orders = orders.filter(status='delivered').count()
        total_order_value = orders.aggregate(total=Sum('total'))['total'] or 0
        
        # Payment statistics
        payments = vendor.payments.all()
        total_payments = payments.count()
        paid_payments = payments.filter(status='Paid').count()
        total_payment_amount = payments.aggregate(total=Sum('total_amount'))['total'] or 0
        outstanding_amount = payments.aggregate(total=Sum('total_amount'))['total'] or 0
        outstanding_amount -= payments.aggregate(total=Sum('amount_paid'))['total'] or 0
        
        # Issue statistics
        issues = vendor.issues.all()
        total_issues = issues.count()
        open_issues = issues.exclude(status='Closed').count()
        
        # Performance metrics
        on_time_delivery_rate = 0
        if delivered_orders > 0:
            on_time_orders = orders.filter(
                status='delivered',
                actual_delivery__lte=F('expected_delivery')
            ).count()
            on_time_delivery_rate = (on_time_orders / delivered_orders) * 100
        
        return Response({
            'vendor_info': {
                'id': vendor.id,
                'name': vendor.name,
                'reliability': float(vendor.reliability),
                'orders_count': vendor.orders_count,
                'active_issues': vendor.active_issues,
            },
            'products': {
                'total': total_products,
                'delivered': delivered_products,
                'with_issues': products_with_issues,
            },
            'orders': {
                'total': total_orders,
                'delivered': delivered_orders,
                'total_value': float(total_order_value),
            },
            'payments': {
                'total': total_payments,
                'paid': paid_payments,
                'total_amount': float(total_payment_amount),
                'outstanding_amount': float(outstanding_amount),
            },
            'issues': {
                'total': total_issues,
                'open': open_issues,
            },
            'performance': {
                'on_time_delivery_rate': round(on_time_delivery_rate, 1),
                'quality_rating': 4.5,  # This could be calculated from reviews/ratings
                'order_accuracy': 98.0,  # This could be calculated from order vs delivery data
            }
        })

    @action(detail=False, methods=['get'])
    def search_by_name(self, request):
        """
        Search vendors by name (for frontend routing compatibility)
        """
        name = request.query_params.get('name', '').strip()
        if not name:
            return Response(
                {'error': 'name parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Convert URL-friendly name back to actual name
        search_name = name.replace('-', ' ')
        vendor = Vendor.objects.filter(name__iexact=search_name).first()
        
        if not vendor:
            return Response(
                {'error': 'Vendor not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = VendorDetailSerializer(vendor)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def frontend_detail(self, request, pk=None):
        """
        Get vendor details in format optimized for VendorView.tsx frontend
        """
        vendor = self.get_object()
        serializer = VendorViewDetailSerializer(vendor)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def frontend_detail_by_name(self, request):
        """
        Get vendor details by name for VendorView.tsx frontend routing
        """
        name = request.query_params.get('name', '').strip()
        if not name:
            return Response(
                {'error': 'name parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Convert URL-friendly name back to actual name
        search_name = name.replace('-', ' ')
        vendor = Vendor.objects.filter(name__iexact=search_name).first()
        
        if not vendor:
            return Response(
                {'error': 'Vendor not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = VendorViewDetailSerializer(vendor)
        return Response(serializer.data)
