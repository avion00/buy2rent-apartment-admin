from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta
from .models import Order


# Statuses that should trigger delivery creation/update
DELIVERY_STATUSES = ['sent', 'in_transit', 'delivered', 'received', 'cancelled', 'returned']


@receiver(post_save, sender=Order)
def create_or_update_delivery(sender, instance, created, **kwargs):
    """
    Auto-create or update a Delivery record when an Order's status 
    changes to a delivery-related status.
    """
    # Import here to avoid circular imports
    from deliveries.models import Delivery
    
    # Check if the order status is delivery-related
    if instance.status not in DELIVERY_STATUSES:
        return
    
    # Map order status to delivery status
    status_mapping = {
        'sent': 'Scheduled',
        'in_transit': 'In Transit',
        'delivered': 'Delivered',
        'received': 'Delivered',
        'cancelled': 'Cancelled',
        'returned': 'Returned',
    }
    
    delivery_status = status_mapping.get(instance.status, 'Scheduled')
    
    # Try to get existing delivery for this order
    try:
        delivery = Delivery.objects.get(order=instance)
        # Update existing delivery
        delivery.status = delivery_status
        delivery.tracking_number = instance.tracking_number or delivery.tracking_number
        if instance.status in ['delivered', 'received'] and not delivery.actual_date:
            delivery.actual_date = timezone.now().date()
        delivery.save()
    except Delivery.DoesNotExist:
        # Create new delivery
        expected_date = instance.expected_delivery or (timezone.now().date() + timedelta(days=7))
        
        Delivery.objects.create(
            order=instance,
            apartment=instance.apartment,
            vendor=instance.vendor,
            order_reference=instance.po_number,
            expected_date=expected_date,
            tracking_number=instance.tracking_number or '',
            status=delivery_status,
            priority='Medium',
            notes=instance.notes or '',
            actual_date=timezone.now().date() if instance.status in ['delivered', 'received'] else None,
        )
