from rest_framework import serializers
from .models import Issue, IssuePhoto, AICommunicationLog
from apartments.serializers import ApartmentSerializer
from products.serializers import ProductSerializer
from vendors.serializers import VendorSerializer


class IssuePhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = IssuePhoto
        fields = ['id', 'url', 'uploaded_at']
        read_only_fields = ['uploaded_at']


class AICommunicationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AICommunicationLog
        fields = ['id', 'timestamp', 'sender', 'message']
        read_only_fields = ['timestamp']


class IssueSerializer(serializers.ModelSerializer):
    apartment_details = ApartmentSerializer(source='apartment', read_only=True)
    product_details = ProductSerializer(source='product', read_only=True)
    vendor_details = VendorSerializer(source='vendor', read_only=True)
    product_name = serializers.CharField(read_only=True)
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    photos = IssuePhotoSerializer(many=True, read_only=True)
    ai_communication_log = AICommunicationLogSerializer(many=True, read_only=True)
    
    class Meta:
        model = Issue
        fields = [
            'id', 'apartment', 'apartment_details', 'product', 'product_details', 
            'product_name', 'vendor', 'vendor_details', 'vendor_name', 'type', 
            'description', 'reported_on', 'status', 'priority', 'expected_resolution', 
            'vendor_contact', 'impact', 'replacement_eta', 'ai_activated', 
            'resolution_status', 'photos', 'ai_communication_log', 'created_at', 'updated_at'
        ]
        read_only_fields = ['reported_on', 'created_at', 'updated_at']
