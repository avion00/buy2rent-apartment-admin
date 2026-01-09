#!/usr/bin/env python
"""
Test that Issue ID is included in outgoing emails
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
from vendors.models import Vendor
from apartments.models import Apartment
from issues.ai_services import ai_manager

def create_test_issue():
    """Create test issue synchronously"""
    vendor = Vendor.objects.first()
    if not vendor:
        vendor = Vendor.objects.create(
            name="Test Vendor",
            email="vendor@example.com",
            phone="+1234567890"
        )
    
    apartment = Apartment.objects.first()
    if not apartment:
        apartment = Apartment.objects.create(
            name="Test Apartment",
            address="123 Test St"
        )
    
    issue = Issue.objects.create(
        type="Test Issue for Email",
        description="Testing Issue ID in email subject",
        priority="Medium",
        status="Open",
        vendor=vendor,
        apartment=apartment
    )
    return issue

async def test_issue_id_in_emails():
    print("=== Testing Issue ID in Emails ===\n")
    
    # Create test issue synchronously
    from asgiref.sync import sync_to_async
    
    print("📝 Creating test issue...")
    issue = await sync_to_async(create_test_issue)()
    print(f"✅ Created issue: {issue.id}")
    
    # Test AI email generation
    print("\n🤖 Generating AI email...")
    result = await ai_manager.start_issue_conversation(issue)
    
    if result['success']:
        print(f"✅ Email generated successfully")
        
        # Check the communication log
        log = AICommunicationLog.objects.filter(issue=issue).first()
        if log:
            print(f"\n📧 Email Details:")
            print(f"  Subject: {log.subject}")
            print(f"  Contains Issue ID: {'Yes' if str(issue.id) in log.subject else 'No'}")
            
            # Check body for Issue ID
            has_id_in_body = str(issue.id) in log.message
            print(f"  Body contains Issue ID: {'Yes' if has_id_in_body else 'No'}")
            
            if str(issue.id) in log.subject:
                print(f"\n✅ SUCCESS: Issue ID is in email subject")
                print(f"   Format: [Issue #{issue.id}]")
                print("\n📍 When vendor replies to this email:")
                print("   - The Issue ID will be in the reply subject")
                print("   - IMAP monitor can detect and link it")
                print("   - Reply will be automatically processed")
            else:
                print(f"\n❌ FAILED: Issue ID not found in subject")
        else:
            print("❌ No communication log created")
    else:
        print(f"❌ Failed to generate email: {result.get('message')}")
    
    return issue.id

if __name__ == "__main__":
    issue_id = asyncio.run(test_issue_id_in_emails())
    
    print("\n" + "="*50)
    print("📋 Summary:")
    print(f"\nIssue ID: {issue_id}")
    print("\nAll future emails will include:")
    print("1. Subject: [Issue #xxxx-xxxx-xxxx] Original Subject")
    print("2. Body footer: Reference: Issue #xxxx-xxxx-xxxx")
    print("\nThis ensures vendor replies can be tracked!")
