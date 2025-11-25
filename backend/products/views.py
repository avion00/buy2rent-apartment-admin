from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.http import HttpResponse, JsonResponse
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from drf_spectacular.openapi import OpenApiTypes
from config.swagger_utils import add_viewset_tags
from apartments.models import Apartment
from .models import Product
from .category_models import ProductCategory, ImportSession
from .serializers import (
    ProductSerializer, ProductCategorySerializer, 
    ImportSessionSerializer, ProductImportSerializer
)
from .import_service import ProductImportService
import pandas as pd
import io


@add_viewset_tags('Products', 'Product')
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('apartment', 'vendor').all()
    serializer_class = ProductSerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'apartment', 'vendor', 'availability', 'status', 'payment_status', 
        'issue_state', 'category', 'room', 'replacement_requested', 'replacement_approved'
    ]
    search_fields = ['product', 'sku', 'vendor__name', 'apartment__name', 'brand', 'category']
    ordering_fields = ['product', 'unit_price', 'created_at', 'expected_delivery_date', 'actual_delivery_date']
    ordering = ['-created_at']

    def get_queryset(self):
        """
        Optionally restricts the returned products to a given apartment,
        by filtering against a `apartment` query parameter in the URL.
        """
        queryset = super().get_queryset()
        apartment_id = self.request.query_params.get('apartment', None)
        if apartment_id is not None:
            queryset = queryset.filter(apartment=apartment_id)
        return queryset

    @extend_schema(
        tags=['Products'],
        operation_id='get_products_by_apartment',
        summary='Get products by apartment',
        description='Get all products for a specific apartment',
        parameters=[
            OpenApiParameter(
                name='apartment_id',
                type=OpenApiTypes.UUID,
                location=OpenApiParameter.QUERY,
                description='UUID of the apartment'
            )
        ]
    )
    @action(detail=False, methods=['get'])
    def by_apartment(self, request):
        """
        Get all products for a specific apartment
        """
        apartment_id = request.query_params.get('apartment_id')
        if not apartment_id:
            return Response(
                {'error': 'apartment_id parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        products = self.get_queryset().filter(apartment=apartment_id)
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)

    @extend_schema(
        tags=['Products'],
        operation_id='update_product_status',
        summary='Update product status',
        description='Update product status and status tags'
    )
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """
        Update product status and status tags
        """
        product = self.get_object()
        new_status = request.data.get('status')
        status_tags = request.data.get('status_tags', [])
        
        if new_status:
            product.status = new_status
        
        # Handle status tags update
        if status_tags:
            # Update the main status to the first tag if provided
            if status_tags and status_tags[0] in [choice[0] for choice in Product.STATUS_CHOICES]:
                product.status = status_tags[0]
        
        product.save()
        serializer = self.get_serializer(product)
        return Response(serializer.data)

    @extend_schema(
        tags=['Products'],
        operation_id='update_product_delivery_status',
        summary='Update delivery status',
        description='Update delivery status tags and related fields'
    )
    @action(detail=True, methods=['patch'])
    def update_delivery_status(self, request, pk=None):
        """
        Update delivery status tags and related fields
        """
        product = self.get_object()
        delivery_tags = request.data.get('delivery_status_tags', [])
        
        # Update delivery-related fields based on tags
        if 'Delivered' in delivery_tags and not product.actual_delivery_date:
            from datetime import date
            product.actual_delivery_date = date.today()
        
        product.save()
        serializer = self.get_serializer(product)
        return Response(serializer.data)

    @extend_schema(
        tags=['Products'],
        operation_id='get_product_statistics',
        summary='Get product statistics',
        description='Get product statistics for an apartment',
        parameters=[
            OpenApiParameter(
                name='apartment_id',
                type=OpenApiTypes.UUID,
                location=OpenApiParameter.QUERY,
                description='UUID of the apartment'
            )
        ]
    )
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Get product statistics for an apartment
        """
        apartment_id = request.query_params.get('apartment_id')
        if not apartment_id:
            return Response(
                {'error': 'apartment_id parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        products = self.get_queryset().filter(apartment=apartment_id)
        
        total_items = products.count()
        ordered_items = products.filter(status__in=['Ordered', 'Shipped', 'Delivered']).count()
        delivered_items = products.filter(status='Delivered').count()
        open_issues = products.exclude(issue_state='No Issue').count()
        
        total_value = sum(p.total_amount for p in products)
        total_payable = sum(p.payment_amount or 0 for p in products)
        total_paid = sum(p.paid_amount for p in products)
        outstanding_balance = total_payable - total_paid
        
        # Count overdue payments
        from datetime import date
        overdue_payments = products.filter(
            payment_due_date__lt=date.today(),
            payment_status__in=['Unpaid', 'Partially Paid']
        ).count()
        
        return Response({
            'total_items': total_items,
            'ordered_items': ordered_items,
            'delivered_items': delivered_items,
            'open_issues': open_issues,
            'total_value': total_value,
            'total_payable': total_payable,
            'total_paid': total_paid,
            'outstanding_balance': outstanding_balance,
            'overdue_payments': overdue_payments,
        })

    @extend_schema(
        tags=['Products'],
        operation_id='import_products',
        summary='Import products from Excel/CSV file',
        description='Upload an Excel or CSV file to import products. Each sheet in Excel becomes a category.',
        request=ProductImportSerializer,
        responses={
            200: {
                'type': 'object',
                'properties': {
                    'success': {'type': 'boolean'},
                    'message': {'type': 'string'},
                    'data': {
                        'type': 'object',
                        'properties': {
                            'total_products': {'type': 'integer'},
                            'successful_imports': {'type': 'integer'},
                            'failed_imports': {'type': 'integer'},
                            'sheets_processed': {'type': 'integer'},
                            'errors': {'type': 'array', 'items': {'type': 'string'}}
                        }
                    }
                }
            },
            400: {
                'type': 'object',
                'properties': {
                    'success': {'type': 'boolean'},
                    'message': {'type': 'string'},
                    'errors': {'type': 'array', 'items': {'type': 'string'}}
                }
            }
        },
        examples=[
            OpenApiExample(
                'Success Response',
                value={
                    'success': True,
                    'message': 'Import completed successfully',
                    'data': {
                        'total_products': 25,
                        'successful_imports': 23,
                        'failed_imports': 2,
                        'sheets_processed': 3,
                        'errors': []
                    }
                }
            )
        ]
    )
    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def import_excel(self, request):
        """
        Import products from Excel/CSV file
        """
        try:
            # Get apartment ID
            apartment_id = request.data.get('apartment_id')
            if not apartment_id:
                return Response(
                    {'error': 'apartment_id is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get uploaded file
            uploaded_file = request.FILES.get('file')
            if not uploaded_file:
                return Response(
                    {'error': 'No file uploaded'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate apartment exists
            apartment = get_object_or_404(Apartment, id=apartment_id)
            
            # Process import
            import_service = ProductImportService()
            result = import_service.process_import(
                file=uploaded_file,
                apartment_id=apartment_id,
                user=request.user
            )
            
            if result['success']:
                return Response({
                    'success': True,
                    'message': 'Import completed successfully',
                    'data': {
                        'total_products': result.get('total_products', 0),
                        'successful_imports': result.get('successful_imports', 0),
                        'failed_imports': result.get('failed_imports', 0),
                        'sheets_processed': result.get('sheets_processed', 1),
                        'errors': result.get('errors', [])
                    }
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'success': False,
                    'message': 'Import failed',
                    'errors': result.get('errors', [])
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                'success': False,
                'message': 'Import failed',
                'errors': [str(e)]
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @extend_schema(
        tags=['Products'],
        operation_id='create_apartment_and_import',
        summary='Create apartment and import products',
        description='Create a new apartment and import products from Excel/CSV file in one operation',
        request={
            'multipart/form-data': {
                'type': 'object',
                'properties': {
                    'file': {'type': 'string', 'format': 'binary'},
                    'apartment_name': {'type': 'string'},
                    'apartment_type': {'type': 'string'},
                    'owner': {'type': 'string'},
                    'status': {'type': 'string'},
                    'designer': {'type': 'string'},
                    'start_date': {'type': 'string', 'format': 'date'},
                    'due_date': {'type': 'string', 'format': 'date'},
                    'address': {'type': 'string'}
                }
            }
        },
        responses={
            201: {
                'type': 'object',
                'properties': {
                    'success': {'type': 'boolean'},
                    'message': {'type': 'string'},
                    'data': {
                        'type': 'object',
                        'properties': {
                            'apartment_id': {'type': 'string'},
                            'apartment_name': {'type': 'string'},
                            'total_products': {'type': 'integer'},
                            'successful_imports': {'type': 'integer'},
                            'failed_imports': {'type': 'integer'},
                            'sheets_processed': {'type': 'integer'},
                            'errors': {'type': 'array', 'items': {'type': 'string'}}
                        }
                    }
                }
            }
        }
    )
    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def create_apartment_and_import(self, request):
        """
        Create apartment and import products from Excel/CSV file in one operation
        """
        try:
            # Get uploaded file
            uploaded_file = request.FILES.get('file')
            if not uploaded_file:
                return Response(
                    {'error': 'No file uploaded'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get apartment data
            apartment_name = request.data.get('apartment_name')
            if not apartment_name:
                return Response(
                    {'error': 'apartment_name is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create apartment
            apartment_data = {
                'name': apartment_name,
                'type': request.data.get('apartment_type', 'furnishing'),
                'status': request.data.get('status', 'Planning'),
                'designer': request.data.get('designer', ''),
                'address': request.data.get('address', 'Address not provided'),
            }
            
            # Handle client/owner - need to find or create client
            from clients.models import Client
            owner_name = request.data.get('owner', '')
            if owner_name:
                client, created = Client.objects.get_or_create(
                    name=owner_name,
                    defaults={'email': '', 'phone': ''}
                )
                apartment_data['client'] = client
            else:
                # Create a default client if none provided
                client, created = Client.objects.get_or_create(
                    name='Default Client',
                    defaults={'email': '', 'phone': ''}
                )
                apartment_data['client'] = client
            
            # Handle dates - these are required fields
            from datetime import date, timedelta
            start_date = request.data.get('start_date')
            due_date = request.data.get('due_date')
            
            # Use provided dates or defaults
            apartment_data['start_date'] = start_date if start_date else date.today()
            apartment_data['due_date'] = due_date if due_date else (date.today() + timedelta(days=90))
            
            # Remove empty values
            apartment_data = {k: v for k, v in apartment_data.items() if v is not None and v != ''}
            
            apartment = Apartment.objects.create(**apartment_data)
            
            # Process import with the new apartment
            import_service = ProductImportService()
            result = import_service.process_import(
                file=uploaded_file,
                apartment_id=str(apartment.id),
                user=request.user
            )
            
            if result['success']:
                return Response({
                    'success': True,
                    'message': 'Apartment created and products imported successfully',
                    'data': {
                        'apartment_id': str(apartment.id),
                        'apartment_name': apartment.name,
                        'total_products': result.get('total_products', 0),
                        'successful_imports': result.get('successful_imports', 0),
                        'failed_imports': result.get('failed_imports', 0),
                        'sheets_processed': result.get('sheets_processed', 1),
                        'errors': result.get('errors', [])
                    }
                }, status=status.HTTP_201_CREATED)
            else:
                # If import failed, we might want to keep the apartment or delete it
                # For now, let's keep it but return the error
                return Response({
                    'success': False,
                    'message': 'Apartment created but product import failed',
                    'apartment_id': str(apartment.id),
                    'apartment_name': apartment.name,
                    'errors': result.get('errors', [])
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Error creating apartment and importing products: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @extend_schema(
        tags=['Products'],
        operation_id='download_import_template',
        summary='Download Excel import template',
        description='Download a sample Excel template with multiple sheets for product import',
        responses={
            200: {
                'type': 'string',
                'format': 'binary',
                'description': 'Excel file download'
            }
        }
    )
    @action(detail=False, methods=['get'])
    def import_template(self, request):
        """
        Download Excel template for product import
        """
        try:
            # Create sample template with all Excel columns
            template_data = {
                'S.N': [1, 2, 3],
                'Room': ['Living Room', 'Bedroom', 'Kitchen'],
                'Product Name': ['Sample Product 1', 'Sample Product 2', 'Sample Product 3'],
                'Product Image': ['', '', ''],
                'Quantity': [1, 2, 1],
                'Cost': ['1000 Ft', '2000 Ft', '1500 Ft'],
                'Total Cost': ['1000 Ft', '4000 Ft', '1500 Ft'],
                'Description': ['Product description 1', 'Product description 2', 'Product description 3'],
                'link': ['https://example.com/product1', 'https://example.com/product2', 'https://example.com/product3'],
                'size': ['Small', 'Medium', 'Large'],
                'nm': ['10', '20', '15'],
                'plusz nm': ['2', '3', '1'],
                'price/nm': ['100 Ft', '100 Ft', '100 Ft'],
                'price/package': ['500 Ft', '1000 Ft', '750 Ft'],
                'nm/package': ['5', '10', '7.5'],
                'all package': ['2', '2', '2'],
                'package need to order': ['2', '2', '2'],
                'all price': ['1000 Ft', '2000 Ft', '1500 Ft']
            }
            
            df = pd.DataFrame(template_data)
            
            # Create Excel file in memory with multiple sheets
            output = io.BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df.to_excel(writer, sheet_name='Heating', index=False)
                df.to_excel(writer, sheet_name='Laminated floors', index=False)
                df.to_excel(writer, sheet_name='Furniture', index=False)
            
            output.seek(0)
            
            response = HttpResponse(
                output.getvalue(),
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = 'attachment; filename="product_import_template.xlsx"'
            
            return response
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @extend_schema(
        tags=['Products'],
        operation_id='get_product_categories',
        summary='Get product categories for an apartment',
        description='Get all product categories (Excel sheets) for a specific apartment',
        parameters=[
            OpenApiParameter(
                name='apartment_id',
                type=OpenApiTypes.UUID,
                location=OpenApiParameter.QUERY,
                description='UUID of the apartment'
            )
        ],
        responses={200: ProductCategorySerializer(many=True)}
    )
    @action(detail=False, methods=['get'])
    def categories(self, request):
        """
        Get product categories for an apartment
        """
        apartment_id = request.query_params.get('apartment_id')
        if not apartment_id:
            return Response(
                {'error': 'apartment_id parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            apartment = get_object_or_404(Apartment, id=apartment_id)
            categories = ProductCategory.objects.filter(apartment=apartment)
            serializer = ProductCategorySerializer(categories, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @extend_schema(
        tags=['Products'],
        operation_id='get_products_by_category',
        summary='Get products by category',
        description='Get all products for a specific category',
        parameters=[
            OpenApiParameter(
                name='category_id',
                type=OpenApiTypes.UUID,
                location=OpenApiParameter.QUERY,
                description='UUID of the category'
            )
        ]
    )
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """
        Get products by category
        """
        category_id = request.query_params.get('category_id')
        if not category_id:
            return Response(
                {'error': 'category_id parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            category = get_object_or_404(ProductCategory, id=category_id)
            products = self.get_queryset().filter(category=category)
            serializer = self.get_serializer(products, many=True)
            return Response({
                'category': ProductCategorySerializer(category).data,
                'products': serializer.data
            })
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @extend_schema(
        tags=['Products'],
        operation_id='get_import_sessions',
        summary='Get import sessions for an apartment',
        description='Get all import sessions for a specific apartment',
        parameters=[
            OpenApiParameter(
                name='apartment_id',
                type=OpenApiTypes.UUID,
                location=OpenApiParameter.QUERY,
                description='UUID of the apartment'
            )
        ],
        responses={200: ImportSessionSerializer(many=True)}
    )
    @action(detail=False, methods=['get'])
    def import_sessions(self, request):
        """
        Get import sessions for an apartment
        """
        apartment_id = request.query_params.get('apartment_id')
        if not apartment_id:
            return Response(
                {'error': 'apartment_id parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            apartment = get_object_or_404(Apartment, id=apartment_id)
            sessions = ImportSession.objects.filter(apartment=apartment)
            serializer = ImportSessionSerializer(sessions, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @extend_schema(
        tags=['Products'],
        operation_id='delete_import_session',
        summary='Delete an import session',
        description='Delete an import session and all its products',
        parameters=[
            OpenApiParameter(
                name='session_id',
                type=OpenApiTypes.UUID,
                location=OpenApiParameter.QUERY,
                description='UUID of the import session'
            )
        ]
    )
    @action(detail=False, methods=['delete'])
    def delete_import_session(self, request):
        """
        Delete an import session and all its products
        """
        session_id = request.query_params.get('session_id')
        if not session_id:
            return Response(
                {'error': 'session_id parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            session = get_object_or_404(ImportSession, id=session_id)
            
            # Delete all products from this session
            Product.objects.filter(import_session=session).delete()
            
            # Delete categories if they have no products left
            categories = ProductCategory.objects.filter(
                apartment=session.apartment,
                import_file_name=session.file_name
            )
            for category in categories:
                if category.products.count() == 0:
                    category.delete()
            
            # Delete the session
            session.delete()
            
            return Response({'message': 'Import session deleted successfully'})
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
