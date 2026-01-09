from django.core.management.base import BaseCommand
from orders.models import Order


class Command(BaseCommand):
    help = 'Migrate order statuses to simplified system (Draft, Sent only)'

    def handle(self, *args, **options):
        # Map old statuses to new simplified statuses
        status_mapping = {
            'pending': 'sent',
            'confirmed': 'sent',
            'in_transit': 'sent',
            'delivered': 'sent',
            'received': 'sent',
            # Keep draft and sent as is
            'draft': 'draft',
            'sent': 'sent',
            # Cancelled and returned are removed (orders should be deleted or marked in delivery)
            'cancelled': 'draft',
            'returned': 'sent',
        }
        
        updated_count = 0
        for old_status, new_status in status_mapping.items():
            count = Order.objects.filter(status=old_status).update(status=new_status)
            if count > 0:
                self.stdout.write(f'Updated {count} orders from "{old_status}" to "{new_status}"')
                updated_count += count
        
        self.stdout.write(self.style.SUCCESS(f'\nTotal: Successfully updated {updated_count} order records'))
        
        # Show current status distribution
        from django.db.models import Count
        status_counts = Order.objects.values('status').annotate(count=Count('status')).order_by('-count')
        
        self.stdout.write('\n=== Current Order Status Distribution ===')
        for item in status_counts:
            self.stdout.write(f"{item['status']}: {item['count']}")
