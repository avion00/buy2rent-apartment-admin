from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import Product
from .category_models import ProductCategory, ImportSession


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        'sn', 'product', 'apartment', 'room', 'category', 'vendor', 'sku', 
        'unit_price', 'qty', 'cost', 'total_cost', 'status', 'payment_status', 
        'link_display', 'description_short', 'image_display', 'brand', 'material', 'color', 'size',
        'dimensions', 'weight', 'model_number', 'country_of_origin',
        # Excel Import Fields
        'nm', 'plusz_nm', 'price_per_nm', 'price_per_package', 
        'nm_per_package', 'all_package', 'package_need_to_order', 'all_price',
        # Dates
        'eta', 'ordered_on', 'expected_delivery_date', 'actual_delivery_date', 'payment_due_date',
        # Payment Details
        'payment_amount', 'paid_amount', 'currency', 'shipping_cost', 'discount', 'outstanding_balance',
        # Delivery Details
        'delivery_type', 'delivery_address', 'delivery_city', 'delivery_postal_code', 
        'delivery_country', 'delivery_contact_person', 'delivery_contact_phone', 
        'delivery_contact_email', 'tracking_number', 'delivery_instructions', 
        'delivery_time_window', 'delivery_notes', 'condition_on_arrival',
        # Issues
        'issue_state', 'issue_type', 'issue_description', 'replacement_requested', 
        'replacement_approved', 'replacement_eta',
        # Images & Media
        'image_url', 'image_file', 'thumbnail_url', 'gallery_images_count', 'attachments_count',
        # Meta
        'import_row_number', 'notes', 'manual_notes', 'ai_summary_notes', 'created_by', 'created_at', 'updated_at'
    ]
    list_filter = [
        'availability', 'status', 'payment_status', 'issue_state', 
        'category', 'vendor', 'import_session', 'room', 'brand', 'material', 
        'color', 'size', 'delivery_address', 'delivery_city', 'delivery_country',
        'currency', 'replacement_requested', 'replacement_approved', 'created_at'
    ]
    search_fields = [
        'product', 'sku', 'sn', 'vendor__name', 'apartment__name', 'room', 
        'cost', 'total_cost', 'description', 'brand', 'material', 'color', 
        'link', 'delivery_address', 'tracking_number', 'delivery_instructions',
        'delivery_notes', 'condition_on_arrival', 'model_number', 'country_of_origin',
        'product_image', 'nm', 'plusz_nm', 'price_per_nm', 'all_price',
        'issue_description', 'notes', 'manual_notes', 'created_by'
    ]
    readonly_fields = ['created_at', 'updated_at', 'total_amount', 'outstanding_balance']
    raw_id_fields = ['apartment', 'vendor', 'replacement_of']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('sn', 'apartment', 'category', 'import_session', 'product', 'description', 'vendor', 'vendor_link', 'sku')
        }),
        ('Product Details', {
            'fields': ('dimensions', 'weight', 'material', 'color', 'model_number', 'brand', 'size', 'room')
        }),
        ('Excel Import Data', {
            'fields': ('cost', 'total_cost', 'link', 'nm', 'plusz_nm', 'price_per_nm', 'price_per_package', 'nm_per_package', 'all_package', 'package_need_to_order', 'all_price'),
            'classes': ('collapse',)
        }),
        ('Pricing', {
            'fields': ('unit_price', 'qty', 'currency', 'shipping_cost', 'discount', 'total_amount')
        }),
        ('Status', {
            'fields': ('availability', 'status', 'payment_status', 'issue_state')
        }),
        ('Dates', {
            'fields': ('eta', 'ordered_on', 'expected_delivery_date', 'actual_delivery_date', 'payment_due_date')
        }),
        ('Payment', {
            'fields': ('payment_amount', 'paid_amount', 'outstanding_balance')
        }),
        ('Delivery', {
            'fields': (
                'delivery_type', 'delivery_address', 'delivery_city', 'delivery_postal_code',
                'delivery_country', 'delivery_instructions', 'delivery_time_window', 
                'delivery_notes', 'delivery_contact_person', 'delivery_contact_phone',
                'delivery_contact_email', 'tracking_number', 'condition_on_arrival'
            )
        }),
        ('Issues', {
            'fields': (
                'issue_type', 'issue_description', 'replacement_requested', 
                'replacement_approved', 'replacement_eta', 'replacement_of'
            )
        }),
        ('Images & Files', {
            'fields': ('image_url', 'product_image', 'image_file', 'thumbnail_url', 'gallery_images', 'attachments')
        }),
        ('Import Data', {
            'fields': ('import_row_number', 'import_data'),
            'classes': ('collapse',)
        }),
        ('Meta', {
            'fields': ('country_of_origin', 'notes', 'manual_notes', 'ai_summary_notes', 'created_by', 'created_at', 'updated_at')
        }),
    )
    
    # Custom display methods for list_display
    def link_display(self, obj):
        """Display clickable link if available"""
        if obj.link:
            return format_html('<a href="{}" target="_blank">🔗 Link</a>', obj.link)
        return '-'
    link_display.short_description = 'Product Link'
    
    def description_short(self, obj):
        """Display shortened description"""
        if obj.description:
            return obj.description[:50] + '...' if len(obj.description) > 50 else obj.description
        return '-'
    description_short.short_description = 'Description'
    
    def image_display(self, obj):
        """Display product image thumbnail"""
        image_url = obj.image_url or obj.product_image
        if image_url:
            if image_url.startswith(('http://', 'https://', '/media/')):
                return format_html('<img src="{}" width="50" height="50" style="object-fit: cover; border-radius: 4px;" />', image_url)
            else:
                return format_html('<span title="{}">📷 {}</span>', image_url, image_url[:20] + '...' if len(image_url) > 20 else image_url)
        return '-'
    image_display.short_description = 'Product Image'
    
    def gallery_images_count(self, obj):
        """Display count of gallery images"""
        if obj.gallery_images:
            return len(obj.gallery_images)
        return 0
    gallery_images_count.short_description = 'Gallery Images'
    
    def attachments_count(self, obj):
        """Display count of attachments"""
        if obj.attachments:
            return len(obj.attachments)
        return 0
    attachments_count.short_description = 'Attachments'
    
    # Add more comprehensive list_per_page for better viewing
    list_per_page = 50
    list_max_show_all = 200
    
    # Enable inline editing for some fields
    list_editable = ['status', 'payment_status', 'qty', 'unit_price']
    
    # Add actions for bulk operations
    actions = ['mark_as_delivered', 'mark_as_paid', 'export_as_csv']
    
    def mark_as_delivered(self, request, queryset):
        """Mark selected products as delivered"""
        from datetime import date
        updated = queryset.update(
            actual_delivery_date=date.today(),
            status='Delivered'
        )
        self.message_user(request, f'{updated} products marked as delivered.')
    mark_as_delivered.short_description = "Mark selected products as delivered"
    
    def mark_as_paid(self, request, queryset):
        """Mark selected products as paid"""
        updated = queryset.update(payment_status='Paid')
        self.message_user(request, f'{updated} products marked as paid.')
    mark_as_paid.short_description = "Mark selected products as paid"
    
    def export_as_csv(self, request, queryset):
        """Export selected products as CSV with all fields"""
        import csv
        from django.http import HttpResponse
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="products_complete.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'S.N', 'Product', 'Room', 'Category', 'Cost', 'Total Cost', 'Unit Price', 'Qty',
            'Status', 'Payment Status', 'Link', 'Description', 'Brand', 'Material', 'Color', 'Size',
            'Product Image', 'NM', 'Plus NM', 'Price per NM', 'Price per Package', 'All Package',
            'ETA', 'Ordered On', 'Expected Delivery', 'Actual Delivery', 'Payment Due',
            'Delivery Address', 'Delivery City', 'Tracking Number', 'Issue State', 'Created At'
        ])
        
        for product in queryset:
            writer.writerow([
                product.sn, product.product, product.room, product.category,
                product.cost, product.total_cost, product.unit_price, product.qty,
                product.status, product.payment_status, product.link, product.description,
                product.brand, product.material, product.color, product.size,
                product.product_image, product.nm, product.plusz_nm, product.price_per_nm,
                product.price_per_package, product.all_package, product.eta, product.ordered_on,
                product.expected_delivery_date, product.actual_delivery_date, product.payment_due_date,
                product.delivery_address, product.delivery_city, product.tracking_number,
                product.issue_state, product.created_at
            ])
        
        return response
    export_as_csv.short_description = "Export selected products as complete CSV"


@admin.register(ProductCategory)
class ProductCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'apartment', 'sheet_name', 'product_count', 'import_date', 'is_active']
    list_filter = ['is_active', 'import_date', 'apartment']
    search_fields = ['name', 'sheet_name', 'apartment__name']
    readonly_fields = ['import_date', 'product_count']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'apartment', 'description', 'room_type', 'priority', 'is_active')
        }),
        ('Import Information', {
            'fields': ('sheet_name', 'import_file_name', 'import_date', 'product_count')
        }),
    )


@admin.register(ImportSession)
class ImportSessionAdmin(admin.ModelAdmin):
    list_display = ['file_name', 'apartment', 'status', 'total_products', 'successful_imports', 'failed_imports', 'started_at']
    list_filter = ['status', 'file_type', 'started_at', 'apartment']
    search_fields = ['file_name', 'apartment__name']
    readonly_fields = ['started_at', 'completed_at']
    
    fieldsets = (
        ('File Information', {
            'fields': ('apartment', 'file_name', 'file_size', 'file_type')
        }),
        ('Import Results', {
            'fields': ('total_sheets', 'total_products', 'successful_imports', 'failed_imports', 'status')
        }),
        ('Timestamps', {
            'fields': ('started_at', 'completed_at')
        }),
        ('Error Log', {
            'fields': ('error_log',),
            'classes': ('collapse',)
        }),
    )
