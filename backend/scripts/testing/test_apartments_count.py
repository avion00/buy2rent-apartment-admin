#!/usr/bin/env python
"""
Test script to verify apartments_count field in Client API
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from clients.models import Client
from clients.serializers import ClientSerializer
from django.db.models import Count

def test_apartments_count():
    print("=" * 60)
    print("Testing apartments_count field in Client API")
    print("=" * 60)
    print()
    
    # Get all clients with apartments count
    clients = Client.objects.annotate(
        apartments_count_annotated=Count('apartments')
    ).all()
    
    print(f"Total clients: {clients.count()}")
    print()
    
    for client in clients:
        serializer = ClientSerializer(client)
        data = serializer.data
        
        print(f"Client: {data['name']}")
        print(f"  Email: {data['email']}")
        print(f"  Apartments Count: {data['apartments_count']}")
        print(f"  Status: {data['account_status']}")
        print()
    
    print("=" * 60)
    print("Test completed successfully!")
    print("=" * 60)
    print()
    print("API Response will now include 'apartments_count' field:")
    print("GET /api/clients/")
    print()
    print("Example response:")
    print('{')
    print('  "count": 2,')
    print('  "results": [')
    print('    {')
    print('      "id": "...",')
    print('      "name": "Client Name",')
    print('      "email": "client@example.com",')
    print('      "apartments_count": 3,  // <-- NEW FIELD')
    print('      ...')
    print('    }')
    print('  ]')
    print('}')

if __name__ == '__main__':
    test_apartments_count()
