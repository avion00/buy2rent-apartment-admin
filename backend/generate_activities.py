"""
Script to generate activities from existing data
Run this in your Django environment: python generate_activities.py
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from activities.models import Activity
from orders.models import Order
from payments.models import Payment
from deliveries.models import Delivery
from issues.models import Issue
from apartments.models import Apartment
from vendors.models import Vendor
from clients.models import Client
from products.models import Product

def generate_activities():
    """Generate activities from existing data"""
    print("Generating activities from existing data...")
    
    count = 0
    
    # Generate activities for recent orders
    print("\nProcessing Orders...")
    for order in Order.objects.order_by('-created_at')[:20]:
        try:
            apartment = order.apartment
            vendor = order.vendor
            apt_name = apartment.name if apartment else 'Unknown'
            vendor_name = vendor.name if vendor else 'Unknown'
            
            Activity.objects.create(
                activity_type='order',
                action='created',
                title='New order placed',
                description=f"Order {order.po_number} for {apt_name} from {vendor_name}",
                apartment=apartment,
                object_id=str(order.id),
                object_type='Order',
                actor='System',
                summary=f"Order {order.po_number} for {apt_name} from {vendor_name}",
                type='order',
                icon='shopping-cart',
                metadata={'po_number': order.po_number, 'status': order.status, 'total': float(order.total) if order.total else 0}
            )
            count += 1
            print(f"  Created activity for order: {order.po_number}")
        except Exception as e:
            print(f"  Error creating activity for order {order.po_number}: {e}")
    
    # Generate activities for recent payments
    print("\nProcessing Payments...")
    for payment in Payment.objects.order_by('-created_at')[:20]:
        try:
            apartment = payment.apartment
            vendor = payment.vendor
            apt_name = apartment.name if apartment else 'Unknown'
            vendor_name = vendor.name if vendor else 'Unknown'
            
            action = 'payment_received' if payment.status == 'Paid' else 'created'
            title = 'Payment received' if payment.status == 'Paid' else 'Payment created'
            
            Activity.objects.create(
                activity_type='payment',
                action=action,
                title=title,
                description=f"Payment {payment.order_reference} - {payment.status} ({payment.amount_paid} / {payment.total_amount})",
                apartment=apartment,
                object_id=str(payment.id),
                object_type='Payment',
                actor='System',
                summary=f"Payment {payment.order_reference} - {payment.status}",
                type='payment',
                icon='credit-card',
                metadata={'status': payment.status, 'amount_paid': payment.amount_paid, 'total_amount': payment.total_amount}
            )
            count += 1
            print(f"  Created activity for payment: {payment.order_reference}")
        except Exception as e:
            print(f"  Error creating activity for payment: {e}")
    
    # Generate activities for recent deliveries
    print("\nProcessing Deliveries...")
    for delivery in Delivery.objects.order_by('-created_at')[:20]:
        try:
            apartment = delivery.apartment
            apt_name = apartment.name if apartment else 'Unknown'
            
            action = 'delivered' if delivery.status == 'Delivered' else 'created'
            title = 'Delivery completed' if delivery.status == 'Delivered' else 'Delivery scheduled'
            
            Activity.objects.create(
                activity_type='delivery',
                action=action,
                title=title,
                description=f"Delivery {delivery.order_reference} to {apt_name} - {delivery.status}",
                apartment=apartment,
                object_id=str(delivery.id),
                object_type='Delivery',
                actor='System',
                summary=f"Delivery {delivery.order_reference} - {delivery.status}",
                type='delivery',
                icon='truck',
                metadata={'status': delivery.status, 'order_reference': delivery.order_reference}
            )
            count += 1
            print(f"  Created activity for delivery: {delivery.order_reference}")
        except Exception as e:
            print(f"  Error creating activity for delivery: {e}")
    
    # Generate activities for recent issues
    print("\nProcessing Issues...")
    for issue in Issue.objects.order_by('-created_at')[:20]:
        try:
            apartment = issue.apartment
            apt_name = apartment.name if apartment else 'Unknown'
            
            Activity.objects.create(
                activity_type='issue',
                action='created',
                title='Issue reported',
                description=f"{issue.title} - {issue.resolution_status}",
                apartment=apartment,
                object_id=str(issue.id),
                object_type='Issue',
                actor='System',
                summary=f"Issue: {issue.title}",
                type='issue',
                icon='alert-circle',
                metadata={'status': issue.resolution_status, 'priority': issue.priority}
            )
            count += 1
            print(f"  Created activity for issue: {issue.title[:30]}")
        except Exception as e:
            print(f"  Error creating activity for issue: {e}")
    
    # Generate activities for apartments
    print("\nProcessing Apartments...")
    for apartment in Apartment.objects.order_by('-created_at')[:10]:
        try:
            Activity.objects.create(
                activity_type='apartment',
                action='created',
                title='Apartment added',
                description=f"Apartment {apartment.name} was added",
                apartment=apartment,
                object_id=str(apartment.id),
                object_type='Apartment',
                actor='System',
                summary=f"Apartment {apartment.name} added",
                type='apartment',
                icon='building',
                metadata={'name': apartment.name, 'status': apartment.status}
            )
            count += 1
            print(f"  Created activity for apartment: {apartment.name}")
        except Exception as e:
            print(f"  Error creating activity for apartment: {e}")
    
    print(f"\n✅ Generated {count} activities!")
    print(f"\nTotal activities in database: {Activity.objects.count()}")

if __name__ == '__main__':
    generate_activities()
