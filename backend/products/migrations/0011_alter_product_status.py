# Generated migration for changing status field to JSONField

from django.db import migrations, models
import json


def convert_status_to_json_string(apps, schema_editor):
    """Convert existing string status values to JSON string arrays BEFORE changing field type"""
    Product = apps.get_model('products', 'Product')
    db_alias = schema_editor.connection.alias
    
    # Fetch all products and update using Django ORM
    products = Product.objects.using(db_alias).all()
    
    for product in products:
        old_status = product.status
        if old_status:
            # Convert string to JSON array string
            product.status = json.dumps([old_status])
        else:
            # Default value
            product.status = json.dumps(['Design Approved'])
        product.save(update_fields=['status'])


def convert_json_to_string(apps, schema_editor):
    """Reverse migration: convert JSON arrays back to strings"""
    Product = apps.get_model('products', 'Product')
    db_alias = schema_editor.connection.alias
    
    products = Product.objects.using(db_alias).all()
    
    for product in products:
        status_value = product.status
        if status_value:
            try:
                # Parse JSON array and get first element
                status_array = json.loads(status_value)
                if isinstance(status_array, list) and status_array:
                    product.status = status_array[0]
                else:
                    product.status = 'Design Approved'
            except:
                product.status = 'Design Approved'
        else:
            product.status = 'Design Approved'
        product.save(update_fields=['status'])


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0010_importsession_uploaded_file'),
    ]

    operations = [
        # First, remove the choices constraint and change to TextField temporarily
        migrations.AlterField(
            model_name='product',
            name='status',
            field=models.TextField(blank=True, default='Design Approved'),
        ),
        # Convert all string values to JSON string arrays WHILE still TextField
        migrations.RunPython(convert_status_to_json_string, convert_json_to_string),
        # Now change to JSONField (data is already in JSON format)
        migrations.AlterField(
            model_name='product',
            name='status',
            field=models.JSONField(blank=True, default=list, help_text='Array of status tags'),
        ),
    ]
