# Generated migration for changing delivery_status_tags field to JSONField

from django.db import migrations, models
import json


def convert_delivery_tags_to_json_string(apps, schema_editor):
    """Convert existing string delivery_status_tags to JSON string arrays BEFORE changing field type"""
    Product = apps.get_model('products', 'Product')
    db_alias = schema_editor.connection.alias
    
    # Fetch all products and update using Django ORM
    products = Product.objects.using(db_alias).all()
    
    for product in products:
        old_tags = product.delivery_status_tags
        if old_tags:
            # If it's a comma-separated string, convert to JSON array
            if ',' in old_tags:
                tags_list = [tag.strip() for tag in old_tags.split(',') if tag.strip()]
                product.delivery_status_tags = json.dumps(tags_list)
            else:
                # Single tag, convert to JSON array with one item
                product.delivery_status_tags = json.dumps([old_tags])
        else:
            # Empty, set to empty JSON array
            product.delivery_status_tags = json.dumps([])
        product.save(update_fields=['delivery_status_tags'])


def convert_delivery_tags_to_string(apps, schema_editor):
    """Reverse migration: convert JSON arrays back to comma-separated strings"""
    Product = apps.get_model('products', 'Product')
    db_alias = schema_editor.connection.alias
    
    products = Product.objects.using(db_alias).all()
    
    for product in products:
        tags_value = product.delivery_status_tags
        if tags_value:
            try:
                # Parse JSON array and join with commas
                tags_array = json.loads(tags_value)
                if isinstance(tags_array, list) and tags_array:
                    product.delivery_status_tags = ', '.join(tags_array)
                else:
                    product.delivery_status_tags = ''
            except:
                product.delivery_status_tags = ''
        else:
            product.delivery_status_tags = ''
        product.save(update_fields=['delivery_status_tags'])


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0011_alter_product_status'),
    ]

    operations = [
        # First, change to TextField temporarily
        migrations.AlterField(
            model_name='product',
            name='delivery_status_tags',
            field=models.TextField(blank=True, help_text='Delivery status tags'),
        ),
        # Convert all string values to JSON string arrays WHILE still TextField
        migrations.RunPython(convert_delivery_tags_to_json_string, convert_delivery_tags_to_string),
        # Now change to JSONField (data is already in JSON format)
        migrations.AlterField(
            model_name='product',
            name='delivery_status_tags',
            field=models.JSONField(blank=True, default=list, help_text='Array of delivery status tags'),
        ),
    ]
