from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from config.swagger_utils import add_viewset_tags
from .models import Payment, PaymentHistory
from .serializers import (
    PaymentSerializer, 
    PaymentHistorySerializer,
    PaymentHistoryCreateSerializer,
    PaymentCreateFromOrderSerializer
)


@add_viewset_tags('Payments', 'Payment')
class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.select_related(
        'apartment', 'vendor', 'order'
    ).prefetch_related(
        'payment_history', 
        'order_items__product',
        'products__category'
    ).all()
    serializer_class = PaymentSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['apartment', 'vendor', 'status', 'order']
    search_fields = ['order_reference', 'apartment__name', 'vendor__name', 'order__po_number']
    ordering_fields = ['due_date', 'total_amount', 'created_at']
    ordering = ['-due_date']
    
    @action(detail=False, methods=['post'], url_path='from-order')
    def create_from_order(self, request):
        """
        Create a payment from an existing order.
        
        Request body:
        {
            "order": "order-uuid",
            "order_items": ["item-uuid-1", "item-uuid-2"],  // optional, defaults to all items
            "due_date": "2025-01-15",
            "notes": "Optional notes"
        }
        """
        serializer = PaymentCreateFromOrderSerializer(data=request.data)
        if serializer.is_valid():
            payment = serializer.save()
            # Refetch with all related data for proper serialization
            payment = Payment.objects.select_related(
                'apartment', 'vendor', 'order'
            ).prefetch_related(
                'payment_history', 
                'order_items__product',
                'products__category'
            ).get(pk=payment.pk)
            # Return the full payment details
            return Response(
                PaymentSerializer(payment).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@add_viewset_tags('Payments', 'Payment History')
class PaymentHistoryViewSet(viewsets.ModelViewSet):
    queryset = PaymentHistory.objects.select_related('payment').all()
    serializer_class = PaymentHistorySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['payment', 'method']
    search_fields = ['reference_no', 'payment__order_reference']
    ordering_fields = ['date', 'amount', 'created_at']
    ordering = ['-date', '-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PaymentHistoryCreateSerializer
        return PaymentHistorySerializer
