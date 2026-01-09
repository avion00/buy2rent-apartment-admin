#!/usr/bin/env python
"""
Script to send pending AI draft replies
Usage: python send_pending_drafts.py
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from issues.models import AICommunicationLog, Issue
from issues.email_service import email_service
from django.conf import settings

def send_pending_drafts():
    """Send all pending AI draft replies"""
    
    # Get all pending drafts
    pending_drafts = AICommunicationLog.objects.filter(
        status='pending_approval',
        sender='AI',
        ai_generated=True
    ).order_by('timestamp')
    
    print(f"Found {pending_drafts.count()} pending draft(s)")
    
    sent_count = 0
    failed_count = 0
    
    for draft in pending_drafts:
        try:
            issue = draft.issue
            
            print(f"\n{'='*60}")
            print(f"Draft ID: {draft.id}")
            print(f"Issue: {issue.id}")
            print(f"To: {draft.email_to}")
            print(f"Subject: {draft.subject}")
            print(f"Confidence: {draft.ai_confidence}")
            print(f"Created: {draft.timestamp}")
            
            # Check if we should send based on confidence
            confidence_threshold = getattr(settings, 'AI_EMAIL_CONFIDENCE_THRESHOLD', 0.8)
            
            if draft.ai_confidence and draft.ai_confidence < confidence_threshold:
                print(f"⚠️  Skipping: Confidence {draft.ai_confidence} below threshold {confidence_threshold}")
                continue
            
            # Prepare email
            subject = f"Re: [Issue #{issue.id}] {draft.subject}"
            body = f"{draft.message}\n\n---\nReference: Issue #{issue.id}\nPlease keep this reference in your reply."
            
            # Send email
            print(f"📧 Sending email...")
            email_message_id = email_service.send_issue_email(issue, subject, body)
            
            # Update draft status to sent
            draft.status = 'sent'
            draft.email_message_id = email_message_id
            draft.save()
            
            print(f"✅ Sent successfully! Message ID: {email_message_id}")
            sent_count += 1
            
        except Exception as e:
            print(f"❌ Failed to send draft {draft.id}: {e}")
            import traceback
            traceback.print_exc()
            failed_count += 1
    
    print(f"\n{'='*60}")
    print(f"Summary:")
    print(f"  ✅ Sent: {sent_count}")
    print(f"  ❌ Failed: {failed_count}")
    print(f"  📝 Total: {pending_drafts.count()}")
    
    return sent_count

if __name__ == '__main__':
    print("="*60)
    print("  Sending Pending AI Draft Replies")
    print("="*60)
    
    sent = send_pending_drafts()
    
    if sent > 0:
        print(f"\n🎉 Successfully sent {sent} draft reply(ies)!")
    else:
        print("\nℹ️  No drafts were sent.")
    
    sys.exit(0)
