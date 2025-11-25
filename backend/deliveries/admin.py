from django.contrib import admin
from .models import Delivery


@admin.register(Delivery)
class DeliveryAdmin(admin.ModelAdmin):
    list_display = ['order_reference', 'apartment', 'vendor', 'expected_date', 'actual_date', 'status']
    list_filter = ['status', 'expected_date', 'actual_date']
    search_fields = ['order_reference', 'apartment__name', 'vendor__name']
    readonly_fields = ['created_at', 'updated_at']
    raw_id_fields = ['apartment', 'vendor']
