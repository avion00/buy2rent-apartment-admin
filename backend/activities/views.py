from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from config.swagger_utils import add_viewset_tags
from .models import Activity, AINote, ManualNote
from .serializers import ActivitySerializer, AINoteSerializer, ManualNoteSerializer


@add_viewset_tags('Activities', 'Activity')
class ActivityViewSet(viewsets.ModelViewSet):
    queryset = Activity.objects.select_related('apartment').all()
    serializer_class = ActivitySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['apartment', 'type', 'actor']
    search_fields = ['summary', 'actor']
    ordering_fields = ['timestamp', 'created_at']
    ordering = ['-timestamp']


@add_viewset_tags('Activities', 'AI Note')
class AINoteViewSet(viewsets.ModelViewSet):
    queryset = AINote.objects.select_related('apartment').all()
    serializer_class = AINoteSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['apartment', 'sender', 'related_to']
    search_fields = ['content', 'email_subject']
    ordering_fields = ['timestamp']
    ordering = ['-timestamp']


@add_viewset_tags('Activities', 'Manual Note')
class ManualNoteViewSet(viewsets.ModelViewSet):
    queryset = ManualNote.objects.select_related('apartment').all()
    serializer_class = ManualNoteSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['apartment']
    search_fields = ['content']
    ordering = ['-updated_at']
