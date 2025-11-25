#!/usr/bin/env python
"""Check clients in database for validation issues"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from clients.models import Client
from apartments.models import Apartment

print("=" * 60)
print("CLIENT VALIDATION CHECK")
print("=" * 60)

# Check all clients
clients = Client.objects.all()
print(f"\n✓ Total Clients: {clients.count()}")

if clients.count() == 0:
    print("  ⚠️  NO CLIENTS FOUND!")
else:
    print("\nClient Details:")
    for client in clients:
        print(f"\n  Client: {client.name}")
        print(f"    ID: {client.id}")
        print(f"    Email: {client.email}")
        print(f"    Phone: {client.phone}")
        print(f"    Type: {client.type}")
        print(f"    Status: {client.account_status}")
        
        # Check for validation issues
        issues = []
        if not client.email:
            issues.append("Missing email")
        if '@' not in client.email:
            issues.append("Invalid email format")
        if client.type not in ['Investor', 'Buy2Rent Internal']:
            issues.append(f"Invalid type: {client.type}")
        if client.account_status not in ['Active', 'Inactive']:
            issues.append(f"Invalid status: {client.account_status}")
            
        if issues:
            print(f"    ⚠️  ISSUES: {', '.join(issues)}")
        else:
            print(f"    ✓ Valid")

# Check apartments
print("\n" + "=" * 60)
print("APARTMENT CHECK")
print("=" * 60)

apartments = Apartment.objects.all()
print(f"\n✓ Total Apartments: {apartments.count()}")

if apartments.count() > 0:
    for apt in apartments:
        print(f"\n  Apartment: {apt.name}")
        print(f"    Client: {apt.client.name if apt.client else 'NO CLIENT'}")
        print(f"    Client ID: {apt.client.id if apt.client else 'N/A'}")

print("\n" + "=" * 60)
