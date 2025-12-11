"""
Activity logging signals for all models
Automatically logs create, update, and delete actions
"""
from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
import threading

from .models import Activity

# Thread-local storage for current user
_thread_locals = threading.local()


def set_current_user(user):
    """Set the current user for activity logging"""
    _thread_locals.user = user


def get_current_user():
    """Get the current user for activity logging"""
    return getattr(_thread_locals, 'user', None)


def clear_current_user():
    """Clear the current user"""
    if hasattr(_thread_locals, 'user'):
        del _thread_locals.user


# Store original values for detecting changes
_original_values = {}


def get_model_display_name(instance):
    """Get a human-readable name for the model instance"""
    model_name = instance.__class__.__name__
    
    # Try to get a meaningful display name
    if hasattr(instance, 'name'):
        return f"{model_name}: {instance.name}"
    elif hasattr(instance, 'po_number'):
        return f"Order: {instance.po_number}"
    elif hasattr(instance, 'order_reference'):
        return f"{model_name}: {instance.order_reference}"
    elif hasattr(instance, 'title'):
        return f"{model_name}: {instance.title}"
    elif hasattr(instance, 'email'):
        return f"{model_name}: {instance.email}"
    else:
        return f"{model_name} #{str(instance.pk)[:8]}"


def get_activity_type(model_name):
    """Map model name to activity type"""
    type_map = {
        'Order': 'order',
        'Payment': 'payment',
        'Delivery': 'delivery',
        'Issue': 'issue',
        'Product': 'product',
        'Apartment': 'apartment',
        'Client': 'client',
        'Vendor': 'vendor',
        'User': 'user',
    }
    return type_map.get(model_name, 'status')


def get_action_description(instance, action):
    """Generate a description for the action"""
    model_name = instance.__class__.__name__
    display_name = get_model_display_name(instance)
    
    if action == 'created':
        if model_name == 'Order':
            apartment = getattr(instance, 'apartment', None)
            vendor = getattr(instance, 'vendor', None)
            apt_name = apartment.name if apartment else 'Unknown'
            vendor_name = vendor.name if vendor else 'Unknown'
            return f"New order placed for {apt_name} from {vendor_name}"
        elif model_name == 'Payment':
            return f"Payment record created: {getattr(instance, 'order_reference', 'N/A')}"
        elif model_name == 'Delivery':
            return f"Delivery scheduled: {getattr(instance, 'order_reference', 'N/A')}"
        elif model_name == 'Issue':
            return f"Issue reported: {getattr(instance, 'title', 'N/A')}"
        else:
            return f"{display_name} was created"
    
    elif action == 'updated':
        if model_name == 'Order':
            status = getattr(instance, 'status', '')
            return f"Order {getattr(instance, 'po_number', '')} updated - Status: {status}"
        elif model_name == 'Payment':
            status = getattr(instance, 'status', '')
            paid = getattr(instance, 'amount_paid', 0)
            return f"Payment updated - {status}, Amount paid: {paid}"
        elif model_name == 'Delivery':
            status = getattr(instance, 'status', '')
            return f"Delivery status changed to: {status}"
        elif model_name == 'Issue':
            status = getattr(instance, 'resolution_status', '')
            return f"Issue status updated: {status}"
        else:
            return f"{display_name} was updated"
    
    elif action == 'deleted':
        return f"{display_name} was deleted"
    
    return f"{action} on {display_name}"


def get_action_title(instance, action):
    """Generate a title for the action"""
    model_name = instance.__class__.__name__
    
    if action == 'created':
        if model_name == 'Order':
            return "New order placed"
        elif model_name == 'Payment':
            return "Payment created"
        elif model_name == 'Delivery':
            return "Delivery scheduled"
        elif model_name == 'Issue':
            return "Issue reported"
        elif model_name == 'Apartment':
            return "Apartment added"
        elif model_name == 'Client':
            return "Client added"
        elif model_name == 'Vendor':
            return "Vendor added"
        elif model_name == 'Product':
            return "Product added"
        else:
            return f"{model_name} created"
    
    elif action == 'updated':
        if model_name == 'Order':
            return "Order updated"
        elif model_name == 'Payment':
            status = getattr(instance, 'status', '')
            if status == 'Paid':
                return "Payment received"
            return "Payment updated"
        elif model_name == 'Delivery':
            status = getattr(instance, 'status', '')
            if status == 'Delivered':
                return "Delivery completed"
            return "Delivery updated"
        elif model_name == 'Issue':
            status = getattr(instance, 'resolution_status', '')
            if status == 'Closed':
                return "Issue resolved"
            return "Issue updated"
        else:
            return f"{model_name} updated"
    
    elif action == 'deleted':
        return f"{model_name} deleted"
    
    return f"{model_name} {action}"


def log_activity(instance, action, user=None):
    """Log an activity for a model instance"""
    # Skip logging for Activity model itself to avoid recursion
    if instance.__class__.__name__ == 'Activity':
        return
    
    # Skip logging for certain models
    skip_models = ['Session', 'ContentType', 'Permission', 'LogEntry', 'Migration', 
                   'AINote', 'ManualNote', 'DeliveryStatusHistory', 'PaymentHistory',
                   'UserSettings', 'Token', 'OutstandingToken', 'BlacklistedToken']
    if instance.__class__.__name__ in skip_models:
        return
    
    try:
        model_name = instance.__class__.__name__
        activity_type = get_activity_type(model_name)
        title = get_action_title(instance, action)
        description = get_action_description(instance, action)
        
        # Get apartment if available
        apartment = None
        if hasattr(instance, 'apartment') and instance.apartment:
            apartment = instance.apartment
        elif model_name == 'Apartment':
            apartment = instance
        
        # Get current user
        if user is None:
            user = get_current_user()
        
        # Build metadata
        metadata = {
            'model': model_name,
            'action': action,
        }
        
        # Add relevant fields to metadata
        if hasattr(instance, 'status'):
            metadata['status'] = instance.status
        if hasattr(instance, 'total'):
            metadata['total'] = float(instance.total) if instance.total else 0
        if hasattr(instance, 'po_number'):
            metadata['po_number'] = instance.po_number
        if hasattr(instance, 'name'):
            metadata['name'] = instance.name
        
        Activity.log(
            activity_type=activity_type,
            action=action,
            title=title,
            description=description,
            user=user,
            apartment=apartment,
            object_id=str(instance.pk) if instance.pk else '',
            object_type=model_name,
            metadata=metadata
        )
    except Exception as e:
        # Don't let logging errors break the application
        print(f"Activity logging error: {e}")


# Import models here to avoid circular imports
def get_tracked_models():
    """Get list of models to track"""
    from orders.models import Order
    from payments.models import Payment
    from deliveries.models import Delivery
    from issues.models import Issue
    from products.models import Product
    from apartments.models import Apartment
    from clients.models import Client
    from vendors.models import Vendor
    
    return [Order, Payment, Delivery, Issue, Product, Apartment, Client, Vendor]


# Signal handlers
@receiver(post_save)
def log_model_save(sender, instance, created, **kwargs):
    """Log when a model is created or updated"""
    # Only track specific models
    tracked_model_names = ['Order', 'Payment', 'Delivery', 'Issue', 'Product', 
                          'Apartment', 'Client', 'Vendor']
    
    if sender.__name__ not in tracked_model_names:
        return
    
    action = 'created' if created else 'updated'
    log_activity(instance, action)


@receiver(post_delete)
def log_model_delete(sender, instance, **kwargs):
    """Log when a model is deleted"""
    tracked_model_names = ['Order', 'Payment', 'Delivery', 'Issue', 'Product', 
                          'Apartment', 'Client', 'Vendor']
    
    if sender.__name__ not in tracked_model_names:
        return
    
    log_activity(instance, 'deleted')
