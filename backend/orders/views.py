from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Prefetch
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes, OpenApiExample
from config.swagger_utils import add_viewset_tags
from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderListSerializer
from .import_service import OrderImportService


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

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """
        Update order status
        """
        order = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status:
            return Response(
                {'error': 'status field is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate status choice
        valid_statuses = [choice[0] for choice in Order.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response(
                {'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.status = new_status
        order.save()
        
        serializer = self.get_serializer(order)
        return Response(serializer.data)

    @extend_schema(
        tags=['Orders'],
        operation_id='import_order',
        summary='Import order from Excel/CSV file',
        description='Upload an Excel or CSV file to create an order with all products as order items',
        request={
            'multipart/form-data': {
                'type': 'object',
                'properties': {
                    'file': {'type': 'string', 'format': 'binary'},
                    'apartment_id': {'type': 'string', 'format': 'uuid'},
                    'vendor_id': {'type': 'string', 'format': 'uuid'},
                    'po_number': {'type': 'string'},
                    'status': {'type': 'string'},
                    'confirmation_code': {'type': 'string'},
                    'tracking_number': {'type': 'string'},
                    'expected_delivery': {'type': 'string', 'format': 'date'},
                    'shipping_address': {'type': 'string'},
                    'notes': {'type': 'string'},
                },
                'required': ['file', 'apartment_id', 'vendor_id', 'po_number']
            }
        },
        responses={
            200: {
                'type': 'object',
                'properties': {
                    'message': {'type': 'string'},
                    'order_created': {'type': 'boolean'},
                    'order_id': {'type': 'string'},
                    'po_number': {'type': 'string'},
                    'total_items': {'type': 'integer'},
                    'successful_imports': {'type': 'integer'},
                    'failed_imports': {'type': 'integer'},
                    'total_amount': {'type': 'number'},
                    'errors': {'type': 'array', 'items': {'type': 'string'}}
                }
            },
            400: {
                'type': 'object',
                'properties': {
                    'error': {'type': 'string'},
                    'errors': {'type': 'array', 'items': {'type': 'string'}}
                }
            }
        },
        examples=[
            OpenApiExample(
                'Success Response',
                value={
                    'message': 'Order and items imported successfully',
                    'order_created': True,
                    'order_id': 'uuid-here',
                    'po_number': 'PO-2025-00001',
                    'total_items': 15,
                    'successful_imports': 15,
                    'failed_imports': 0,
                    'total_amount': 25000.00,
                    'errors': []
                }
            )
        ]
    )
    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def import_order(self, request):
        """
        Import order from Excel/CSV file
        Creates an order and imports all products from the file as order items
        """
        try:
            # Get uploaded file
            uploaded_file = request.FILES.get('file')
            if not uploaded_file:
                return Response(
                    {'error': 'No file uploaded'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get order data from request
            order_data = {
                'apartment_id': request.data.get('apartment_id'),
                'vendor_id': request.data.get('vendor_id'),
                'po_number': request.data.get('po_number'),
                'status': request.data.get('status', 'draft'),
                'confirmation_code': request.data.get('confirmation_code', ''),
                'tracking_number': request.data.get('tracking_number', ''),
                'expected_delivery': request.data.get('expected_delivery'),
                'shipping_address': request.data.get('shipping_address', ''),
                'notes': request.data.get('notes', ''),
            }
            
            # Validate required fields
            if not order_data['apartment_id']:
                return Response(
                    {'error': 'apartment_id is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not order_data['vendor_id']:
                return Response(
                    {'error': 'vendor_id is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not order_data['po_number']:
                return Response(
                    {'error': 'po_number is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Process import
            import_service = OrderImportService()
            result = import_service.process_import(
                file=uploaded_file,
                order_data=order_data,
                user=request.user
            )
            
            if result['success']:
                return Response({
                    'message': result['message'],
                    'order_created': True,
                    'order_id': result['data']['order_id'],
                    'po_number': result['data']['po_number'],
                    'total_items': result['data']['total_items'],
                    'successful_imports': result['data']['successful_imports'],
                    'failed_imports': result['data']['failed_imports'],
                    'total_amount': result['data']['total_amount'],
                    'errors': result['data'].get('errors', [])
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'Import failed',
                    'errors': result.get('errors', [])
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                'error': 'Import failed',
                'errors': [str(e)]
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

