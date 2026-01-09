from django.core.management.base import BaseCommand
from orders.models import OrderItem
from products.models import Product


class Command(BaseCommand):
    help = 'Fix OrderItems by linking them to Products'

    def handle(self, *args, **options):
        # Get all order items without a product link
        unlinked_items = OrderItem.objects.filter(product__isnull=True)
        
        self.stdout.write(f"Found {unlinked_items.count()} order items without product links")
        
        fixed_count = 0
        failed_count = 0
        
        for item in unlinked_items:
            try:
                # Try to find matching product by name and apartment
                product = Product.objects.filter(
                    product__iexact=item.product_name,
                    apartment=item.order.apartment
                ).first()
                
                if not product and item.sku:
                    # Try matching by SKU
                    product = Product.objects.filter(
                        sku__iexact=item.sku,
                        apartment=item.order.apartment
                    ).first()
                
                if product:
                    item.product = product
                    # Store product image URL
                    if product.product_image:
                        item.product_image_url = product.product_image
                    item.save()
                    fixed_count += 1
                    self.stdout.write(self.style.SUCCESS(f"✓ Linked '{item.product_name}' to product {product.id}"))
                else:
                    failed_count += 1
                    self.stdout.write(self.style.WARNING(f"✗ Could not find product for '{item.product_name}' in apartment {item.order.apartment.name}"))
            
            except Exception as e:
                failed_count += 1
                self.stdout.write(self.style.ERROR(f"✗ Error linking '{item.product_name}': {e}"))
        
        self.stdout.write("\n=== Summary ===")
        self.stdout.write(f"Fixed: {fixed_count}")
        self.stdout.write(f"Failed: {failed_count}")
        self.stdout.write(f"Total: {unlinked_items.count()}")
        
        # Show current status
        total_items = OrderItem.objects.count()
        linked_items = OrderItem.objects.filter(product__isnull=False).count()
        self.stdout.write("\n=== Current Status ===")
        self.stdout.write(f"Total OrderItems: {total_items}")
        self.stdout.write(f"Linked to Products: {linked_items}")
        self.stdout.write(f"Unlinked: {total_items - linked_items}")
