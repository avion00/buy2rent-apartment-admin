# Generated manually to restore fields that were removed in migration 0013
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0012_alter_delivery_status_tags'),
    ]

    operations = [
        # Restore Excel Import Fields (only missing ones)
        migrations.AddField(
            model_name='product',
            name='cost',
            field=models.CharField(blank=True, help_text='Cost as text from Excel', max_length=100),
        ),
        migrations.AddField(
            model_name='product',
            name='total_cost',
            field=models.CharField(blank=True, help_text='Total Cost as text from Excel', max_length=100),
        ),
        migrations.AddField(
            model_name='product',
            name='plusz_nm',
            field=models.CharField(blank=True, help_text='Plus NM from Excel', max_length=100),
        ),
        migrations.AddField(
            model_name='product',
            name='all_package',
            field=models.CharField(blank=True, help_text='All Package from Excel', max_length=100),
        ),
        migrations.AddField(
            model_name='product',
            name='package_need_to_order',
            field=models.CharField(blank=True, help_text='Package Need to Order from Excel', max_length=100),
        ),
        migrations.AddField(
            model_name='product',
            name='all_price',
            field=models.CharField(blank=True, help_text='All Price from Excel', max_length=100),
        ),
        
        # Restore Delivery - Sender Information
        migrations.AddField(
            model_name='product',
            name='sender',
            field=models.CharField(blank=True, help_text='Sender name', max_length=255),
        ),
        migrations.AddField(
            model_name='product',
            name='sender_address',
            field=models.TextField(blank=True, help_text='Sender full address'),
        ),
        migrations.AddField(
            model_name='product',
            name='sender_phone',
            field=models.CharField(blank=True, help_text='Sender phone number', max_length=20),
        ),
        
        # Restore Delivery - Recipient Information
        migrations.AddField(
            model_name='product',
            name='recipient',
            field=models.CharField(blank=True, help_text='Recipient name', max_length=255),
        ),
        migrations.AddField(
            model_name='product',
            name='recipient_address',
            field=models.TextField(blank=True, help_text='Recipient full address'),
        ),
        migrations.AddField(
            model_name='product',
            name='recipient_phone',
            field=models.CharField(blank=True, help_text='Recipient phone number', max_length=20),
        ),
        migrations.AddField(
            model_name='product',
            name='recipient_email',
            field=models.EmailField(blank=True, help_text='Recipient email address', max_length=254),
        ),
        
        # Restore Delivery - Parcel Locker Specific
        migrations.AddField(
            model_name='product',
            name='locker_provider',
            field=models.CharField(blank=True, help_text='Locker provider name (e.g., Packeta, GLS ParcelShop)', max_length=100),
        ),
        migrations.AddField(
            model_name='product',
            name='locker_id',
            field=models.CharField(blank=True, help_text='Locker ID or code', max_length=100),
        ),
        
        # Restore Delivery - Pickup Point Specific
        migrations.AddField(
            model_name='product',
            name='pickup_provider',
            field=models.CharField(blank=True, help_text='Pickup point provider (e.g., DPD Pickup, GLS Point)', max_length=100),
        ),
        migrations.AddField(
            model_name='product',
            name='pickup_location',
            field=models.CharField(blank=True, help_text='Pickup point location or address', max_length=255),
        ),
        
        # Restore Delivery - International Specific
        migrations.AddField(
            model_name='product',
            name='customs_description',
            field=models.TextField(blank=True, help_text='Customs declaration description'),
        ),
        migrations.AddField(
            model_name='product',
            name='item_value',
            field=models.CharField(blank=True, help_text='Declared item value for customs', max_length=100),
        ),
        migrations.AddField(
            model_name='product',
            name='hs_category',
            field=models.CharField(blank=True, help_text='HS (Harmonized System) category code', max_length=100),
        ),
        
        # Restore Delivery - Additional Options
        migrations.AddField(
            model_name='product',
            name='insurance',
            field=models.CharField(blank=True, default='no', help_text='Insurance: yes or no', max_length=10),
        ),
        migrations.AddField(
            model_name='product',
            name='cod',
            field=models.CharField(blank=True, help_text='Cash on Delivery amount', max_length=100),
        ),
        migrations.AddField(
            model_name='product',
            name='pickup_time',
            field=models.CharField(blank=True, help_text='Pickup time for same-day delivery', max_length=100),
        ),
        
        # Restore Issues fields
        migrations.AddField(
            model_name='product',
            name='issue_state',
            field=models.CharField(choices=[('No Issue', 'No Issue'), ('Issue Reported', 'Issue Reported'), ('AI Resolving', 'AI Resolving'), ('Human Action Required', 'Human Action Required'), ('Pending Vendor Response', 'Pending Vendor Response'), ('Resolved', 'Resolved')], default='No Issue', max_length=30),
        ),
        migrations.AddField(
            model_name='product',
            name='issue_type',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='product',
            name='issue_description',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='product',
            name='replacement_requested',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='product',
            name='replacement_approved',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='product',
            name='replacement_eta',
            field=models.DateField(blank=True, null=True),
        ),
        
        # Restore Images
        migrations.AddField(
            model_name='product',
            name='thumbnail_url',
            field=models.URLField(blank=True, help_text='Thumbnail image URL', max_length=500),
        ),
        
        # Restore Import tracking
        migrations.AddField(
            model_name='product',
            name='import_row_number',
            field=models.IntegerField(blank=True, help_text='Row number from Excel import', null=True),
        ),
    ]
