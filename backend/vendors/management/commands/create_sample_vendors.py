from django.core.management.base import BaseCommand
from vendors.models import Vendor
from clients.models import Client
from apartments.models import Apartment


class Command(BaseCommand):
    help = 'Create sample vendors for testing VendorView'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample vendors...')
        
        # Create sample vendors
        vendors_data = [
            {
                'name': 'IKEA Hungary',
                'email': 'contact@ikea.hu',
                'website': 'https://www.ikea.com/hu/',
                'logo': '🏠',
                'lead_time': '7-14 days',
                'reliability': 4.2,
                'orders_count': 15,
                'active_issues': 2,
                'company_name': 'IKEA Hungary Kft.',
                'contact_person': 'John Doe',
                'phone': '+36-1-234-5678',
                'address': '1234 Budapest Street',
                'city': 'Budapest',
                'country': 'Hungary'
            },
            {
                'name': 'Home Depot',
                'email': 'info@homedepot.com',
                'website': 'https://www.homedepot.com/',
                'logo': '🔨',
                'lead_time': '3-7 days',
                'reliability': 4.5,
                'orders_count': 25,
                'active_issues': 1,
                'company_name': 'Home Depot Inc.',
                'contact_person': 'Jane Smith',
                'phone': '+1-555-123-4567',
                'address': '5678 Main Street',
                'city': 'Atlanta',
                'country': 'USA'
            },
            {
                'name': 'Leroy Merlin',
                'email': 'contact@leroymerlin.hu',
                'website': 'https://www.leroymerlin.hu/',
                'logo': '🏗️',
                'lead_time': '5-10 days',
                'reliability': 4.0,
                'orders_count': 12,
                'active_issues': 3,
                'company_name': 'Leroy Merlin Hungary',
                'contact_person': 'Peter Nagy',
                'phone': '+36-1-987-6543',
                'address': '9876 Construction Ave',
                'city': 'Budapest',
                'country': 'Hungary'
            }
        ]
        
        created_count = 0
        for vendor_data in vendors_data:
            vendor, created = Vendor.objects.get_or_create(
                name=vendor_data['name'],
                defaults=vendor_data
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Created vendor: {vendor.name} (ID: {vendor.id})')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'ℹ️  Vendor already exists: {vendor.name} (ID: {vendor.id})')
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} new vendors!')
        )
        
        # Show all vendors
        self.stdout.write('\n📋 All vendors in database:')
        for vendor in Vendor.objects.all():
            self.stdout.write(f'  - {vendor.name} (ID: {vendor.id})')
            self.stdout.write(f'    URL: /vendors/{vendor.id}')
            self.stdout.write(f'    Name URL: /vendors/{vendor.name.lower().replace(" ", "-")}')
            self.stdout.write('')
