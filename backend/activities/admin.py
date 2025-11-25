from django.contrib import admin
from .models import Activity, AINote, ManualNote


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ['apartment', 'actor', 'type', 'summary', 'timestamp']
    list_filter = ['type', 'timestamp', 'actor']
    search_fields = ['summary', 'actor', 'apartment__name']
    readonly_fields = ['timestamp', 'created_at']
    raw_id_fields = ['apartment']


@admin.register(AINote)
class AINoteAdmin(admin.ModelAdmin):
    list_display = ['apartment', 'sender', 'email_subject', 'timestamp']
    list_filter = ['sender', 'timestamp']
    search_fields = ['content', 'email_subject', 'apartment__name']
    readonly_fields = ['timestamp']
    raw_id_fields = ['apartment']


@admin.register(ManualNote)
class ManualNoteAdmin(admin.ModelAdmin):
    list_display = ['apartment', 'updated_at']
    search_fields = ['content', 'apartment__name']
    readonly_fields = ['updated_at']
    raw_id_fields = ['apartment']
