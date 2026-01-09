"""
Web views for displaying email conversations
"""
from django.shortcuts import render
from django.db.models import Count
from .models import Issue, AICommunicationLog


def email_conversations_view(request):
    """Display all email conversations"""
    
    # Get issues with email conversations
    issues_with_emails = Issue.objects.annotate(
        email_count=Count('ai_communication_log')
    ).filter(
        email_count__gt=0,
        ai_communication_log__message_type='email'
    ).distinct()
    
    issues_data = []
    for issue in issues_with_emails:
        emails = AICommunicationLog.objects.filter(
            issue=issue,
            message_type='email'
        ).order_by('timestamp')
        
        issues_data.append({
            'issue': issue,
            'emails': emails
        })
    
    # Statistics
    total_issues = Issue.objects.filter(ai_activated=True).count()
    total_emails = AICommunicationLog.objects.filter(message_type='email').count()
    pending_count = AICommunicationLog.objects.filter(status='pending_approval').count()
    
    context = {
        'issues': issues_data,
        'total_issues': total_issues,
        'total_emails': total_emails,
        'pending_count': pending_count
    }
    
    return render(request, 'email_conversations.html', context)
