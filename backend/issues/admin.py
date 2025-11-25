from django.contrib import admin
from .models import Issue, IssuePhoto, AICommunicationLog


class IssuePhotoInline(admin.TabularInline):
    model = IssuePhoto
    extra = 0
    readonly_fields = ['uploaded_at']


class AICommunicationLogInline(admin.TabularInline):
    model = AICommunicationLog
    extra = 0
    readonly_fields = ['timestamp']


@admin.register(Issue)
class IssueAdmin(admin.ModelAdmin):
    list_display = ['type', 'product', 'apartment', 'vendor', 'status', 'priority', 'reported_on']
    list_filter = ['status', 'priority', 'ai_activated', 'reported_on']
    search_fields = ['type', 'description', 'product__product', 'vendor__name']
    readonly_fields = ['reported_on', 'created_at', 'updated_at', 'product_name']
    raw_id_fields = ['apartment', 'product', 'vendor']
    inlines = [IssuePhotoInline, AICommunicationLogInline]


@admin.register(IssuePhoto)
class IssuePhotoAdmin(admin.ModelAdmin):
    list_display = ['issue', 'url', 'uploaded_at']
    list_filter = ['uploaded_at']
    readonly_fields = ['uploaded_at']
    raw_id_fields = ['issue']


@admin.register(AICommunicationLog)
class AICommunicationLogAdmin(admin.ModelAdmin):
    list_display = ['issue', 'sender', 'timestamp']
    list_filter = ['sender', 'timestamp']
    search_fields = ['message', 'issue__type']
    readonly_fields = ['timestamp']
    raw_id_fields = ['issue']
