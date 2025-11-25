from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.urls import reverse


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
