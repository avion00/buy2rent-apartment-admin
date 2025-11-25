from rest_framework import serializers
from .models import Apartment
from clients.serializers import ClientSerializer


class ApartmentSerializer(serializers.ModelSerializer):
    owner = serializers.CharField(source='client.name', read_only=True)
    client_id = serializers.CharField(source='client.id', read_only=True)
    client_details = ClientSerializer(source='client', read_only=True)
    
    class Meta:
        model = Apartment
        fields = [
            'id', 'name', 'type', 'client', 'client_id', 'client_details',
            'owner', 'address', 'status', 'designer', 'start_date', 
            'due_date', 'progress', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
