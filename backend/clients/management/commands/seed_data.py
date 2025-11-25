from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, timedelta
from clients.models import Client
from apartments.models import Apartment
from vendors.models import Vendor
from products.models import Product
from deliveries.models import Delivery
from payments.models import Payment, PaymentHistory
from issues.models import Issue, IssuePhoto, AICommunicationLog
from activities.models import Activity, AINote


class Command(BaseCommand):
    help = 'Seed the database with sample data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')
        
        # Create vendors
        vendors_data = [
            {
                'name': 'IKEA',
                'company_name': 'IKEA Hungary Kft.',
                'contact_person': 'Sales Department',
                'email': 'sales@ikea.hu',
                'phone': '+36 1 123 4567',
                'website': 'https://www.ikea.com/hu/hu/',
                'notes': 'Main furniture supplier',
            },
            {
                'name': 'Royalty Line',
                'company_name': 'Royalty Line Europe',
                'contact_person': 'Customer Service',
                'email': 'support@royaltyline.eu',
                'phone': '+36 30 234 5678',
                'website': 'https://royaltyline.eu/',
                'notes': 'Kitchen and cookware specialist',
            },
            {
                'name': 'JYSK',
                'company_name': 'JYSK Hungary',
                'contact_person': 'B2B Sales',
                'email': 'b2b@jysk.hu',
                'phone': '+36 1 345 6789',
                'website': 'https://jysk.hu/',
                'notes': 'Bedroom furniture and textiles',
            },
        ]
        
        vendors = {}
        for vendor_data in vendors_data:
            vendor, created = Vendor.objects.get_or_create(
                name=vendor_data['name'],
                defaults=vendor_data
            )
            vendors[vendor.name] = vendor
            if created:
                self.stdout.write(f'Created vendor: {vendor.name}')
        
        # Create clients
        clients_data = [
            {
                'name': 'John Doe',
                'email': 'john.doe@example.com',
                'phone': '+36 20 123 4567',
                'account_status': 'Active',
                'type': 'Investor',
                'notes': 'Long-term investor with multiple properties',
            },
            {
                'name': 'Anna Nagy',
                'email': 'anna.nagy@example.com',
                'phone': '+36 30 987 6543',
                'account_status': 'Active',
                'type': 'Investor',
                'notes': '',
            },
            {
                'name': 'Miklós Szabó',
                'email': 'miklos.szabo@example.com',
                'phone': '+36 70 555 1234',
                'account_status': 'Active',
                'type': 'Investor',
                'notes': '',
            },
            {
                'name': 'Buy2Rent Internal',
                'email': 'info@buy2rent.com',
                'phone': '+36 1 234 5678',
                'account_status': 'Active',
                'type': 'Buy2Rent Internal',
                'notes': 'Internal company projects',
            },
        ]
        
        clients = {}
        for client_data in clients_data:
            client, created = Client.objects.get_or_create(
                email=client_data['email'],
                defaults=client_data
            )
            clients[client.name] = client
            if created:
                self.stdout.write(f'Created client: {client.name}')
        
        # Create apartments
        apartments_data = [
            {
                'name': 'Izabella utca 3 • A/12',
                'type': 'furnishing',
                'client': clients['John Doe'],
                'address': 'Izabella u. 3, Budapest',
                'status': 'Ordering',
                'designer': 'Barbara Kovács',
                'start_date': date(2025, 10, 15),
                'due_date': date(2025, 12, 5),
                'progress': 68,
                'notes': '',
            },
            {
                'name': 'Váci út 41 • 3.em 7',
                'type': 'renovating',
                'client': clients['Anna Nagy'],
                'address': 'Váci út 41, Budapest',
                'status': 'Renovating',
                'designer': 'Barbara Kovács',
                'start_date': date(2025, 9, 10),
                'due_date': date(2025, 11, 28),
                'progress': 52,
                'notes': '',
            },
            {
                'name': 'Andrássy út 25 • B/5',
                'type': 'furnishing',
                'client': clients['Miklós Szabó'],
                'address': 'Andrássy út 25, Budapest',
                'status': 'Design Approved',
                'designer': 'Barbara Kovács',
                'start_date': date(2025, 10, 1),
                'due_date': date(2025, 12, 1),
                'progress': 74,
                'notes': '',
            },
        ]
        
        apartments = {}
        for apt_data in apartments_data:
            apartment, created = Apartment.objects.get_or_create(
                name=apt_data['name'],
                defaults=apt_data
            )
            apartments[apartment.name] = apartment
            if created:
                self.stdout.write(f'Created apartment: {apartment.name}')
        
        # Create products
        products_data = [
            {
                'apartment': apartments['Izabella utca 3 • A/12'],
                'product': 'Kanapė – 3 személyes',
                'vendor': vendors['IKEA'],
                'vendor_link': 'https://www.ikea.com/hu/hu/',
                'sku': 'IK-SOFA-3',
                'unit_price': 159999,
                'qty': 1,
                'availability': 'In Stock',
                'status': 'Ordered',
                'eta': date(2025, 11, 14),
                'category': 'Living Room',
                'room': 'Nappali',
                'ordered_on': date(2025, 11, 1),
                'expected_delivery_date': date(2025, 11, 14),
                'payment_status': 'Partially Paid',
                'payment_due_date': date(2025, 11, 12),
                'payment_amount': 159999,
                'paid_amount': 63999,
                'issue_state': 'AI Resolving',
            },
            {
                'apartment': apartments['Izabella utca 3 • A/12'],
                'product': 'Étkezőasztal – Tölgy',
                'vendor': vendors['IKEA'],
                'vendor_link': 'https://www.ikea.com/hu/hu/',
                'sku': 'IK-DINE-OAK',
                'unit_price': 89999,
                'qty': 1,
                'availability': 'Backorder',
                'status': 'Waiting For Stock',
                'eta': date(2025, 11, 25),
                'category': 'Dining',
                'room': 'Étkező',
                'ordered_on': date(2025, 11, 2),
                'expected_delivery_date': date(2025, 11, 25),
                'payment_status': 'Partially Paid',
                'payment_due_date': date(2025, 11, 12),
                'payment_amount': 89999,
                'paid_amount': 36001,
                'issue_state': 'No Issue',
            },
            {
                'apartment': apartments['Izabella utca 3 • A/12'],
                'product': 'Marble Cookware Set',
                'vendor': vendors['Royalty Line'],
                'vendor_link': 'https://royaltyline.eu/',
                'sku': 'RL-COOK-SET',
                'unit_price': 12999,
                'qty': 2,
                'availability': 'In Stock',
                'status': 'Damaged',
                'eta': date(2025, 11, 12),
                'category': 'Kitchen',
                'room': 'Konyha',
                'ordered_on': date(2025, 10, 28),
                'actual_delivery_date': date(2025, 11, 4),
                'expected_delivery_date': date(2025, 11, 4),
                'payment_status': 'Paid',
                'payment_due_date': date(2025, 11, 3),
                'payment_amount': 25998,
                'paid_amount': 25998,
                'issue_state': 'AI Resolving',
            },
        ]
        
        for product_data in products_data:
            product, created = Product.objects.get_or_create(
                sku=product_data['sku'],
                apartment=product_data['apartment'],
                defaults=product_data
            )
            if created:
                self.stdout.write(f'Created product: {product.product}')
        
        self.stdout.write(
            self.style.SUCCESS('Successfully seeded database with sample data!')
        )
