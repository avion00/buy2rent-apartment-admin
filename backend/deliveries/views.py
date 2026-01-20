from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
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
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """
        Update delivery status with detailed information
        """
        delivery = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status:
            return Response(
                {'error': 'status field is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate status choice
        valid_statuses = [choice[0] for choice in Delivery.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response(
                {'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        old_status = delivery.status
        delivery.status = new_status
        
        # Update delivery fields based on status
        if new_status == 'Received':
            # Update received_by and actual_date on the delivery record
            if request.data.get('received_by'):
                delivery.received_by = request.data.get('received_by')
            if request.data.get('actual_date'):
                delivery.actual_date = request.data.get('actual_date')
        
        delivery.save()
        
        # Prepare notes for status history
        status_notes = request.data.get('status_notes', '')
        if not status_notes:
            status_notes = f"Status changed from {old_status} to {new_status}"
        
        # Create status history entry with all details
        DeliveryStatusHistory.objects.create(
            delivery=delivery,
            status=new_status,
            notes=status_notes,
            changed_by=request.user.get_full_name() if request.user.is_authenticated else 'System',
            received_by=request.data.get('received_by', ''),
            location=request.data.get('location', ''),
            delay_reason=request.data.get('delay_reason', '')
        )
        
        serializer = self.get_serializer(delivery)
        return Response(serializer.data)
