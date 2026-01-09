"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from clients.views import ClientViewSet
from apartments.views import ApartmentViewSet
from vendors.views import VendorViewSet
from products.views import ProductViewSet
from orders.views import OrderViewSet
from deliveries.views import DeliveryViewSet
from payments.views import PaymentViewSet, PaymentHistoryViewSet
from issues.views import IssueViewSet, IssuePhotoViewSet, AICommunicationLogViewSet
from issues.views_web import email_conversations_view
from activities.views import ActivityViewSet, AINoteViewSet, ManualNoteViewSet
from accounts.user_management_views import UserManagementViewSet
from notifications.views import NotificationViewSet, NotificationPreferenceViewSet
from .views import api_overview, global_search
from utils.views import enhance_text
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

# Create router and register viewsets
router = DefaultRouter()
router.register(r'clients', ClientViewSet)
router.register(r'apartments', ApartmentViewSet)
router.register(r'vendors', VendorViewSet)
router.register(r'products', ProductViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'deliveries', DeliveryViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'payment-history', PaymentHistoryViewSet)
router.register(r'issues', IssueViewSet)
router.register(r'issue-photos', IssuePhotoViewSet)
router.register(r'ai-communication-logs', AICommunicationLogViewSet)
router.register(r'activities', ActivityViewSet)
router.register(r'ai-notes', AINoteViewSet)
router.register(r'manual-notes', ManualNoteViewSet)
router.register(r'users', UserManagementViewSet)
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'notification-preferences', NotificationPreferenceViewSet, basename='notification-preference')

urlpatterns = [
    path('', api_overview, name='api_overview'),
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
    path('auth/', include('accounts.urls')),  # Updated to use secure accounts app
    path('api/dashboard/', include('dashboard.urls')),  # Dashboard endpoints
    path('api/reports/', include('reports.urls')),  # Report generation endpoints
    path('api/search/', global_search, name='global_search'),  # Global search endpoint
    path('api/utils/enhance-text/', enhance_text, name='enhance_text'),  # AI text enhancement
    
    # Email conversations view
    path('email-conversations/', email_conversations_view, name='email_conversations'),
    
    # Product import endpoints are now part of the main ProductViewSet
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
