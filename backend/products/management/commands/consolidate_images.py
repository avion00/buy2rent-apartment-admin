"""
Management command to consolidate product images into product_image field
"""
from django.core.management.base import BaseCommand
from products.models import Product
from django.db.models import Q


class Command(BaseCommand):
    help = 'Consolidate all product images into the product_image field'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be done without making changes',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        if dry_run:
            self.stdout.write(self.style.WARNING('🔍 DRY RUN MODE - No changes will be made\n'))
        else:
            self.stdout.write(self.style.SUCCESS('🚀 Starting Image Consolidation\n'))
        
        updated_count = 0
        skipped_count = 0
        error_count = 0
        
        # Get all products that might need consolidation
        products = Product.objects.all()
        total = products.count()
        
        self.stdout.write(f'Processing {total} products...\n')
        
        for i, product in enumerate(products, 1):
            try:
                # Determine the best image source
                best_image = None
                source = None
                
                # Priority 1: Uploaded file (image_file)
                if product.image_file:
                    try:
                        best_image = product.image_file.url
                        source = 'image_file'
                    except:
                        pass
                
                # Priority 2: Image URL
                if not best_image and product.image_url:
                    best_image = product.image_url
                    source = 'image_url'
                
                # Priority 3: Existing product_image (keep as is)
                if not best_image and product.product_image:
                    best_image = product.product_image
                    source = 'product_image (existing)'
                
                # Update product_image if we found a better source
                if best_image and best_image != product.product_image:
                    if not dry_run:
                        product.product_image = best_image
                        product.save(update_fields=['product_image'])
                    
                    updated_count += 1
                    if updated_count <= 10:  # Show first 10 updates
                        self.stdout.write(
                            f'  ✅ [{i}/{total}] {product.product[:50]} - '
                            f'Updated from {source}'
                        )
                elif best_image:
                    skipped_count += 1
                else:
                    skipped_count += 1
                    
            except Exception as e:
                error_count += 1
                self.stdout.write(
                    self.style.ERROR(
                        f'  ❌ [{i}/{total}] Error processing {product.product[:50]}: {str(e)}'
                    )
                )
                continue
        
        # Summary
        self.stdout.write('\n' + '='*60)
        self.stdout.write(self.style.SUCCESS('📊 Consolidation Summary:'))
        self.stdout.write(f'  Total Products: {total}')
        self.stdout.write(f'  Updated: {updated_count}')
        self.stdout.write(f'  Skipped (already correct): {skipped_count}')
        self.stdout.write(f'  Errors: {error_count}')
        
        if dry_run:
            self.stdout.write(self.style.WARNING('\n⚠️  This was a dry run. Run without --dry-run to apply changes.'))
        else:
            self.stdout.write(self.style.SUCCESS('\n✅ Image consolidation complete!'))
