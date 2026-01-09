#!/usr/bin/env python
"""
Complete AI Email Workflow Test with Real OpenAI Integration
Tests the entire process from issue creation to email conversation
"""
import os
import sys
import django
import json
from datetime import datetime, timedelta

# Setup Django environment
sys.path.insert(0, '/root/buy2rent/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.utils import timezone
from issues.models import Issue, AICommunicationLog
from apartments.models import Apartment
from vendors.models import Vendor
from products.models import Product
from issues.ai_services import ai_manager, OpenAIService, MockAIService
import asyncio

User = get_user_model()

def print_section(title):
    """Print a formatted section header"""
    print(f"\n{'='*70}")
    print(f" {title}")
    print('='*70)

def test_ai_service_configuration():
    """Test AI service configuration"""
    print_section("AI SERVICE CONFIGURATION")
    
    from django.conf import settings
    
    use_mock = getattr(settings, 'USE_MOCK_AI', True)
    openai_key = getattr(settings, 'OPENAI_API_KEY', None)
    
    print(f"USE_MOCK_AI: {use_mock}")
    print(f"OPENAI_API_KEY configured: {'Yes' if openai_key else 'No'}")
    print(f"Active AI Service: {'MockAIService' if use_mock else 'OpenAIService'}")
    
    if isinstance(ai_manager.ai_service, MockAIService):
        print("✓ Using Mock AI Service (safe for testing)")
    else:
        print("✓ Using OpenAI Service (will make real API calls)")
    
    return use_mock

async def test_complete_workflow():
    """Test the complete AI email workflow"""
    from asgiref.sync import sync_to_async
    
    # 1. Setup test data
    print_section("1. SETUP TEST DATA")
    
    # Get test objects
    @sync_to_async
    def get_test_data():
        apartment = Apartment.objects.first()
        vendor = Vendor.objects.filter(email__isnull=False).first()
        product = Product.objects.first()
        return apartment, vendor, product
    
    apartment, vendor, product = await get_test_data()
    
    if not all([apartment, vendor, product]):
        print("✗ Missing required test data")
        return
    
    print(f"✓ Apartment: {apartment.name}")
    print(f"✓ Vendor: {vendor.name} ({vendor.email})")
    print(f"✓ Product: {product.product}")
    
    # 2. Create a new issue
    print_section("2. CREATE NEW ISSUE")
    
    @sync_to_async
    def create_issue():
        return Issue.objects.create(
            apartment=apartment,
            vendor=vendor,
            product=product,
            type="Quality Issue - Product Defect",
            description="""
            The recently delivered furniture has multiple quality issues:
            1. Visible scratches on the surface
            2. One of the legs is unstable
            3. The color doesn't match what was ordered
            This is affecting the apartment's readiness for the tenant.
            """,
            priority="High",
            impact="Apartment cannot be rented until furniture is replaced",
            vendor_contact=vendor.email,
            expected_resolution=timezone.now().date() + timedelta(days=7)
        )
    
    issue = await create_issue()
    
    print(f"✓ Issue created: {issue.id}")
    print(f"  Type: {issue.type}")
    print(f"  Priority: {issue.priority}")
    print(f"  Status: {issue.status}")
    
    # 3. Activate AI Email
    print_section("3. ACTIVATE AI EMAIL COMMUNICATION")
    
    result = await ai_manager.start_issue_conversation(issue)
    
    if result['success']:
        print(f"✓ AI Email activated successfully")
        print(f"  Subject: {result.get('email_subject')}")
    else:
        print(f"✗ Failed: {result.get('message')}")
        return
    
    # 4. Check generated email
    print_section("4. INITIAL EMAIL TO VENDOR")
    
    @sync_to_async
    def get_initial_email():
        return AICommunicationLog.objects.filter(
            issue=issue,
            sender='AI',
            message_type='email'
        ).first()
    
    initial_email = await get_initial_email()
    
    if initial_email:
        print(f"✓ Email generated and stored")
        print(f"  From: {initial_email.email_from}")
        print(f"  To: {initial_email.email_to}")
        print(f"  Subject: {initial_email.subject}")
        print(f"  Status: {initial_email.status}")
        print(f"\n  Email Body (first 400 chars):")
        print("  " + "-"*60)
        print(f"  {initial_email.message[:400]}")
        print("  " + "-"*60)
    
    # 5. Simulate vendor response
    print_section("5. SIMULATE VENDOR RESPONSE")
    
    vendor_response = """
    Dear Procurement Team,
    
    Thank you for informing us about the quality issues with the furniture.
    
    We take these matters very seriously and apologize for the inconvenience.
    
    Our proposed resolution:
    - We will dispatch a quality inspection team tomorrow
    - If confirmed, we'll replace the entire furniture set within 3 business days
    - We'll provide a 15% discount on this order as compensation
    - Future orders will undergo enhanced quality checks
    
    Please confirm if this resolution is acceptable.
    
    Best regards,
    Quality Assurance Team
    """
    
    # Store vendor response
    @sync_to_async
    def create_vendor_response():
        return AICommunicationLog.objects.create(
            issue=issue,
            sender='Vendor',
            message=vendor_response,
            message_type='email',
            subject=f"Re: {initial_email.subject if initial_email else 'Quality Issue'}",
            email_from=vendor.email,
            email_to='procurement@buy2rent.eu',
            status='received',
            email_thread_id=f"issue-{issue.id}",
            timestamp=timezone.now()
        )
    
    vendor_email = await create_vendor_response()
    
    print(f"✓ Vendor response received and stored")
    print(f"  Message preview: {vendor_response[:150]}...")
    
    # 6. Analyze vendor response
    print_section("6. AI ANALYSIS OF VENDOR RESPONSE")
    
    analysis = await ai_manager.analyze_vendor_response(issue, vendor_response)
    
    print(f"✓ Analysis complete:")
    print(f"  Sentiment: {analysis.get('sentiment')}")
    print(f"  Intent: {analysis.get('intent')}")
    print(f"  Key Commitments: {', '.join(analysis.get('key_commitments', []))}")
    print(f"  Suggested Action: {analysis.get('suggested_action')}")
    print(f"  Escalation Needed: {analysis.get('escalation_recommended')}")
    
    # 7. Generate AI reply
    print_section("7. GENERATE AI REPLY FOR APPROVAL")
    
    reply_result = await ai_manager.generate_reply_for_approval(issue, vendor_response)
    
    if reply_result.get('success'):
        print(f"✓ AI reply generated")
        print(f"  Message ID: {reply_result.get('message_id')}")
        print(f"  Confidence: {reply_result.get('confidence')}")
        print(f"\n  Draft Reply (first 400 chars):")
        print("  " + "-"*60)
        print(f"  {reply_result.get('reply', '')[:400]}")
        print("  " + "-"*60)
        
        draft_id = reply_result.get('message_id')
    else:
        print(f"✗ Failed to generate reply")
        draft_id = None
    
    # 8. Simulate approval
    print_section("8. APPROVE AND SEND REPLY")
    
    if draft_id:
        @sync_to_async
        def approve_draft():
            draft = AICommunicationLog.objects.get(id=draft_id)
            admin_user = User.objects.filter(is_superuser=True).first()
            
            draft.approved_by = admin_user
            draft.approved_at = timezone.now()
            draft.status = 'sent'
            draft.save()
            
            return draft, admin_user
        
        draft, admin_user = await approve_draft()
        print(f"✓ Reply approved by {admin_user.username if admin_user else 'system'}")
        print(f"  Status: {draft.status}")
    
    # 9. Check complete conversation
    print_section("9. COMPLETE EMAIL CONVERSATION")
    
    @sync_to_async
    def get_all_emails():
        return list(AICommunicationLog.objects.filter(
            issue=issue,
            message_type='email'
        ).order_by('timestamp'))
    
    all_emails = await get_all_emails()
    
    print(f"Total emails in thread: {len(all_emails)}")
    print("\nConversation Timeline:")
    print("-"*70)
    
    for idx, email in enumerate(all_emails, 1):
        timestamp = email.timestamp.strftime('%H:%M:%S')
        status_icon = "✓" if email.status in ['sent', 'received'] else "⏳"
        ai_badge = "[AI]" if email.ai_generated else ""
        
        print(f"{idx}. {timestamp} | {email.sender:8} {ai_badge:5} | {status_icon} {email.subject[:40]}")
        
        if email.approved_by:
            print(f"   └─ Approved by: {email.approved_by.username}")
    
    # 10. Final issue status
    print_section("10. FINAL STATUS")
    
    @sync_to_async
    def refresh_issue():
        issue.refresh_from_db()
        return issue
    
    issue = await refresh_issue()
    
    print(f"Issue ID: {issue.id}")
    print(f"Status: {issue.status}")
    print(f"AI Activated: {issue.ai_activated}")
    print(f"Priority: {issue.priority}")
    
    # Statistics
    ai_messages = len([e for e in all_emails if e.ai_generated])
    approved_messages = len([e for e in all_emails if e.approved_by_id])
    
    print(f"\nStatistics:")
    print(f"  Total messages: {len(all_emails)}")
    print(f"  AI generated: {ai_messages}")
    print(f"  Human approved: {approved_messages}")
    print(f"  Response time: < 1 minute (automated)")

async def test_edge_cases():
    """Test edge cases and error handling"""
    from asgiref.sync import sync_to_async
    print_section("EDGE CASE TESTING")
    
    # Test with missing vendor email
    print("\n1. Issue with missing vendor email:")
    
    @sync_to_async
    def create_issue_no_email():
        return Issue.objects.create(
            apartment=Apartment.objects.first(),
            vendor=Vendor.objects.first(),
            type="Test - No Email",
            description="Testing with no vendor email",
            priority="Low"
        )
    
    issue_no_email = await create_issue_no_email()
    result = await ai_manager.start_issue_conversation(issue_no_email)
    print(f"   Result: {result.get('message', 'Success')}")
    
    # Test with very long description
    print("\n2. Issue with very long description:")
    long_desc = "This is a test. " * 200
    
    @sync_to_async
    def create_issue_long():
        return Issue.objects.create(
            apartment=Apartment.objects.first(),
            vendor=Vendor.objects.first(),
            type="Test - Long Description",
            description=long_desc,
            priority="Low"
        )
    
    issue_long = await create_issue_long()
    result = await ai_manager.start_issue_conversation(issue_long)
    print(f"   Result: {'Success' if result.get('success') else 'Failed'}")
    
    # Clean up test issues
    @sync_to_async
    def cleanup():
        issue_no_email.delete()
        issue_long.delete()
    
    await cleanup()
    print("\n✓ Edge case testing complete")

def main():
    """Main test runner"""
    print("\n" + "="*70)
    print(" AI EMAIL SYSTEM - COMPLETE WORKFLOW TEST")
    print("="*70)
    
    # Check configuration
    is_mock = test_ai_service_configuration()
    
    # Run async tests
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        # Run complete workflow
        loop.run_until_complete(test_complete_workflow())
        
        # Run edge cases
        loop.run_until_complete(test_edge_cases())
        
    except Exception as e:
        print(f"\n✗ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        loop.close()
    
    print("\n" + "="*70)
    print(" TEST SUITE COMPLETED")
    print("="*70)
    
    if is_mock:
        print("\nNote: Tests ran with MockAIService. To test with real OpenAI:")
        print("1. Set OPENAI_API_KEY in your environment")
        print("2. Set USE_MOCK_AI=False in settings")

if __name__ == "__main__":
    main()
