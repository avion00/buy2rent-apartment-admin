from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction, connection
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
