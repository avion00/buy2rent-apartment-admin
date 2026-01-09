#!/usr/bin/env python
"""
Process the vendor reply that's in the inbox
"""
import os
import sys
import django
import imaplib
import email
from email.header import decode_header
import re

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, '/root/buy2rent/backend')
django.setup()

from django.conf import settings
from django.utils import timezone
from issues.models import Issue, AICommunicationLog
from issues.email_monitor import EmailMonitor
import asyncio
from issues.ai_services import ai_manager

def process_specific_vendor_reply():
    print("=== Processing Vendor Reply ===\n")
    
    # The vendor reply we found
    issue_id = '06e7d237-7188-4ca1-9f5f-d161c30fc4c1'
    vendor_subject = "Re: [Issue #06e7d237-7188-4ca1-9f5f-d161c30fc4c1] Urgent: Report of Critical Issue with Order #5070ff24-27d4-42af-8bbc-3d45818dc9e6"
    vendor_message = "Sorry, we don't offer"  # From the preview we saw
    
    print(f"📧 Processing vendor reply for Issue: {issue_id}")
    
    try:
        # Get the issue
        issue = Issue.objects.get(id=issue_id)
        print(f"✅ Found issue: {issue.type}")
        
        # Check if already processed
        existing = AICommunicationLog.objects.filter(
            issue=issue,
            sender='Vendor',
            subject__contains=issue_id
        ).exists()
        
        if existing:
            print("⚠️ Vendor response already exists in database")
        else:
            # Add vendor response to database
            vendor_log = AICommunicationLog.objects.create(
                issue=issue,
                sender='Vendor',
                message=vendor_message,
                message_type='email',
                subject=vendor_subject,
                email_from='anonsagar00@gmail.com',
                email_to='yaihomero@gmail.com',
                status='received',
                email_thread_id=f"issue-{issue.id}",
                email_message_id=f'<vendor-reply-{issue.id}@gmail.com>',
                timestamp=timezone.now()
            )
            print(f"✅ Added vendor response to database")
            
            # Generate AI reply
            print("\n🤖 Generating AI reply...")
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            try:
                # Analyze and generate reply
                result = loop.run_until_complete(
                    ai_manager.generate_reply_for_approval(issue, vendor_message)
                )
                
                if result.get('success'):
                    print(f"✅ AI reply generated successfully")
                    print(f"   Confidence: {result.get('confidence', 0):.2%}")
                    
                    # Get the generated reply
                    ai_reply = AICommunicationLog.objects.filter(
                        issue=issue,
                        sender='AI',
                        status='pending_approval'
                    ).order_by('-timestamp').first()
                    
                    if ai_reply:
                        print(f"\n📋 AI Reply Preview:")
                        print(f"   Subject: {ai_reply.subject}")
                        print(f"   Message: {ai_reply.message[:200]}...")
                        print(f"   Status: {ai_reply.status}")
                else:
                    print(f"❌ Failed to generate AI reply: {result.get('message')}")
                    
            finally:
                loop.close()
        
        # Show current thread
        print("\n📊 Current Email Thread:")
        all_messages = AICommunicationLog.objects.filter(
            issue=issue
        ).order_by('timestamp')
        
        for msg in all_messages:
            icon = "📨" if msg.sender == "Vendor" else "🤖" if msg.sender == "AI" else "👤"
            status = f" [{msg.status}]" if msg.status else ""
            print(f"   {icon} {msg.sender}{status}: {msg.subject or msg.message[:50]}...")
        
        print(f"\n✅ Processing complete!")
        print(f"📍 Check the UI at: https://procurement.buy2rent.eu/issues")
        print(f"   Issue ID: {issue.id}")
        
    except Issue.DoesNotExist:
        print(f"❌ Issue {issue_id} not found in database")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    process_specific_vendor_reply()
