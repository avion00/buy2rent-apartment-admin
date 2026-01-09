#!/usr/bin/env python
"""
Test email generation with real vendor and sender names
"""
import os
import sys
import django
import asyncio

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, '/root/buy2rent/backend')
django.setup()

from issues.models import Issue, AICommunicationLog
from issues.ai_services import ai_manager

async def test_email_with_names():
    print("=== Testing Email Generation with Real Names ===\n")
    
    # Get an issue with a vendor
    issue = Issue.objects.filter(vendor__isnull=False).first()
    
    if not issue:
        print("❌ No issues with vendors found")
        return
    
    print(f"📋 Issue Details:")
    print(f"   ID: {issue.id}")
    print(f"   Type: {issue.type}")
    print(f"   Vendor: {issue.vendor.name if issue.vendor else 'No vendor'}")
    
    # Generate a new email with real names
    print(f"\n🤖 Generating email with real names...")
    result = await ai_manager.start_issue_conversation(issue)
    
    if result.get('success'):
        print("✅ Email generated successfully")
        
        # Get the latest AI message
        latest_ai = AICommunicationLog.objects.filter(
            issue=issue,
            sender='AI'
        ).order_by('-timestamp').first()
        
        if latest_ai:
            print(f"\n📧 Generated Email:")
            print(f"   Subject: {latest_ai.subject}")
            print(f"\n   Body Preview:")
            print("-" * 50)
            print(latest_ai.message[:500])
            print("-" * 50)
            
            # Check for vendor name
            vendor_name = issue.vendor.name if issue.vendor else "Vendor"
            if vendor_name in latest_ai.message:
                print(f"\n✅ Vendor name '{vendor_name}' found in email")
            else:
                print(f"\n⚠️ Vendor name '{vendor_name}' NOT found in email")
            
            # Check for sender name
            if "Procurement Team" in latest_ai.message:
                print("✅ Sender name 'Procurement Team' found in email")
            else:
                print("⚠️ Sender name NOT found in email")
    else:
        print(f"❌ Failed to generate email: {result.get('message')}")

if __name__ == "__main__":
    asyncio.run(test_email_with_names())
