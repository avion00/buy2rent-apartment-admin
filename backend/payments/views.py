from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from config.swagger_utils import add_viewset_tags
from .models import Payment, PaymentHistory
from .serializers import PaymentSerializer, PaymentHistorySerializer


@add_viewset_tags('Payments', 'Payment')
class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.select_related('apartment', 'vendor').prefetch_related('payment_history').all()
    serializer_class = PaymentSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['apartment', 'vendor', 'status']
    search_fields = ['order_reference', 'apartment__name', 'vendor__name']
    ordering_fields = ['due_date', 'total_amount', 'created_at']
    ordering = ['-due_date']


@add_viewset_tags('Payments', 'Payment History')
class PaymentHistoryViewSet(viewsets.ModelViewSet):
    queryset = PaymentHistory.objects.select_related('payment').all()
    serializer_class = PaymentHistorySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['payment', 'method']
    search_fields = ['reference_no', 'payment__order_reference']
    ordering_fields = ['date', 'amount']
    ordering = ['-date']
