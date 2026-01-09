#!/usr/bin/env python
import os
import sys
import django
import asyncio
from asgiref.sync import sync_to_async

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, '/root/buy2rent/backend')
django.setup()

from issues.models import Issue, AICommunicationLog
from vendors.models import Vendor
from apartments.models import Apartment
from accounts.models import User
from issues.ai_services import ai_manager

def setup_test_data():
    """Synchronous function to setup test data"""
    vendor = Vendor.objects.first()
    if not vendor:
        print("❌ No vendors found. Creating test vendor...")
        vendor = Vendor.objects.create(
            name="Test Vendor Co.",
            email="vendor@example.com",
            phone="+1234567890",
            address="123 Test St"
        )
        print(f"✅ Created vendor: {vendor.name}")
    else:
        print(f"✅ Using existing vendor: {vendor.name} ({vendor.email})")
    
    apartment = Apartment.objects.first()
    if not apartment:
        print("Creating test apartment...")
        apartment = Apartment.objects.create(
            name="Test Apartment 101",
            address="456 Test Ave"
        )
    
    # Create a test issue
    print("\n📝 Creating test issue...")
    issue = Issue.objects.create(
        type="Plumbing Issue",
        description="Water leak in bathroom sink. Urgent repair needed.",
        priority="High",
        status="Open",
        vendor=vendor,
        apartment=apartment,
        impact="Cannot use bathroom sink"
    )
    print(f"✅ Created issue: {issue.id} - {issue.type}")
    return issue

async def test_ai_email():
    print("=== Testing AI Email Functionality ===\n")
    
    # Get or create test data (using sync_to_async)
    try:
        issue = await sync_to_async(setup_test_data)()
        
        # Test AI email activation
        print("\n🤖 Activating AI email...")
        result = await ai_manager.start_issue_conversation(issue)
        
        if result['success']:
            print(f"✅ AI email activated successfully!")
            print(f"   Subject: {result.get('email_subject', 'N/A')}")
            
            # Check communication logs (using sync_to_async)
            @sync_to_async
            def check_logs():
                logs = AICommunicationLog.objects.filter(issue=issue)
                print(f"\n📧 Communication logs created: {logs.count()}")
                
                for log in logs:
                    print(f"   - {log.sender}: {log.subject[:50] if log.subject else 'No subject'}...")
                    print(f"     Status: {log.status}")
                    print(f"     AI Generated: {log.ai_generated}")
                    if log.ai_confidence:
                        print(f"     Confidence: {log.ai_confidence:.2%}")
                
                # Check issue status
                issue.refresh_from_db()
                print(f"\n📊 Issue status:")
                print(f"   AI Activated: {issue.ai_activated}")
                print(f"   Status: {issue.status}")
            
            await check_logs()
            
            return True
        else:
            print(f"❌ Failed to activate AI email:")
            print(f"   Message: {result.get('message')}")
            print(f"   Error: {result.get('error')}")
            return False
            
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False

# Run the test
if __name__ == "__main__":
    success = asyncio.run(test_ai_email())
    print(f"\n{'='*40}")
    if success:
        print("✅ AI Email Test PASSED")
    else:
        print("❌ AI Email Test FAILED")
    sys.exit(0 if success else 1)
