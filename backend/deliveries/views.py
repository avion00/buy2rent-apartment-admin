from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from config.swagger_utils import add_viewset_tags
from .models import Delivery, DeliveryStatusHistory
from .serializers import DeliverySerializer, DeliveryListSerializer


@add_viewset_tags('Deliveries', 'Delivery')
class DeliveryViewSet(viewsets.ModelViewSet):
    queryset = Delivery.objects.select_related('apartment', 'vendor', 'order').prefetch_related('status_history').all()
    serializer_class = DeliverySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['apartment', 'vendor', 'status', 'priority', 'order']
    search_fields = ['order_reference', 'apartment__name', 'vendor__name', 'tracking_number']
    ordering_fields = ['expected_date', 'actual_date', 'priority', 'created_at']
    ordering = ['-expected_date']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return DeliveryListSerializer
        return DeliverySerializer
    
    def perform_create(self, serializer):
        """Create initial status history entry when delivery is created"""
        delivery = serializer.save()
        DeliveryStatusHistory.objects.create(
            delivery=delivery,
            status=delivery.status,
            notes=delivery.notes or f"Delivery created with status: {delivery.status}",
            changed_by=self.request.user.get_full_name() if self.request.user.is_authenticated else 'System'
        )
    
    def perform_update(self, serializer):
        """Create status history entry when status changes"""
        old_status = self.get_object().status
        old_notes = self.get_object().notes
        delivery = serializer.save()
        
        # Check if status changed or notes were updated
        new_status = delivery.status
        new_notes = delivery.notes
        
        if old_status != new_status or (new_notes and new_notes != old_notes):
            # Get additional data from request
            data = self.request.data
            DeliveryStatusHistory.objects.create(
                delivery=delivery,
                status=new_status,
                notes=data.get('status_notes', new_notes) or f"Status changed to: {new_status}",
                changed_by=self.request.user.get_full_name() if self.request.user.is_authenticated else 'System',
                received_by=data.get('received_by', ''),
                location=data.get('location', ''),
                delay_reason=data.get('delay_reason', '')
            )
