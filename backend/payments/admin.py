from django.contrib import admin
from .models import Payment, PaymentHistory


class PaymentHistoryInline(admin.TabularInline):
    model = PaymentHistory
    extra = 0
    readonly_fields = ['created_at']


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['order_reference', 'apartment', 'vendor', 'total_amount', 'amount_paid', 'status', 'due_date', 'product_count']
    list_filter = ['status', 'due_date', 'created_at']
    search_fields = ['order_reference', 'apartment__name', 'vendor__name']
    readonly_fields = ['created_at', 'updated_at', 'outstanding_amount']
    raw_id_fields = ['apartment', 'vendor']
    filter_horizontal = ['products']
    inlines = [PaymentHistoryInline]
    
    def product_count(self, obj):
        """Display count of products in this payment"""
        return obj.products.count()
    product_count.short_description = 'Products'


@admin.register(PaymentHistory)
class PaymentHistoryAdmin(admin.ModelAdmin):
    list_display = ['payment', 'date', 'amount', 'method', 'reference_no']
    list_filter = ['method', 'date']
    search_fields = ['reference_no', 'payment__order_reference']
    readonly_fields = ['created_at']
    raw_id_fields = ['payment']
