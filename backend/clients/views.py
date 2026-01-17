from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema_view, extend_schema, OpenApiParameter, OpenApiResponse
from drf_spectacular.openapi import OpenApiTypes
from django.db.models import Sum, Count, Q
from .models import Client
from .serializers import ClientSerializer, ClientDetailSerializer


@extend_schema_view(
    list=extend_schema(
        tags=['Clients'],
        summary='List Clients',
        description='Get list of all clients with filtering and search capabilities'
    ),
    create=extend_schema(
        tags=['Clients'],
        summary='Create Client',
        description='Create a new client record'
    ),
    retrieve=extend_schema(
        tags=['Clients'],
        summary='Get Client',
        description='Retrieve a specific client by ID'
    ),
    update=extend_schema(
        tags=['Clients'],
        summary='Update Client',
        description='Update a client record completely'
    ),
    partial_update=extend_schema(
        tags=['Clients'],
        summary='Partial Update Client',
        description='Partially update a client record'
    ),
    destroy=extend_schema(
        tags=['Clients'],
        summary='Delete Client',
        description='Delete a client record'
    ),
)
class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['account_status', 'type']
    search_fields = ['name', 'email']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    
    def get_queryset(self):
        """
        Optimize queryset by annotating apartments count
        This prevents N+1 queries when listing clients
        """
        return Client.objects.annotate(
            apartments_count_annotated=Count('apartments')
        ).all()

    def get_serializer_class(self):
        if self.action == 'retrieve' or self.action == 'details':
            return ClientDetailSerializer
        return ClientSerializer

    @extend_schema(
        tags=['Clients'],
        summary='Get Client Apartments',
        description='Get all apartments associated with a specific client',
        responses={
            200: OpenApiResponse(
                description='List of apartments for the client',
                response={
                    'type': 'object',
                    'properties': {
                        'count': {'type': 'integer'},
                        'apartments': {
                            'type': 'array',
                            'items': {'type': 'object'}
                        }
                    }
                }
            )
        }
    )
    @action(detail=True, methods=['get'])
    def apartments(self, request, pk=None):
        """
        Get all apartments for this client with summary statistics
        """
        client = self.get_object()
        from apartments.serializers import ApartmentSerializer
        
        apartments = client.apartments.all()
        serializer = ApartmentSerializer(apartments, many=True)
        
        return Response({
            'count': apartments.count(),
            'apartments': serializer.data
        })

    @extend_schema(
        tags=['Clients'],
        summary='Get Client Products',
        description='Get all products across all apartments for a specific client',
        responses={
            200: OpenApiResponse(
                description='List of products for the client',
                response={
                    'type': 'object',
                    'properties': {
                        'count': {'type': 'integer'},
                        'total_value': {'type': 'number'},
                        'products': {
                            'type': 'array',
                            'items': {'type': 'object'}
                        }
                    }
                }
            )
        }
    )
    @action(detail=True, methods=['get'])
    def products(self, request, pk=None):
        """
        Get all products across all apartments for this client
        """
        client = self.get_object()
        from products.serializers import ProductSerializer
        from products.models import Product
        from decimal import Decimal
        
        # Get all apartments for this client
        apartment_ids = client.apartments.values_list('id', flat=True)
        
        # Get all products for these apartments
        products = Product.objects.filter(apartment_id__in=apartment_ids).select_related(
            'apartment', 'vendor'
        )
        
        serializer = ProductSerializer(products, many=True, context={'request': request})
        
        # Calculate total value from unit_price * qty
        total_value = Decimal('0')
        for product in products:
            if product.unit_price:
                total_value += (product.unit_price * product.qty)
        
        return Response({
            'count': products.count(),
            'total_value': float(total_value),
            'products': serializer.data
        })

    @extend_schema(
        tags=['Clients'],
        summary='Get Client Statistics',
        description='Get comprehensive statistics for a client including apartments, products, and financial data',
        responses={
            200: OpenApiResponse(
                description='Client statistics',
                response={
                    'type': 'object',
                    'properties': {
                        'apartments': {
                            'type': 'object',
                            'properties': {
                                'total': {'type': 'integer'},
                                'by_status': {'type': 'object'},
                                'by_type': {'type': 'object'}
                            }
                        },
                        'products': {
                            'type': 'object',
                            'properties': {
                                'total': {'type': 'integer'},
                                'total_value': {'type': 'number'},
                                'by_status': {'type': 'object'}
                            }
                        },
                        'financial': {
                            'type': 'object',
                            'properties': {
                                'total_spent': {'type': 'number'},
                                'total_paid': {'type': 'number'},
                                'outstanding': {'type': 'number'}
                            }
                        }
                    }
                }
            )
        }
    )
    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """
        Get comprehensive statistics for this client
        """
        client = self.get_object()
        from products.models import Product
        from decimal import Decimal
        
        # Get apartments
        apartments = client.apartments.all()
        
        # Apartment statistics
        apartment_stats = {
            'total': apartments.count(),
            'by_status': {},
            'by_type': {}
        }
        
        for apt in apartments:
            status = apt.status
            apt_type = apt.type
            apartment_stats['by_status'][status] = apartment_stats['by_status'].get(status, 0) + 1
            apartment_stats['by_type'][apt_type] = apartment_stats['by_type'].get(apt_type, 0) + 1
        
        # Get all products for this client's apartments
        apartment_ids = apartments.values_list('id', flat=True)
        products = Product.objects.filter(apartment_id__in=apartment_ids)
        
        # Calculate totals
        total_value = Decimal('0')
        total_paid = Decimal('0')
        total_payable = Decimal('0')
        product_status_counts = {}
        
        for product in products:
            # Calculate value
            if product.unit_price:
                total_value += (product.unit_price * product.qty)
            
            # Sum paid and payable amounts (handle None values)
            if product.paid_amount:
                total_paid += product.paid_amount
            if product.payment_amount:
                total_payable += product.payment_amount
            
            # Count by status
            status = product.status
            product_status_counts[status] = product_status_counts.get(status, 0) + 1
        
        # Product statistics
        product_stats = {
            'total': products.count(),
            'total_value': float(total_value),
            'by_status': product_status_counts
        }
        
        # Financial statistics
        financial_stats = {
            'total_spent': float(total_value),
            'total_paid': float(total_paid),
            'outstanding': float(total_payable - total_paid)
        }
        
        return Response({
            'apartments': apartment_stats,
            'products': product_stats,
            'financial': financial_stats
        })

    @extend_schema(
        tags=['Clients'],
        summary='Get Client Details with Related Data',
        description='Get complete client profile with apartments, products, and statistics',
        responses={
            200: ClientDetailSerializer
        }
    )
    @action(detail=True, methods=['get'])
    def details(self, request, pk=None):
        """
        Get complete client details including apartments and products
        """
        client = self.get_object()
        serializer = self.get_serializer(client)
        
        # Get additional data for the client
        from orders.models import Order
        from deliveries.models import Delivery
        from issues.models import Issue
        from vendors.models import Vendor
        from products.models import Product
        
        # Get apartments for this client
        apartments = client.apartments.all()
        apartment_ids = apartments.values_list('id', flat=True)
        
        # Get orders count
        orders_count = Order.objects.filter(apartment_id__in=apartment_ids).count()
        
        # Get deliveries count
        deliveries_count = Delivery.objects.filter(apartment_id__in=apartment_ids).count()
        
        # Get issues count (open and total)
        issues = Issue.objects.filter(apartment_id__in=apartment_ids)
        open_issues_count = issues.filter(status__in=['Open', 'In Progress']).count()
        total_issues_count = issues.count()
        
        # Get unique vendors count
        products = Product.objects.filter(apartment_id__in=apartment_ids)
        vendor_ids = products.values_list('vendor_id', flat=True).distinct()
        vendors_count = vendor_ids.count()
        
        # Add extra data to response
        response_data = serializer.data
        response_data['orders'] = {
            'count': orders_count
        }
        response_data['deliveries'] = {
            'count': deliveries_count
        }
        response_data['issues'] = {
            'open_count': open_issues_count,
            'total_count': total_issues_count
        }
        response_data['vendors'] = {
            'count': vendors_count
        }
        
        return Response(response_data)
