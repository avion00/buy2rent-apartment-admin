from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema_view, extend_schema
from .models import Client
from .serializers import ClientSerializer


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
