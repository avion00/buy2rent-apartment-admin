#!/usr/bin/env python
"""
Test script for AI-powered issue email workflow
Tests the complete process from issue creation to email conversation
"""
import os
import sys
import django
import json
from datetime import datetime

# Setup Django environment
sys.path.insert(0, '/root/buy2rent/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from issues.models import Issue, AICommunicationLog
from apartments.models import Apartment
from vendors.models import Vendor
from products.models import Product
from issues.ai_services import ai_manager
import asyncio

User = get_user_model()

def create_test_data():
    """Create test data for the workflow"""
    print("\n1. Creating test data...")
    
    # Get or create test user
    user, _ = User.objects.get_or_create(
        username='admin',
        defaults={'email': 'admin@buy2rent.eu', 'is_staff': True, 'is_superuser': True}
    )
    
    # Get or create test apartment
    apartment = Apartment.objects.first()
    if not apartment:
        print("   No apartments found. Please create an apartment first.")
        return None, None, None, None
    
    # Get or create test vendor
    vendor = Vendor.objects.first()
    if not vendor:
        vendor = Vendor.objects.create(
            name="Test Vendor Inc.",
            email="vendor@example.com",
            phone="+1234567890",
            address="123 Test Street",
            contact_person="John Vendor"
        )
        print(f"   Created test vendor: {vendor.name}")
    else:
        print(f"   Using existing vendor: {vendor.name}")
    
    # Get or create test product
    product = Product.objects.first()
    if not product:
        product = Product.objects.create(
            product="Test Product",
            vendor=vendor,
            price=100.00,
            category="Test Category"
        )
        print(f"   Created test product: {product.product}")
    else:
        print(f"   Using existing product: {product.product}")
    
    return user, apartment, vendor, product

def test_issue_creation(apartment, vendor, product):
    """Test creating an issue"""
    print("\n2. Creating test issue...")
    
    issue = Issue.objects.create(
        apartment=apartment,
        vendor=vendor,
        product=product,
        type="Damaged Product",
        description="The product arrived with significant damage. The packaging was torn and the item inside has multiple scratches and dents. This is unacceptable for a new product.",
        priority="High",
        impact="Cannot use the product as intended. Need immediate replacement.",
        vendor_contact=vendor.email,
        auto_notify_vendor=True
    )
    
    print(f"   Created issue: {issue.id}")
    print(f"   Type: {issue.type}")
    print(f"   Priority: {issue.priority}")
    print(f"   AI Activated: {issue.ai_activated}")
    
    return issue

async def test_ai_email_generation(issue):
    """Test AI email generation for the issue"""
    from asgiref.sync import sync_to_async
    
    print("\n3. Testing AI email generation...")
    
    result = await ai_manager.start_issue_conversation(issue)
    
    if result['success']:
        print("   ✓ AI email generated successfully")
        print(f"   Subject: {result.get('email_subject', 'N/A')}")
        
        # Check the generated email in the log
        @sync_to_async
        def get_email_log():
            return AICommunicationLog.objects.filter(
                issue=issue,
                message_type='email',
                sender='AI'
            ).first()
        
        email_log = await get_email_log()
        
        if email_log:
            print(f"   Status: {email_log.status}")
            print(f"   AI Generated: {email_log.ai_generated}")
            print("\n   Email Content Preview:")
            print("   " + "-" * 50)
            print(f"   Subject: {email_log.subject}")
            print(f"   From: {email_log.email_from}")
            print(f"   To: {email_log.email_to}")
            print(f"\n   Body (first 200 chars):\n   {email_log.message[:200]}...")
            print("   " + "-" * 50)
    else:
        print(f"   ✗ Failed to generate email: {result.get('message')}")
        if result.get('error'):
            print(f"   Error: {result.get('error')}")
    
    return result['success']

async def test_vendor_response_simulation(issue):
    """Simulate a vendor response and test AI analysis"""
    from asgiref.sync import sync_to_async
    
    print("\n4. Simulating vendor response...")
    
    vendor_response = """
    Dear Customer,
    
    Thank you for bringing this issue to our attention. We sincerely apologize for the damaged product you received.
    
    We take quality control very seriously and this should not have happened. We will:
    1. Send a replacement product immediately (within 2 business days)
    2. Arrange for pickup of the damaged item at no cost to you
    3. Provide a 10% discount on your next order as compensation
    
    Please confirm your shipping address and we'll process the replacement right away.
    
    Best regards,
    John from Test Vendor Inc.
    """
    
    # Store vendor response
    @sync_to_async
    def create_vendor_log():
        return AICommunicationLog.objects.create(
            issue=issue,
            sender='Vendor',
            message=vendor_response,
            message_type='email',
            subject=f"Re: Issue Report - {issue.type}",
            email_from=issue.vendor.email,
            email_to='procurement@buy2rent.eu',
            status='received',
            email_thread_id=f"issue-{issue.id}"
        )
    
    vendor_log = await create_vendor_log()
    print("   Vendor response stored in communication log")
    
    # Analyze vendor response
    print("\n5. Testing AI analysis of vendor response...")
    analysis = await ai_manager.analyze_vendor_response(issue, vendor_response)
    
    print("   Analysis Results:")
    print(f"   - Sentiment: {analysis.get('sentiment', 'N/A')}")
    print(f"   - Intent: {analysis.get('intent', 'N/A')}")
    print(f"   - Key Commitments: {', '.join(analysis.get('key_commitments', []))}")
    print(f"   - Suggested Action: {analysis.get('suggested_action', 'N/A')}")
    print(f"   - Escalation Recommended: {analysis.get('escalation_recommended', False)}")
    
    return vendor_log

async def test_ai_reply_generation(issue, vendor_message):
    """Test AI reply generation for approval"""
    from asgiref.sync import sync_to_async
    
    print("\n6. Testing AI reply generation for approval...")
    
    result = await ai_manager.generate_reply_for_approval(issue, vendor_message.message)
    
    if result.get('success'):
        print("   ✓ AI reply generated successfully")
        print(f"   Message ID: {result.get('message_id')}")
        print(f"   Confidence: {result.get('confidence', 'N/A')}")
        
        # Get the draft message
        @sync_to_async
        def get_draft():
            return AICommunicationLog.objects.filter(
                id=result.get('message_id')
            ).first()
        
        draft = await get_draft()
        
        if draft:
            print(f"   Status: {draft.status}")
            print(f"   Requires Approval: {draft.requires_approval}")
            print("\n   Draft Reply Preview:")
            print("   " + "-" * 50)
            print(f"   {draft.message[:300]}...")
            print("   " + "-" * 50)
            return draft
    else:
        print(f"   ✗ Failed to generate reply: {result.get('error', 'Unknown error')}")
    
    return None

def test_approval_workflow(draft_message, user):
    """Test the approval workflow"""
    print("\n7. Testing approval workflow...")
    
    if not draft_message:
        print("   No draft message to approve")
        return
    
    # Simulate approval
    draft_message.approved_by = user
    draft_message.approved_at = datetime.now()
    draft_message.status = 'sent'  # In production, this would trigger actual email sending
    draft_message.save()
    
    print(f"   ✓ Message approved by: {user.username}")
    print(f"   Status changed to: {draft_message.status}")

def check_email_thread(issue):
    """Check the complete email thread"""
    print("\n8. Checking complete email thread...")
    
    emails = AICommunicationLog.objects.filter(
        issue=issue,
        message_type='email'
    ).order_by('timestamp')
    
    print(f"   Total emails in thread: {emails.count()}")
    print("\n   Email Thread Timeline:")
    print("   " + "-" * 60)
    
    for idx, email in enumerate(emails, 1):
        print(f"   {idx}. {email.sender:10} | {email.status:15} | {email.subject[:30]}")
        if email.ai_generated:
            print(f"      AI Generated (Model: {email.ai_model}, Confidence: {email.ai_confidence})")
        if email.approved_by:
            print(f"      Approved by: {email.approved_by.username}")
    
    print("   " + "-" * 60)

def main():
    """Main test function"""
    print("=" * 70)
    print("AI EMAIL WORKFLOW TEST")
    print("=" * 70)
    
    # Create test data
    user, apartment, vendor, product = create_test_data()
    if not all([user, apartment, vendor, product]):
        print("\nTest aborted: Could not create test data")
        return
    
    # Create test issue
    issue = test_issue_creation(apartment, vendor, product)
    
    # Run async tests
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        # Test AI email generation
        success = loop.run_until_complete(test_ai_email_generation(issue))
        
        if success:
            # Simulate vendor response
            vendor_response = loop.run_until_complete(test_vendor_response_simulation(issue))
            
            # Generate AI reply
            draft = loop.run_until_complete(test_ai_reply_generation(issue, vendor_response))
            
            # Test approval
            if draft:
                test_approval_workflow(draft, user)
        
        # Check complete thread
        check_email_thread(issue)
        
        # Update issue status
        issue.refresh_from_db()
        print(f"\n9. Final Issue Status:")
        print(f"   Status: {issue.status}")
        print(f"   AI Activated: {issue.ai_activated}")
        
    finally:
        loop.close()
    
    print("\n" + "=" * 70)
    print("TEST COMPLETED")
    print("=" * 70)

if __name__ == "__main__":
    main()
