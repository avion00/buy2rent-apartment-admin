#!/usr/bin/env python
"""
Show the complete email thread for the issue
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, '/root/buy2rent/backend')
django.setup()

from issues.models import Issue, AICommunicationLog

def show_email_thread():
    print("=== Email Thread for Issue ===\n")
    
    issue_id = '06e7d237-7188-4ca1-9f5f-d161c30fc4c1'
    
    try:
        issue = Issue.objects.get(id=issue_id)
        print(f"📋 Issue: {issue.type}")
        print(f"   ID: {issue.id}")
        print(f"   Status: {issue.status}")
        print(f"   AI Activated: {issue.ai_activated}")
        
        # Get all communication logs
        logs = AICommunicationLog.objects.filter(
            issue=issue
        ).order_by('timestamp')
        
        print(f"\n📧 Email Thread ({logs.count()} messages):")
        print("="*60)
        
        for idx, log in enumerate(logs, 1):
            print(f"\n#{idx} {log.sender}")
            print(f"   Time: {log.timestamp}")
            print(f"   Subject: {log.subject}")
            print(f"   Status: {log.status}")
            
            if log.sender == 'Vendor':
                print(f"   From: {log.email_from}")
            
            # Show message preview
            message_preview = log.message[:200] if log.message else "No message"
            print(f"   Message: {message_preview}...")
            
            if log.sender == 'AI' and log.status == 'pending_approval':
                print(f"   ⏳ PENDING APPROVAL - Needs admin action")
        
        print("\n" + "="*60)
        print("\n✅ Summary:")
        
        vendor_count = logs.filter(sender='Vendor').count()
        ai_count = logs.filter(sender='AI').count()
        pending_count = logs.filter(status='pending_approval').count()
        
        print(f"   Vendor messages: {vendor_count}")
        print(f"   AI messages: {ai_count}")
        print(f"   Pending approval: {pending_count}")
        
        if vendor_count > 0:
            print(f"\n✅ Vendor has replied to this issue")
            latest_vendor = logs.filter(sender='Vendor').last()
            print(f"   Latest vendor message: {latest_vendor.message[:100]}...")
        
        if pending_count > 0:
            print(f"\n⏳ ACTION REQUIRED:")
            print(f"   {pending_count} AI response(s) pending approval")
            print(f"   Go to https://procurement.buy2rent.eu/issues")
            print(f"   Open issue {issue.id} and approve/edit the AI reply")
        
    except Issue.DoesNotExist:
        print(f"❌ Issue {issue_id} not found")

if __name__ == "__main__":
    show_email_thread()
