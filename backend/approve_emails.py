#!/usr/bin/env python
"""
Approve pending AI email replies
"""
import os
import sys
import django

# Setup Django environment
sys.path.insert(0, '/root/buy2rent/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from issues.models import AICommunicationLog
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings

User = get_user_model()

def show_pending_approvals():
    """Display all pending email approvals"""
    pending = AICommunicationLog.objects.filter(
        status='pending_approval',
        message_type='email'
    ).select_related('issue', 'approved_by')
    
    if not pending.exists():
        print("✅ No pending approvals")
        return []
    
    print(f"\n📧 {pending.count()} Email(s) Pending Approval:")
    print("=" * 80)
    
    pending_list = []
    for idx, msg in enumerate(pending, 1):
        print(f"\n{idx}. Message ID: {msg.id}")
        print(f"   Issue: {msg.issue.type} (#{msg.issue.id})")
        print(f"   Subject: {msg.subject}")
        print(f"   To: {msg.email_to}")
        print(f"   Created: {msg.timestamp}")
        print(f"   AI Confidence: {msg.ai_confidence}")
        print(f"\n   Message Preview:")
        print("   " + "-" * 60)
        print(f"   {msg.message[:400]}...")
        print("   " + "-" * 60)
        
        pending_list.append(msg)
    
    return pending_list

def approve_message(message_id, user=None):
    """Approve and send a pending message"""
    try:
        msg = AICommunicationLog.objects.get(id=message_id, status='pending_approval')
    except AICommunicationLog.DoesNotExist:
        print(f"❌ Message {message_id} not found or already processed")
        return False
    
    # Get admin user if not provided
    if not user:
        user = User.objects.filter(is_superuser=True).first()
    
    # Approve the message
    msg.approved_by = user
    msg.approved_at = timezone.now()
    msg.status = 'sent'
    msg.save()
    
    print(f"✅ Message approved by {user.username if user else 'system'}")
    
    # Send the actual email
    try:
        send_mail(
            subject=msg.subject,
            message=msg.message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[msg.email_to],
            fail_silently=False,
        )
        print(f"✅ Email sent to {msg.email_to}")
        return True
    except Exception as e:
        print(f"❌ Failed to send email: {e}")
        msg.status = 'failed'
        msg.save()
        return False

def approve_all():
    """Approve all pending messages"""
    pending = show_pending_approvals()
    
    if not pending:
        return
    
    print(f"\n⚠️  Approve all {len(pending)} messages? (yes/no): ", end="")
    confirm = input().strip().lower()
    
    if confirm == 'yes':
        approved = 0
        for msg in pending:
            if approve_message(msg.id):
                approved += 1
        print(f"\n✅ Approved and sent {approved} messages")
    else:
        print("Cancelled")

def approve_interactive():
    """Interactive approval process"""
    pending = show_pending_approvals()
    
    if not pending:
        return
    
    print("\n" + "=" * 80)
    print("APPROVAL OPTIONS:")
    print("  [number] - Approve specific message")
    print("  'all'    - Approve all messages")
    print("  'skip'   - Skip approval")
    print("  'exit'   - Exit")
    print("=" * 80)
    
    while True:
        print("\nEnter option: ", end="")
        choice = input().strip().lower()
        
        if choice == 'exit':
            break
        elif choice == 'skip':
            print("Skipped")
            break
        elif choice == 'all':
            approve_all()
            break
        elif choice.isdigit():
            idx = int(choice) - 1
            if 0 <= idx < len(pending):
                approve_message(pending[idx].id)
            else:
                print("Invalid number")
        else:
            print("Invalid option")

def main():
    print("=" * 80)
    print(" AI EMAIL APPROVAL SYSTEM")
    print("=" * 80)
    
    # Check for command line arguments
    if len(sys.argv) > 1:
        if sys.argv[1] == '--all':
            approve_all()
        elif sys.argv[1] == '--list':
            show_pending_approvals()
        else:
            # Assume it's a message ID
            approve_message(sys.argv[1])
    else:
        # Interactive mode
        approve_interactive()

if __name__ == "__main__":
    main()
