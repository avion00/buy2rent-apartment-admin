from django.contrib import admin
from .models import Vendor


@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ['name', 'company_name', 'email', 'phone', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'company_name', 'email']
    readonly_fields = ['created_at', 'updated_at']
