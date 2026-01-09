#!/usr/bin/env python
"""
Script to manually send AI email for an existing issue
Usage: python send_issue_email.py <issue_id>
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

import asyncio
from issues.models import Issue
from issues.ai_services_complete import ai_service
from issues.email_service import email_service

def send_email_for_issue(issue_id):
    """Send AI-generated email for an issue"""
    try:
        issue = Issue.objects.get(id=issue_id)
        print(f"Found issue: {issue.id}")
        print(f"Vendor: {issue.vendor.name if issue.vendor else 'None'}")
        print(f"Vendor Email: {issue.vendor.email if issue.vendor else 'None'}")
        
        if not issue.vendor:
            print("ERROR: No vendor assigned to this issue")
            return False
        
        if not issue.vendor.email:
            print("ERROR: Vendor has no email address")
            return False
        
        # Prepare issue data
        issue_data = {
            'issue_id': str(issue.id),
            'vendor_name': issue.vendor.name,
            'type': issue.type,
            'priority': issue.priority,
            'product_name': issue.get_product_name(),
            'description': issue.description,
            'impact': issue.impact,
            'order_reference': f"Order #{issue.order.po_number}" if issue.order else None
        }
        
        print("\nGenerating AI email...")
        
        # Generate AI email
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        result = loop.run_until_complete(
            ai_service.generate_issue_email(issue_data)
        )
        loop.close()
        
        if not result.get('success'):
            print(f"ERROR: Failed to generate AI email: {result.get('error')}")
            return False
        
        print(f"✓ AI email generated")
        print(f"Subject: {result['subject']}")
        
        # Add Issue ID to subject and body
        subject = f"[Issue #{issue.id}] {result['subject']}"
        body = f"{result['body']}\n\n---\nReference: Issue #{issue.id}\nPlease keep this reference in your reply."
        
        print(f"\nSending email to {issue.vendor.email}...")
        
        # Send email
        email_message_id = email_service.send_issue_email(issue, subject, body)
        
        print(f"✓ Email sent successfully!")
        print(f"Message ID: {email_message_id}")
        print(f"Issue status updated to: {issue.status}")
        
        return True
        
    except Issue.DoesNotExist:
        print(f"ERROR: Issue {issue_id} not found")
        return False
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python send_issue_email.py <issue_id>")
        sys.exit(1)
    
    issue_id = sys.argv[1]
    success = send_email_for_issue(issue_id)
    sys.exit(0 if success else 1)
