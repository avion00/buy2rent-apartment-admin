# Generated migration for new payment fields

from django.db import migrations, models
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0004_payment_order_payment_order_items_and_more'),
    ]

    operations = [
        # Change total_amount from DecimalField to PositiveIntegerField
        migrations.AlterField(
            model_name='payment',
            name='total_amount',
            field=models.PositiveIntegerField(
                default=0,
                help_text='Subtotal amount from order items',
                validators=[django.core.validators.MinValueValidator(0)]
            ),
        ),
        # Change amount_paid from DecimalField to PositiveIntegerField
        migrations.AlterField(
            model_name='payment',
            name='amount_paid',
            field=models.PositiveIntegerField(
                default=0,
                help_text='Amount paid so far',
                validators=[django.core.validators.MinValueValidator(0)]
            ),
        ),
        # Add shipping_cost field
        migrations.AddField(
            model_name='payment',
            name='shipping_cost',
            field=models.PositiveIntegerField(
                default=0,
                help_text='Shipping cost (optional)',
                validators=[django.core.validators.MinValueValidator(0)]
            ),
        ),
        # Add discount field
        migrations.AddField(
            model_name='payment',
            name='discount',
            field=models.PositiveIntegerField(
                default=0,
                help_text='Discount amount (optional)',
                validators=[django.core.validators.MinValueValidator(0)]
            ),
        ),
        # Add payment_method field
        migrations.AddField(
            model_name='payment',
            name='payment_method',
            field=models.CharField(
                choices=[('Bank Transfer', 'Bank Transfer'), ('Card Payment', 'Card Payment'), ('Cash', 'Cash')],
                default='Bank Transfer',
                max_length=20
            ),
        ),
        # Add reference_number field
        migrations.AddField(
            model_name='payment',
            name='reference_number',
            field=models.CharField(blank=True, max_length=100),
        ),
        # Bank Transfer fields
        migrations.AddField(
            model_name='payment',
            name='bank_name',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='payment',
            name='account_holder',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='payment',
            name='account_number',
            field=models.CharField(blank=True, max_length=50),
        ),
        migrations.AddField(
            model_name='payment',
            name='iban',
            field=models.CharField(blank=True, max_length=50),
        ),
        # Card Payment fields
        migrations.AddField(
            model_name='payment',
            name='card_holder',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='payment',
            name='card_last_four',
            field=models.CharField(blank=True, max_length=4),
        ),
    ]
