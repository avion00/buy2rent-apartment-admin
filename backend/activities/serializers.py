from rest_framework import serializers
from .models import Activity, AINote, ManualNote
from apartments.serializers import ApartmentSerializer


class ActivitySerializer(serializers.ModelSerializer):
    apartment_details = ApartmentSerializer(source='apartment', read_only=True)
    
    class Meta:
        model = Activity
        fields = [
            'id', 'apartment', 'apartment_details', 'timestamp', 'actor', 
            'icon', 'summary', 'type', 'created_at'
        ]
        read_only_fields = ['timestamp', 'created_at']


class AINoteSerializer(serializers.ModelSerializer):
    apartment_details = ApartmentSerializer(source='apartment', read_only=True)
    
    class Meta:
        model = AINote
        fields = [
            'id', 'apartment', 'apartment_details', 'timestamp', 'sender', 
            'content', 'email_subject', 'related_to'
        ]
        read_only_fields = ['timestamp']


class ManualNoteSerializer(serializers.ModelSerializer):
    apartment_details = ApartmentSerializer(source='apartment', read_only=True)
    
    class Meta:
        model = ManualNote
        fields = ['id', 'apartment', 'apartment_details', 'content', 'updated_at']
        read_only_fields = ['updated_at']
