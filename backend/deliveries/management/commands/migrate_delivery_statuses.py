from django.core.management.base import BaseCommand
from deliveries.models import Delivery


class Command(BaseCommand):
    help = 'Migrate delivery statuses to simplified system (Confirmed, In Transit, Received, Cancelled, Returned)'

    def handle(self, *args, **options):
        # Map old statuses to new simplified statuses
        status_mapping = {
            'Scheduled': 'Confirmed',
            'Delayed': 'In Transit',
            'Delivered': 'Received',
            'Issue Reported': 'In Transit',
            # Keep existing new statuses
            'Confirmed': 'Confirmed',
            'In Transit': 'In Transit',
            'Received': 'Received',
            'Cancelled': 'Cancelled',
            'Returned': 'Returned',
        }
        
        updated_count = 0
        for old_status, new_status in status_mapping.items():
            count = Delivery.objects.filter(status=old_status).update(status=new_status)
            if count > 0:
                self.stdout.write(f'Updated {count} deliveries from "{old_status}" to "{new_status}"')
                updated_count += count
        
        self.stdout.write(self.style.SUCCESS(f'\nTotal: Successfully updated {updated_count} delivery records'))
        
        # Show current status distribution
        from django.db.models import Count
        status_counts = Delivery.objects.values('status').annotate(count=Count('status')).order_by('-count')
        
        self.stdout.write('\n=== Current Delivery Status Distribution ===')
        for item in status_counts:
            self.stdout.write(f"{item['status']}: {item['count']}")
