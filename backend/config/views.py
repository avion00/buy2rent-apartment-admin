from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.urls import reverse
from django.db.models import Q
import logging

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def global_search(request):
    """
    Global search endpoint that searches across all entities.
    Query parameter: q (search query)
    Returns results grouped by entity type.
    """
    query = request.query_params.get('q', '').strip()
    limit = int(request.query_params.get('limit', 5))
    
    logger.info(f"Global search called with query: '{query}', limit: {limit}")
    
    if not query or len(query) < 2:
        return Response({
            'apartments': [],
            'clients': [],
            'vendors': [],
            'products': [],
            'deliveries': [],
            'issues': [],
            'query': query,
            'total_results': 0
        })
    
    results = {
        'apartments': [],
        'clients': [],
        'vendors': [],
        'products': [],
        'deliveries': [],
        'issues': [],
        'query': query,
        'total_results': 0
    }
    
    # Search Apartments
    try:
        from apartments.models import Apartment
        apartments = Apartment.objects.filter(
            Q(name__icontains=query) |
            Q(address__icontains=query) |
            Q(status__icontains=query) |
            Q(designer__icontains=query)
        )[:limit]
        results['apartments'] = [
            {
                'id': str(a.id),
                'name': a.name,
                'address': a.address,
                'status': a.status,
                'type': a.type,
            }
            for a in apartments
        ]
        logger.info(f"Found {len(results['apartments'])} apartments")
    except Exception as e:
        logger.error(f"Error searching apartments: {e}")
    
    # Search Clients
    try:
        from clients.models import Client
        clients = Client.objects.filter(
            Q(name__icontains=query) |
            Q(email__icontains=query) |
            Q(phone__icontains=query)
        )[:limit]
        results['clients'] = [
            {
                'id': str(c.id),
                'name': c.name,
                'email': c.email,
                'phone': c.phone,
                'account_status': c.account_status,
                'type': c.type,
            }
            for c in clients
        ]
        logger.info(f"Found {len(results['clients'])} clients")
    except Exception as e:
        logger.error(f"Error searching clients: {e}")
    
    # Search Vendors
    try:
        from vendors.models import Vendor
        vendors = Vendor.objects.filter(
            Q(name__icontains=query) |
            Q(company_name__icontains=query) |
            Q(email__icontains=query) |
            Q(contact_person__icontains=query)
        )[:limit]
        results['vendors'] = [
            {
                'id': str(v.id),
                'name': v.name,
                'company_name': v.company_name,
                'email': v.email,
                'contact_person': v.contact_person,
            }
            for v in vendors
        ]
        logger.info(f"Found {len(results['vendors'])} vendors")
    except Exception as e:
        logger.error(f"Error searching vendors: {e}")
    
    # Search Products
    try:
        from products.models import Product
        products = Product.objects.filter(
            Q(product__icontains=query) |
            Q(vendor__icontains=query) |
            Q(sku__icontains=query) |
            Q(category__icontains=query) |
            Q(brand__icontains=query)
        )[:limit]
        results['products'] = [
            {
                'id': str(p.id),
                'apartment_id': str(p.apartment_id),
                'product': p.product,
                'vendor': p.vendor,
                'sku': p.sku,
                'status': p.status,
                'category': p.category,
            }
            for p in products
        ]
        logger.info(f"Found {len(results['products'])} products")
    except Exception as e:
        logger.error(f"Error searching products: {e}")
    
    # Search Deliveries
    try:
        from deliveries.models import Delivery
        deliveries = Delivery.objects.filter(
            Q(order_reference__icontains=query) |
            Q(vendor__icontains=query) |
            Q(status__icontains=query) |
            Q(tracking_number__icontains=query)
        )[:limit]
        results['deliveries'] = [
            {
                'id': str(d.id),
                'order_reference': d.order_reference,
                'vendor': d.vendor,
                'status': d.status,
                'expected_date': str(d.expected_date) if d.expected_date else None,
            }
            for d in deliveries
        ]
        logger.info(f"Found {len(results['deliveries'])} deliveries")
    except Exception as e:
        logger.error(f"Error searching deliveries: {e}")
    
    # Search Issues
    try:
        from issues.models import Issue
        issues = Issue.objects.filter(
            Q(product_name__icontains=query) |
            Q(description__icontains=query) |
            Q(type__icontains=query) |
            Q(vendor__icontains=query)
        )[:limit]
        results['issues'] = [
            {
                'id': str(i.id),
                'apartment_id': str(i.apartment_id),
                'product_name': i.product_name,
                'type': i.type,
                'status': i.status,
                'priority': i.priority,
            }
            for i in issues
        ]
        logger.info(f"Found {len(results['issues'])} issues")
    except Exception as e:
        logger.error(f"Error searching issues: {e}")
    
    # Calculate total results
    results['total_results'] = (
        len(results['apartments']) +
        len(results['clients']) +
        len(results['vendors']) +
        len(results['products']) +
        len(results['deliveries']) +
        len(results['issues'])
    )
    
    logger.info(f"Total search results: {results['total_results']}")
    
    return Response(results)


@api_view(['GET'])
@permission_classes([AllowAny])
def api_overview(request):
    """API overview endpoint"""
    base_url = request.build_absolute_uri('/api/')
    
    endpoints = {
        'authentication': {
            'login': request.build_absolute_uri('/auth/login/'),
            'logout': request.build_absolute_uri('/auth/logout/'),
            'signup': request.build_absolute_uri('/auth/signup/'),
            'profile': request.build_absolute_uri('/auth/profile/'),
            'check': request.build_absolute_uri('/auth/check/'),
        },
        'core_entities': {
            'clients': f"{base_url}clients/",
            'apartments': f"{base_url}apartments/",
            'vendors': f"{base_url}vendors/",
            'products': f"{base_url}products/",
            'deliveries': f"{base_url}deliveries/",
            'payments': f"{base_url}payments/",
            'issues': f"{base_url}issues/",
            'activities': f"{base_url}activities/",
        },
        'supporting_endpoints': {
            'payment_history': f"{base_url}payment-history/",
            'issue_photos': f"{base_url}issue-photos/",
            'ai_communication_logs': f"{base_url}ai-communication-logs/",
            'ai_notes': f"{base_url}ai-notes/",
            'manual_notes': f"{base_url}manual-notes/",
        },
        'admin': request.build_absolute_uri('/admin/'),
        'documentation': {
            'swagger_ui': request.build_absolute_uri('/api/docs/'),
            'redoc': request.build_absolute_uri('/api/redoc/'),
            'openapi_schema': request.build_absolute_uri('/api/schema/'),
            'browsable_api': f"{base_url}",
        },
    }
    
    return Response({
        'message': 'Buy2Rent Apartment Admin API',
        'version': '1.0.0',
        'endpoints': endpoints,
        'features': [
            'Client Management',
            'Apartment Tracking',
            'Vendor Management', 
            'Product Management',
            'Delivery Tracking',
            'Payment Management',
            'Issue Management',
            'Activity Logging',
            'AI Communication',
        ]
    })
