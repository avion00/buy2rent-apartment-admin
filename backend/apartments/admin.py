from django.contrib import admin
from django.db import transaction, connection
from .models import Apartment


@admin.register(Apartment)
class ApartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'client', 'status', 'progress', 'start_date', 'due_date']
    list_filter = ['type', 'status', 'start_date', 'due_date']
    search_fields = ['name', 'address', 'client__name']
    readonly_fields = ['created_at', 'updated_at']
    raw_id_fields = ['client']
    
    def delete_queryset(self, request, queryset):
        """Override to properly handle cascade deletion of related objects"""
        # For SQLite, temporarily disable foreign key constraints
        cursor = connection.cursor()
        is_sqlite = connection.vendor == 'sqlite'
        
        try:
            if is_sqlite:
                cursor.execute('PRAGMA foreign_keys = OFF;')
            
            with transaction.atomic():
                for apartment in queryset:
                    # Delete all related objects
                    apartment.issues.all().delete()
                    apartment.products.all().delete()
                    apartment.orders.all().delete()
                    apartment.payments.all().delete()
                    apartment.deliveries.all().delete()
                    apartment.activities.all().delete()
                    apartment.ai_notes.all().delete()
                    apartment.delete()
        finally:
            if is_sqlite:
                cursor.execute('PRAGMA foreign_keys = ON;')
    
    def delete_model(self, request, obj):
        """Override to properly handle cascade deletion when deleting single apartment"""
        # For SQLite, temporarily disable foreign key constraints
        cursor = connection.cursor()
        is_sqlite = connection.vendor == 'sqlite'
        
        try:
            if is_sqlite:
                cursor.execute('PRAGMA foreign_keys = OFF;')
            
            with transaction.atomic():
                # Delete all related objects
                obj.issues.all().delete()
                obj.products.all().delete()
                obj.orders.all().delete()
                obj.payments.all().delete()
                obj.deliveries.all().delete()
                obj.activities.all().delete()
                obj.ai_notes.all().delete()
                obj.delete()
        finally:
            if is_sqlite:
                cursor.execute('PRAGMA foreign_keys = ON;')
