from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta
from .models import Order


# Statuses that should trigger delivery creation/update
DELIVERY_STATUSES = ['sent']


@receiver(post_save, sender=Order)
def create_or_update_delivery(sender, instance, created, **kwargs):
    """
    Auto-create a Delivery record when an Order's status changes to 'sent'.
    In the new simplified workflow:
    - Order: Draft → Sent (order creation phase)
    - Delivery: Confirmed → In Transit → Received (fulfillment phase)
    """
    # Import here to avoid circular imports
    from deliveries.models import Delivery
    
    # Only create delivery when order is sent
    if instance.status != 'sent':
        return
    
    # Check if delivery already exists for this order
    if Delivery.objects.filter(order=instance).exists():
        return
    
    # Create delivery with "Confirmed" status (vendor accepted the order)
    delivery_status = 'Confirmed'
    
    # Create new delivery with "Confirmed" status
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
        notes=f'Order sent to vendor. PO: {instance.po_number}',
    )
