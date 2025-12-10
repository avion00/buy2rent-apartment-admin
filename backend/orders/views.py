from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Prefetch
from config.swagger_utils import add_viewset_tags
from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderListSerializer


@add_viewset_tags('Orders', 'Order')
class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.select_related('apartment', 'vendor').prefetch_related(
        Prefetch('items', queryset=OrderItem.objects.select_related('product'))
    ).all()
    serializer_class = OrderSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['apartment', 'vendor', 'status', 'placed_on']
    search_fields = ['po_number', 'vendor__name', 'apartment__name', 'notes']
    ordering_fields = ['po_number', 'placed_on', 'total', 'created_at']
    ordering = ['-placed_on']

    def get_serializer_class(self):
        if self.action == 'list':
            return OrderListSerializer
        return OrderSerializer

    @action(detail=False, methods=['get'])
    def by_vendor(self, request):
        """
        Get all orders for a specific vendor
        """
        vendor_id = request.query_params.get('vendor_id')
        if not vendor_id:
            return Response(
                {'error': 'vendor_id parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        orders = self.get_queryset().filter(vendor=vendor_id)
        serializer = OrderListSerializer(orders, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_apartment(self, request):
        """
        Get all orders for a specific apartment
        """
        apartment_id = request.query_params.get('apartment_id')
        if not apartment_id:
            return Response(
                {'error': 'apartment_id parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        orders = self.get_queryset().filter(apartment=apartment_id)
        serializer = OrderListSerializer(orders, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Get order statistics
        """
        vendor_id = request.query_params.get('vendor_id')
        apartment_id = request.query_params.get('apartment_id')
        
        queryset = self.get_queryset()
        
        if vendor_id:
            queryset = queryset.filter(vendor=vendor_id)
        if apartment_id:
            queryset = queryset.filter(apartment=apartment_id)
        
        total_orders = queryset.count()
        delivered_orders = queryset.filter(status='delivered').count()
        in_transit_orders = queryset.filter(status='in_transit').count()
        pending_orders = queryset.filter(status__in=['draft', 'confirmed']).count()
        
        total_value = sum(order.total for order in queryset)
        
        return Response({
            'total_orders': total_orders,
            'delivered_orders': delivered_orders,
            'in_transit_orders': in_transit_orders,
            'pending_orders': pending_orders,
            'total_value': total_value,
        })

