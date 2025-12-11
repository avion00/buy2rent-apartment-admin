from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from notifications.models import Notification
from datetime import timedelta
from django.utils import timezone
import random

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed sample notifications for testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--user',
            type=str,
            help='Email of user to create notifications for (defaults to first superuser)',
        )
        parser.add_argument(
            '--count',
            type=int,
            default=10,
            help='Number of notifications to create (default: 10)',
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing notifications before seeding',
        )

    def handle(self, *args, **options):
        user_email = options.get('user')
        count = options.get('count')
        clear = options.get('clear')

        # Get user
        if user_email:
            try:
                user = User.objects.get(email=user_email)
            except User.DoesNotExist:
                self.stderr.write(self.style.ERROR(f'User with email {user_email} not found'))
                return
        else:
            # Get first superuser or any user
            user = User.objects.filter(is_superuser=True).first()
            if not user:
                user = User.objects.first()
            if not user:
                self.stderr.write(self.style.ERROR('No users found. Please create a user first.'))
                return

        self.stdout.write(f'Creating notifications for user: {user.email}')

        # Clear existing if requested
        if clear:
            deleted_count = Notification.objects.filter(user=user).delete()[0]
            self.stdout.write(self.style.WARNING(f'Cleared {deleted_count} existing notifications'))

        # Sample notification templates
        notification_templates = [
            {
                'notification_type': 'order',
                'priority': 'high',
                'title': 'New Order Received',
                'message': 'Order #PO-2025-{num} from IKEA has been placed successfully.',
                'action_url': '/orders',
                'action_text': 'View Order',
            },
            {
                'notification_type': 'order',
                'priority': 'medium',
                'title': 'Order Confirmed',
                'message': 'Your order #PO-2025-{num} has been confirmed by the vendor.',
                'action_url': '/orders',
                'action_text': 'Track Order',
            },
            {
                'notification_type': 'delivery',
                'priority': 'high',
                'title': 'Delivery Scheduled',
                'message': 'Delivery for order #PO-2025-{num} is scheduled for tomorrow.',
                'action_url': '/deliveries',
                'action_text': 'Track Delivery',
            },
            {
                'notification_type': 'delivery',
                'priority': 'urgent',
                'title': 'Delivery Arriving Today',
                'message': 'Your delivery from Mömax is arriving today between 2-4 PM.',
                'action_url': '/deliveries',
                'action_text': 'View Details',
            },
            {
                'notification_type': 'delivery',
                'priority': 'medium',
                'title': 'Delivery Completed',
                'message': 'Delivery for apartment "Budapest Downtown" has been completed.',
                'action_url': '/deliveries',
                'action_text': 'Confirm Receipt',
            },
            {
                'notification_type': 'payment',
                'priority': 'high',
                'title': 'Payment Due Soon',
                'message': 'Payment of 125,000 HUF for order #PO-2025-{num} is due in 3 days.',
                'action_url': '/payments',
                'action_text': 'Pay Now',
            },
            {
                'notification_type': 'payment',
                'priority': 'medium',
                'title': 'Payment Confirmed',
                'message': 'Your payment of 89,500 HUF has been confirmed.',
                'action_url': '/payments',
                'action_text': 'View Receipt',
            },
            {
                'notification_type': 'payment',
                'priority': 'urgent',
                'title': 'Payment Overdue',
                'message': 'Payment for order #PO-2025-{num} is overdue. Please pay immediately.',
                'action_url': '/payments',
                'action_text': 'Pay Now',
            },
            {
                'notification_type': 'issue',
                'priority': 'high',
                'title': 'New Issue Reported',
                'message': 'A damaged item was reported for order #PO-2025-{num}.',
                'action_url': '/issues',
                'action_text': 'View Issue',
            },
            {
                'notification_type': 'issue',
                'priority': 'medium',
                'title': 'Issue Resolved',
                'message': 'The issue with your sofa delivery has been resolved.',
                'action_url': '/issues',
                'action_text': 'View Details',
            },
            {
                'notification_type': 'issue',
                'priority': 'urgent',
                'title': 'Urgent: Missing Items',
                'message': '3 items are missing from your recent delivery. Vendor has been notified.',
                'action_url': '/issues',
                'action_text': 'Track Resolution',
            },
            {
                'notification_type': 'warning',
                'priority': 'medium',
                'title': 'Low Stock Alert',
                'message': 'Queen Size Bed Frame is running low in stock (only 2 left).',
                'action_url': '/products',
                'action_text': 'Reorder',
            },
            {
                'notification_type': 'success',
                'priority': 'low',
                'title': 'Apartment Setup Complete',
                'message': 'All furniture for "Vienna Central" apartment has been delivered.',
                'action_url': '/apartments',
                'action_text': 'View Apartment',
            },
            {
                'notification_type': 'info',
                'priority': 'low',
                'title': 'Weekly Summary Ready',
                'message': 'Your weekly procurement summary is ready to view.',
                'action_url': '/overview',
                'action_text': 'View Summary',
            },
            {
                'notification_type': 'system',
                'priority': 'medium',
                'title': 'System Maintenance',
                'message': 'Scheduled maintenance on Sunday 2 AM - 4 AM. System may be unavailable.',
                'action_url': '',
                'action_text': '',
            },
        ]

        created_count = 0
        for i in range(count):
            template = random.choice(notification_templates)
            
            # Random time in the past (0-7 days)
            hours_ago = random.randint(0, 168)
            created_at = timezone.now() - timedelta(hours=hours_ago)
            
            # Random read status (30% unread)
            is_read = random.random() > 0.3
            read_at = created_at + timedelta(hours=random.randint(1, 24)) if is_read else None
            
            notification = Notification(
                user=user,
                title=template['title'],
                message=template['message'].format(num=random.randint(1000, 9999)),
                notification_type=template['notification_type'],
                priority=template['priority'],
                action_url=template['action_url'],
                action_text=template['action_text'],
                is_read=is_read,
                read_at=read_at,
            )
            notification.save()
            created_count += 1

        self.stdout.write(self.style.SUCCESS(f'Successfully created {created_count} notifications'))
        
        # Show summary
        total = Notification.objects.filter(user=user).count()
        unread = Notification.objects.filter(user=user, is_read=False).count()
        self.stdout.write(f'Total notifications: {total}, Unread: {unread}')
