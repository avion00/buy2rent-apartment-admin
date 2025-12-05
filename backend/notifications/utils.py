from django.contrib.auth import get_user_model
from .models import Notification

User = get_user_model()


def create_notification(
    user=None,
    user_email=None,
    title="",
    message="",
    notification_type="info",
    priority="medium",
    related_object_type="",
    related_object_id="",
    action_url="",
    action_text="",
    metadata=None
):
    """
    Utility function to create notifications
    
    Usage:
        create_notification(
            user=request.user,
            title="Order Confirmed",
            message="Your order #PO-2025-001 has been confirmed",
            notification_type="order",
            priority="high",
            related_object_type="Order",
            related_object_id=order.id,
            action_url="/orders/PO-2025-001",
            action_text="View Order"
        )
    """
    if metadata is None:
        metadata = {}
    
    # Get user by email if not provided
    if not user and user_email:
        try:
            user = User.objects.get(email=user_email)
        except User.DoesNotExist:
            return None
    
    if not user:
        return None
    
    notification = Notification.objects.create(
        user=user,
        title=title,
        message=message,
        notification_type=notification_type,
        priority=priority,
        related_object_type=related_object_type,
        related_object_id=str(related_object_id) if related_object_id else "",
        action_url=action_url,
        action_text=action_text,
        metadata=metadata
    )
    
    return notification


def notify_order_update(order, status_change=None):
    """Create notification for order updates"""
    message = f"Order {order.po_number} "
    
    if status_change:
        message += f"status changed to {status_change}"
    else:
        message += "has been updated"
    
    return create_notification(
        user=order.apartment.client.user if hasattr(order.apartment.client, 'user') else None,
        title="Order Update",
        message=message,
        notification_type="order",
        priority="medium",
        related_object_type="Order",
        related_object_id=order.id,
        action_url=f"/orders/{order.id}",
        action_text="View Order"
    )


def notify_delivery_update(delivery):
    """Create notification for delivery updates"""
    return create_notification(
        user=delivery.order.apartment.client.user if hasattr(delivery.order.apartment.client, 'user') else None,
        title="Delivery Update",
        message=f"Delivery for order {delivery.order.po_number} is {delivery.status}",
        notification_type="delivery",
        priority="high" if delivery.status == "delivered" else "medium",
        related_object_type="Delivery",
        related_object_id=delivery.id,
        action_url=f"/deliveries/{delivery.id}",
        action_text="Track Delivery"
    )


def notify_payment_update(payment):
    """Create notification for payment updates"""
    return create_notification(
        user=payment.vendor.contact_person if hasattr(payment.vendor, 'contact_person') else None,
        title="Payment Update",
        message=f"Payment of €{payment.amount} is {payment.status}",
        notification_type="payment",
        priority="high" if payment.status == "completed" else "medium",
        related_object_type="Payment",
        related_object_id=payment.id,
        action_url=f"/payments/{payment.id}",
        action_text="View Payment"
    )


def notify_issue_update(issue):
    """Create notification for issue updates"""
    priority_map = {
        'low': 'low',
        'medium': 'medium',
        'high': 'high',
        'critical': 'urgent'
    }
    
    return create_notification(
        user=issue.reported_by,
        title="Issue Update",
        message=f"Issue '{issue.title}' is now {issue.resolution_status}",
        notification_type="issue",
        priority=priority_map.get(issue.priority, 'medium'),
        related_object_type="Issue",
        related_object_id=issue.id,
        action_url=f"/issues/{issue.id}",
        action_text="View Issue"
    )


def notify_system_message(user, title, message, priority="medium"):
    """Create system notification"""
    return create_notification(
        user=user,
        title=title,
        message=message,
        notification_type="system",
        priority=priority
    )
