# Generated migration for Activity model updates

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('activities', '0002_alter_activity_id_alter_ainote_id_and_more'),
    ]

    operations = [
        # Make apartment nullable
        migrations.AlterField(
            model_name='activity',
            name='apartment',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='activities',
                to='apartments.apartment'
            ),
        ),
        # Add user field
        migrations.AddField(
            model_name='activity',
            name='user',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='activities',
                to=settings.AUTH_USER_MODEL
            ),
        ),
        # Add activity_type field
        migrations.AddField(
            model_name='activity',
            name='activity_type',
            field=models.CharField(
                choices=[
                    ('product', 'Product'),
                    ('payment', 'Payment'),
                    ('delivery', 'Delivery'),
                    ('issue', 'Issue'),
                    ('ai', 'AI'),
                    ('status', 'Status'),
                    ('order', 'Order'),
                    ('apartment', 'Apartment'),
                    ('client', 'Client'),
                    ('vendor', 'Vendor'),
                    ('user', 'User'),
                ],
                default='status',
                max_length=20
            ),
            preserve_default=False,
        ),
        # Add action field
        migrations.AddField(
            model_name='activity',
            name='action',
            field=models.CharField(
                choices=[
                    ('created', 'Created'),
                    ('updated', 'Updated'),
                    ('deleted', 'Deleted'),
                    ('status_changed', 'Status Changed'),
                    ('payment_received', 'Payment Received'),
                    ('delivered', 'Delivered'),
                    ('assigned', 'Assigned'),
                    ('completed', 'Completed'),
                    ('cancelled', 'Cancelled'),
                ],
                default='created',
                max_length=20
            ),
        ),
        # Add title field
        migrations.AddField(
            model_name='activity',
            name='title',
            field=models.CharField(default='Activity', max_length=255),
            preserve_default=False,
        ),
        # Add description field
        migrations.AddField(
            model_name='activity',
            name='description',
            field=models.TextField(blank=True),
        ),
        # Add object_id field
        migrations.AddField(
            model_name='activity',
            name='object_id',
            field=models.CharField(blank=True, help_text='UUID of related object', max_length=100),
        ),
        # Add object_type field
        migrations.AddField(
            model_name='activity',
            name='object_type',
            field=models.CharField(blank=True, help_text='Model name of related object', max_length=50),
        ),
        # Add metadata field
        migrations.AddField(
            model_name='activity',
            name='metadata',
            field=models.JSONField(blank=True, default=dict),
        ),
        # Make legacy fields optional
        migrations.AlterField(
            model_name='activity',
            name='actor',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AlterField(
            model_name='activity',
            name='icon',
            field=models.CharField(blank=True, max_length=50),
        ),
        migrations.AlterField(
            model_name='activity',
            name='summary',
            field=models.TextField(blank=True),
        ),
        migrations.AlterField(
            model_name='activity',
            name='type',
            field=models.CharField(blank=True, max_length=20),
        ),
    ]
