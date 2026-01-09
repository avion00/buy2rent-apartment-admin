#!/usr/bin/env python
"""
Check what email conversations exist and their status
"""
import os
import sys
import django

# Setup Django environment
sys.path.insert(0, '/root/buy2rent/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from issues.models import Issue, AICommunicationLog
from django.db.models import Count

def display_all_conversations():
    """Display all email conversations in the system"""
    
    # Get issues with email conversations
    issues_with_emails = Issue.objects.annotate(
        email_count=Count('ai_communication_log')
    ).filter(email_count__gt=0)
    
    print("=" * 70)
    print(" ALL EMAIL CONVERSATIONS IN SYSTEM")
    print("=" * 70)
    
    for issue in issues_with_emails:
        emails = AICommunicationLog.objects.filter(
            issue=issue,
            message_type='email'
        ).order_by('timestamp')
        
        if emails.exists():
            print(f"\n📋 Issue: {issue.id}")
            print(f"   Type: {issue.type}")
            print(f"   Status: {issue.status}")
            print(f"   AI Activated: {issue.ai_activated}")
            print(f"   Created: {issue.created_at}")
            print(f"\n   Email Thread ({emails.count()} messages):")
            
            for email in emails:
                status_icon = "✅" if email.status == 'sent' else "📨" if email.status == 'received' else "⏳"
                ai_badge = "[AI]" if email.ai_generated else "[Human]"
                
                print(f"   {status_icon} {email.timestamp.strftime('%m/%d %H:%M')} - {email.sender} {ai_badge}")
                print(f"      Subject: {email.subject}")
                print(f"      Status: {email.status}")
                if email.requires_approval and email.status == 'pending_approval':
                    print(f"      ⚠️ NEEDS APPROVAL")
    
    # Show pending approvals
    pending = AICommunicationLog.objects.filter(
        status='pending_approval',
        message_type='email'
    )
    
    if pending.exists():
        print("\n" + "=" * 70)
        print(" MESSAGES PENDING APPROVAL")
        print("=" * 70)
        
        for msg in pending:
            print(f"\n⏳ Message ID: {msg.id}")
            print(f"   Issue: {msg.issue.id} - {msg.issue.type}")
            print(f"   Created: {msg.timestamp}")
            print(f"   Preview: {msg.message[:100]}...")
            print(f"   API Endpoint: /api/ai-communication-logs/{msg.id}/approve/")

def check_api_endpoints():
    """Display available API endpoints for email conversations"""
    print("\n" + "=" * 70)
    print(" API ENDPOINTS FOR EMAIL CONVERSATIONS")
    print("=" * 70)
    
    endpoints = [
        ("View email thread", "GET /api/issues/{issue_id}/email_thread/"),
        ("Add vendor response", "POST /api/issues/{issue_id}/add_vendor_response/"),
        ("Generate AI reply", "POST /api/issues/{issue_id}/generate_ai_reply/"),
        ("View pending approvals", "GET /api/ai-communication-logs/pending_approvals/"),
        ("Approve message", "POST /api/ai-communication-logs/{message_id}/approve/"),
        ("Edit and send", "POST /api/ai-communication-logs/{message_id}/edit_and_send/"),
    ]
    
    for name, endpoint in endpoints:
        print(f"\n📌 {name}")
        print(f"   {endpoint}")

def main():
    display_all_conversations()
    check_api_endpoints()
    
    # Summary
    total_issues = Issue.objects.filter(ai_activated=True).count()
    total_emails = AICommunicationLog.objects.filter(message_type='email').count()
    pending_count = AICommunicationLog.objects.filter(status='pending_approval').count()
    
    print("\n" + "=" * 70)
    print(" SUMMARY")
    print("=" * 70)
    print(f"Total Issues with AI: {total_issues}")
    print(f"Total Email Messages: {total_emails}")
    print(f"Pending Approvals: {pending_count}")

if __name__ == "__main__":
    main()
