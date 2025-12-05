"""
Management command to fix any status field data issues
"""
from django.core.management.base import BaseCommand
from products.models import Product
import json


class Command(BaseCommand):
    help = 'Fix status field data to ensure all values are valid JSON arrays'

    def handle(self, *args, **options):
        products = Product.objects.all()
        fixed_count = 0
        
        for product in products:
            try:
                status = product.status
                
                # If it's a string, try to parse it
                if isinstance(status, str):
                    try:
                        parsed = json.loads(status)
                        if isinstance(parsed, list):
                            product.status = parsed
                        else:
                            product.status = [parsed] if parsed else ['Design Approved']
                    except:
                        # If parsing fails, treat as single status
                        product.status = [status] if status else ['Design Approved']
                    
                    product.save(update_fields=['status'])
                    fixed_count += 1
                    self.stdout.write(f'Fixed product {product.id}: {product.product}')
                
                # If it's not a list and not a string, fix it
                elif not isinstance(status, list):
                    product.status = ['Design Approved']
                    product.save(update_fields=['status'])
                    fixed_count += 1
                    self.stdout.write(f'Fixed product {product.id}: {product.product}')
                    
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Error fixing product {product.id}: {str(e)}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully fixed {fixed_count} products')
        )
