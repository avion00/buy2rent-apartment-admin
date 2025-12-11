# Generated migration for PaymentHistory amount field

from django.db import migrations, models
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0005_payment_new_fields'),
    ]

    operations = [
        # Change amount from DecimalField to PositiveIntegerField
        migrations.AlterField(
            model_name='paymenthistory',
            name='amount',
            field=models.PositiveIntegerField(
                help_text='Payment amount in HUF',
                validators=[django.core.validators.MinValueValidator(0)]
            ),
        ),
        # Update method choices
        migrations.AlterField(
            model_name='paymenthistory',
            name='method',
            field=models.CharField(
                choices=[
                    ('Bank Transfer', 'Bank Transfer'),
                    ('Credit Card', 'Credit Card'),
                    ('Card Payment', 'Card Payment'),
                    ('Cash', 'Cash'),
                    ('Check', 'Check'),
                    ('Wire Transfer', 'Wire Transfer'),
                ],
                max_length=20
            ),
        ),
        # Update ordering
        migrations.AlterModelOptions(
            name='paymenthistory',
            options={'ordering': ['-date', '-created_at'], 'verbose_name_plural': 'Payment histories'},
        ),
    ]
