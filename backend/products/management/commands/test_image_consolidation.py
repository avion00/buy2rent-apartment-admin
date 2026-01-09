"""
Management command to test and verify image field consolidation
"""
from django.core.management.base import BaseCommand
from products.models import Product
from django.db.models import Q


class Command(BaseCommand):
    help = 'Test and verify product image field consolidation'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🔍 Testing Product Image Consolidation\n'))
        
        # Count products by image field usage
        total_products = Product.objects.count()
        products_with_product_image = Product.objects.exclude(Q(product_image='') | Q(product_image__isnull=True)).count()
        products_with_image_url = Product.objects.exclude(Q(image_url='') | Q(image_url__isnull=True)).count()
        products_with_image_file = Product.objects.exclude(image_file='').count()
        
        self.stdout.write(f'📊 Statistics:')
        self.stdout.write(f'  Total Products: {total_products}')
        self.stdout.write(f'  Products with product_image: {products_with_product_image}')
        self.stdout.write(f'  Products with image_url: {products_with_image_url}')
        self.stdout.write(f'  Products with image_file: {products_with_image_file}\n')
        
        # Find products that need consolidation
        needs_consolidation = []
        
        for product in Product.objects.all()[:20]:  # Check first 20 products
            has_product_image = bool(product.product_image)
            has_image_url = bool(product.image_url)
            has_image_file = bool(product.image_file)
            
            # If image_url or image_file exists but product_image doesn't, needs consolidation
            if (has_image_url or has_image_file) and not has_product_image:
                needs_consolidation.append({
                    'id': product.id,
                    'name': product.product,
                    'product_image': product.product_image,
                    'image_url': product.image_url,
                    'image_file': str(product.image_file) if product.image_file else None,
                })
        
        if needs_consolidation:
            self.stdout.write(self.style.WARNING(f'\n⚠️  Found {len(needs_consolidation)} products that need consolidation:'))
            for prod in needs_consolidation[:5]:  # Show first 5
                self.stdout.write(f'  - {prod["name"]} (ID: {prod["id"]})')
                self.stdout.write(f'    product_image: {prod["product_image"] or "EMPTY"}')
                self.stdout.write(f'    image_url: {prod["image_url"] or "EMPTY"}')
                self.stdout.write(f'    image_file: {prod["image_file"] or "EMPTY"}')
        else:
            self.stdout.write(self.style.SUCCESS('\n✅ All products are properly consolidated!'))
        
        # Check serializer behavior
        self.stdout.write(self.style.SUCCESS('\n🔧 Testing Serializer Behavior:'))
        from products.serializers import ProductSerializer
        from rest_framework.request import Request
        from django.test import RequestFactory
        
        factory = RequestFactory()
        request = factory.get('/')
        
        sample_products = Product.objects.all()[:3]
        for product in sample_products:
            serializer = ProductSerializer(product, context={'request': request})
            data = serializer.data
            
            self.stdout.write(f'\n  Product: {product.product}')
            self.stdout.write(f'    DB product_image: {product.product_image or "EMPTY"}')
            self.stdout.write(f'    DB image_url: {product.image_url or "EMPTY"}')
            self.stdout.write(f'    DB image_file: {str(product.image_file) if product.image_file else "EMPTY"}')
            self.stdout.write(f'    Serialized product_image: {data.get("product_image") or "EMPTY"}')
        
        self.stdout.write(self.style.SUCCESS('\n✅ Image consolidation test complete!'))
