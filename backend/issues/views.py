from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from config.swagger_utils import add_viewset_tags
from .models import Issue, IssuePhoto, AICommunicationLog
from .serializers import IssueSerializer, IssuePhotoSerializer, AICommunicationLogSerializer


@add_viewset_tags('Issues', 'Issue')
class IssueViewSet(viewsets.ModelViewSet):
    queryset = Issue.objects.select_related('apartment', 'product', 'vendor').prefetch_related('photos', 'ai_communication_log').all()
    serializer_class = IssueSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['apartment', 'product', 'vendor', 'status', 'priority', 'ai_activated']
    search_fields = ['type', 'description', 'product__product', 'vendor__name']
    ordering_fields = ['reported_on', 'expected_resolution', 'created_at']
    ordering = ['-created_at']


@add_viewset_tags('Issues', 'Issue Photo')
class IssuePhotoViewSet(viewsets.ModelViewSet):
    queryset = IssuePhoto.objects.select_related('issue').all()
    serializer_class = IssuePhotoSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['issue']
    ordering = ['-uploaded_at']


@add_viewset_tags('Issues', 'AI Communication Log')
class AICommunicationLogViewSet(viewsets.ModelViewSet):
    queryset = AICommunicationLog.objects.select_related('issue').all()
    serializer_class = AICommunicationLogSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['issue', 'sender']
    search_fields = ['message']
    ordering = ['timestamp']
