#!/usr/bin/env python
"""Quick script to check apartments in database"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apartments.models import Apartment
from clients.models import Client

print("=" * 60)
print("DATABASE CHECK")
print("=" * 60)

# Check clients
client_count = Client.objects.count()
print(f"\n✓ Total Clients: {client_count}")
if client_count > 0:
    print("  Clients:")
    for client in Client.objects.all()[:5]:
        print(f"    - {client.name} (ID: {client.id})")

# Check apartments
apt_count = Apartment.objects.count()
print(f"\n✓ Total Apartments: {apt_count}")

if apt_count == 0:
    print("  ⚠️  NO APARTMENTS FOUND IN DATABASE!")
    print("  This is why the frontend shows 0 apartments.")
else:
    print("  Apartments:")
    for apt in Apartment.objects.all()[:10]:
        print(f"    - {apt.name}")
        print(f"      Type: {apt.type}")
        print(f"      Client: {apt.client.name}")
        print(f"      Status: {apt.status}")
        print(f"      Created: {apt.created_at}")
        print()

print("=" * 60)
