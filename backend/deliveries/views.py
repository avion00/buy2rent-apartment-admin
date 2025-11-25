from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from config.swagger_utils import add_viewset_tags
from .models import Delivery
from .serializers import DeliverySerializer


@add_viewset_tags('Deliveries', 'Delivery')
class DeliveryViewSet(viewsets.ModelViewSet):
    queryset = Delivery.objects.select_related('apartment', 'vendor').all()
    serializer_class = DeliverySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['apartment', 'vendor', 'status']
    search_fields = ['order_reference', 'apartment__name', 'vendor__name']
    ordering_fields = ['expected_date', 'actual_date', 'created_at']
    ordering = ['-expected_date']
