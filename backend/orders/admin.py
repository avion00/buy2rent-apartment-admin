from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['total_price']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['po_number', 'vendor', 'apartment', 'status', 'total', 'placed_on', 'items_count']
    list_filter = ['status', 'placed_on', 'vendor', 'apartment']
    search_fields = ['po_number', 'vendor__name', 'apartment__name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    inlines = [OrderItemInline]
    
    fieldsets = (
        ('Order Information', {
            'fields': ('po_number', 'apartment', 'vendor', 'status')
        }),
        ('Order Details', {
            'fields': ('items_count', 'total', 'notes')
        }),
        ('Dates', {
            'fields': ('placed_on', 'expected_delivery', 'actual_delivery')
        }),
        ('Shipping', {
            'fields': ('shipping_address', 'tracking_number')
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['product_name', 'order', 'quantity', 'unit_price', 'total_price']
    list_filter = ['order__vendor', 'order__apartment']
    search_fields = ['product_name', 'sku', 'order__po_number']
    readonly_fields = ['id', 'total_price', 'created_at', 'updated_at']
