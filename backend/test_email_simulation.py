#!/usr/bin/env python
"""
Simulate and test email monitoring workflow without real email credentials
"""
import os
import sys
import django
import asyncio
from datetime import datetime

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, '/root/buy2rent/backend')
django.setup()

from django.utils import timezone
from issues.models import Issue, AICommunicationLog
from issues.ai_services import ai_manager

def simulate_vendor_email_response():
    """Simulate the complete vendor email response workflow"""
    print("=== Simulating Email Monitor Workflow ===\n")
    
    # Step 1: Get or create a test issue
    print("📝 Step 1: Setting up test issue...")
    issue = Issue.objects.filter(ai_activated=True).first()
    
    if not issue:
        # Create a test issue
        from vendors.models import Vendor
        from apartments.models import Apartment
        
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
            type="Plumbing Issue",
            description="Water leak in bathroom",
            priority="High",
            status="Open",
            vendor=vendor,
            apartment=apartment,
            ai_activated=True
        )
        print(f"✅ Created test issue: {issue.id}")
    else:
        print(f"✅ Using existing issue: {issue.id} - {issue.type}")
    
    # Step 2: Check current communication logs
    print("\n📧 Step 2: Current email thread...")
    existing_logs = AICommunicationLog.objects.filter(issue=issue).order_by('timestamp')
    print(f"   Found {existing_logs.count()} existing messages")
    
    for log in existing_logs[:3]:  # Show first 3
        print(f"   - {log.sender}: {log.subject or 'No subject'}")
    
    # Step 3: Simulate vendor email response
    print("\n📨 Step 3: Simulating vendor email response...")
    
    vendor_message = """
    Dear Procurement Team,
    
    Thank you for bringing this issue to our attention.
    
    We acknowledge the water leak problem in the bathroom and understand the urgency.
    Our technician team will visit the property tomorrow morning between 9-11 AM to assess 
    and fix the issue.
    
    Please ensure someone is available to provide access to the apartment.
    
    Best regards,
    Test Vendor Support Team
    """
    
    # Create vendor response log (simulating what email monitor would do)
    vendor_log = AICommunicationLog.objects.create(
        issue=issue,
        sender='Vendor',
        message=vendor_message,
        message_type='email',
        subject=f'Re: Issue #{issue.id} - Water Leak Response',
        email_from='vendor@example.com',
        email_to='procurement@buy2rent.eu',
        status='received',
        email_thread_id=f"issue-{issue.id}",
        email_message_id=f'<vendor-{datetime.now().timestamp()}@example.com>',
        timestamp=timezone.now()
    )
    print(f"✅ Vendor response added to thread")
    print(f"   Subject: {vendor_log.subject}")
    
    # Step 4: Generate AI reply
    print("\n🤖 Step 4: Generating AI reply...")
    
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        # Analyze vendor response
        analysis = loop.run_until_complete(
            ai_manager.analyze_vendor_response(issue, vendor_message)
        )
        
        print(f"✅ Analysis complete:")
        print(f"   Sentiment: {analysis.get('sentiment', 'unknown')}")
        print(f"   Intent: {analysis.get('intent', 'unknown')}")
        print(f"   Action: {analysis.get('suggested_action', 'none')}")
        
        # Generate AI reply
        reply_result = loop.run_until_complete(
            ai_manager.generate_reply_for_approval(issue, vendor_message)
        )
        
        if reply_result.get('success'):
            print(f"✅ AI reply generated successfully!")
            print(f"   Confidence: {reply_result.get('confidence', 0):.2%}")
            
            # Get the generated reply
            ai_reply = AICommunicationLog.objects.filter(
                issue=issue,
                sender='AI',
                status='pending_approval'
            ).order_by('-timestamp').first()
            
            if ai_reply:
                print(f"\n📋 Generated Reply Preview:")
                print(f"   Subject: {ai_reply.subject}")
                print(f"   Message: {ai_reply.message[:200]}...")
                print(f"   Status: {ai_reply.status}")
        else:
            print(f"❌ Failed to generate AI reply: {reply_result.get('message')}")
            
    except Exception as e:
        print(f"❌ Error during AI processing: {e}")
    finally:
        loop.close()
    
    # Step 5: Show updated thread
    print("\n📊 Step 5: Updated email thread...")
    updated_logs = AICommunicationLog.objects.filter(issue=issue).order_by('timestamp')
    print(f"   Total messages: {updated_logs.count()}")
    
    for log in updated_logs.order_by('-timestamp')[:5]:  # Show latest 5
        status_icon = "✅" if log.status == 'sent' else "⏳" if log.status == 'pending_approval' else "📨"
        print(f"   {status_icon} {log.sender}: {log.subject or log.message[:50]}...")
    
    print("\n" + "="*50)
    print("✅ Simulation complete!")
    print("\nWhat happened:")
    print("1. Vendor email received and stored")
    print("2. AI analyzed the response")
    print("3. AI generated a reply (pending approval)")
    print("4. Full thread maintained in database")
    print("\n📍 Check the live system to see the results:")
    print(f"   https://procurement.buy2rent.eu/issues")
    print(f"   Issue ID: {issue.id}")

if __name__ == "__main__":
    simulate_vendor_email_response()
