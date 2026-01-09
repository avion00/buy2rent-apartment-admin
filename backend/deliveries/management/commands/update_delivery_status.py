from django.core.management.base import BaseCommand
from deliveries.models import Delivery


class Command(BaseCommand):
    help = 'Update delivery status from "Delivered" to "Received"'

    def handle(self, *args, **options):
        # Update all deliveries with 'Delivered' status to 'Received'
        updated_count = Delivery.objects.filter(status='Delivered').update(status='Received')
        
        self.stdout.write(self.style.SUCCESS(f'Successfully updated {updated_count} delivery records from "Delivered" to "Received"'))
        
        # Show current status distribution
        from django.db.models import Count
        status_counts = Delivery.objects.values('status').annotate(count=Count('status')).order_by('-count')
        
        self.stdout.write('\n=== Current Delivery Status Distribution ===')
        for item in status_counts:
            self.stdout.write(f"{item['status']}: {item['count']}")
