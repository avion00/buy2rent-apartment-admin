from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .utils import create_notification

User = get_user_model()


def get_admin_users():
    """Get all admin/superuser accounts to notify"""
    return User.objects.filter(is_superuser=True)


def notify_admins(title, message, notification_type='info', priority='medium', 
                  action_url='', action_text='', related_object_type='', related_object_id=''):
    """Send notification to all admin users"""
    admins = get_admin_users()
    notifications = []
    for admin in admins:
        notif = create_notification(
            user=admin,
            title=title,
            message=message,
            notification_type=notification_type,
            priority=priority,
            action_url=action_url,
            action_text=action_text,
            related_object_type=related_object_type,
            related_object_id=related_object_id
        )
        if notif:
            notifications.append(notif)
    return notifications


# Import models lazily to avoid circular imports
def setup_signals():
    """Setup all notification signals - call this from apps.py ready()"""
    
    # Try to import and connect signals for each app
    try:
        from products.models import Product
        
        @receiver(post_save, sender=Product)
        def product_saved(sender, instance, created, **kwargs):
            if created:
                notify_admins(
                    title='New Product Added',
                    message=f'Product "{instance.product}" has been added to the catalog.',
                    notification_type='info',
                    priority='low',
                    action_url=f'/apartments/{instance.apartment_id}',
                    action_text='View Product',
                    related_object_type='Product',
                    related_object_id=str(instance.id)
                )
    except ImportError:
        pass

    try:
        from deliveries.models import Delivery
        
        @receiver(post_save, sender=Delivery)
        def delivery_saved(sender, instance, created, **kwargs):
            if created:
                notify_admins(
                    title='New Delivery Scheduled',
                    message=f'Delivery scheduled for {instance.expected_date}.',
                    notification_type='delivery',
                    priority='medium',
                    action_url='/deliveries',
                    action_text='View Delivery',
                    related_object_type='Delivery',
                    related_object_id=str(instance.id)
                )
            else:
                # Check if status changed to delivered
                if instance.status == 'Delivered':
                    notify_admins(
                        title='Delivery Completed',
                        message=f'Delivery has been marked as delivered.',
                        notification_type='delivery',
                        priority='high',
                        action_url='/deliveries',
                        action_text='View Details',
                        related_object_type='Delivery',
                        related_object_id=str(instance.id)
                    )
    except ImportError:
        pass

    try:
        from payments.models import Payment
        
        @receiver(post_save, sender=Payment)
        def payment_saved(sender, instance, created, **kwargs):
            if not created:
                # Check if payment status changed
                if instance.status == 'Paid':
                    notify_admins(
                        title='Payment Completed',
                        message=f'Payment of {instance.total_amount:,.0f} HUF has been completed.',
                        notification_type='payment',
                        priority='medium',
                        action_url='/payments',
                        action_text='View Payment',
                        related_object_type='Payment',
                        related_object_id=str(instance.id)
                    )
                elif instance.status == 'Overdue':
                    notify_admins(
                        title='Payment Overdue',
                        message=f'Payment of {instance.total_amount:,.0f} HUF is now overdue.',
                        notification_type='payment',
                        priority='urgent',
                        action_url='/payments',
                        action_text='View Payment',
                        related_object_type='Payment',
                        related_object_id=str(instance.id)
                    )
    except ImportError:
        pass

    try:
        from issues.models import Issue
        
        @receiver(post_save, sender=Issue)
        def issue_saved(sender, instance, created, **kwargs):
            if created:
                priority_map = {
                    'Low': 'low',
                    'Medium': 'medium', 
                    'High': 'high',
                    'Critical': 'urgent'
                }
                notify_admins(
                    title='New Issue Reported',
                    message=f'Issue reported for product "{instance.product_name}": {instance.type}',
                    notification_type='issue',
                    priority=priority_map.get(instance.priority, 'medium'),
                    action_url=f'/apartments/{instance.apartment_id}',
                    action_text='View Issue',
                    related_object_type='Issue',
                    related_object_id=str(instance.id)
                )
            else:
                # Check if issue was resolved
                if instance.status == 'Closed':
                    notify_admins(
                        title='Issue Resolved',
                        message=f'Issue for "{instance.product_name}" has been resolved.',
                        notification_type='issue',
                        priority='low',
                        action_url=f'/apartments/{instance.apartment_id}',
                        action_text='View Details',
                        related_object_type='Issue',
                        related_object_id=str(instance.id)
                    )
    except ImportError:
        pass

    try:
        from apartments.models import Apartment
        
        @receiver(post_save, sender=Apartment)
        def apartment_saved(sender, instance, created, **kwargs):
            if created:
                notify_admins(
                    title='New Apartment Added',
                    message=f'Apartment "{instance.name}" has been added.',
                    notification_type='info',
                    priority='medium',
                    action_url=f'/apartments/{instance.id}',
                    action_text='View Apartment',
                    related_object_type='Apartment',
                    related_object_id=str(instance.id)
                )
            else:
                # Check if status changed to complete
                if instance.status == 'Completed':
                    notify_admins(
                        title='Apartment Setup Complete',
                        message=f'Apartment "{instance.name}" setup has been completed!',
                        notification_type='success',
                        priority='high',
                        action_url=f'/apartments/{instance.id}',
                        action_text='View Apartment',
                        related_object_type='Apartment',
                        related_object_id=str(instance.id)
                    )
    except ImportError:
        pass

    try:
        from clients.models import Client
        
        @receiver(post_save, sender=Client)
        def client_saved(sender, instance, created, **kwargs):
            if created:
                notify_admins(
                    title='New Client Added',
                    message=f'Client "{instance.name}" has been added to the system.',
                    notification_type='info',
                    priority='low',
                    action_url='/clients',
                    action_text='View Client',
                    related_object_type='Client',
                    related_object_id=str(instance.id)
                )
    except ImportError:
        pass

    try:
        from vendors.models import Vendor
        
        @receiver(post_save, sender=Vendor)
        def vendor_saved(sender, instance, created, **kwargs):
            if created:
                notify_admins(
                    title='New Vendor Added',
                    message=f'Vendor "{instance.name}" has been added.',
                    notification_type='info',
                    priority='low',
                    action_url='/vendors',
                    action_text='View Vendor',
                    related_object_type='Vendor',
                    related_object_id=str(instance.id)
                )
    except ImportError:
        pass
