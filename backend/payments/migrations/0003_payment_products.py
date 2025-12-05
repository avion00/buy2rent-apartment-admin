# Generated migration for adding products field to Payment model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0002_alter_payment_id_alter_paymenthistory_id'),
        ('products', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='payment',
            name='products',
            field=models.ManyToManyField(
                blank=True,
                help_text='Products included in this payment',
                related_name='payments',
                to='products.product'
            ),
        ),
    ]
