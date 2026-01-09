#!/usr/bin/env python
"""
Test adding vendor responses and generating AI replies
"""
import os
import sys
import django
import requests
import json

# Setup Django environment
sys.path.insert(0, '/root/buy2rent/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
os.environ['OPENAI_API_KEY'] = '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'
django.setup()

from issues.models import Issue, AICommunicationLog
from django.utils import timezone
from issues.ai_services import ai_manager
import asyncio

def find_recent_issue_with_ai_email():
    """Find a recent issue that has AI email sent"""
    # Get issues with AI activated
    issues = Issue.objects.filter(ai_activated=True).order_by('-created_at')[:5]
    
    for issue in issues:
        # Check if issue has sent emails
        emails = AICommunicationLog.objects.filter(
            issue=issue,
            message_type='email',
            sender='AI',
            status='sent'
        ).exists()
        
        if emails:
            return issue
    
    return None

def add_vendor_response(issue_id, response_text):
    """Add a vendor response to an issue"""
    try:
        issue = Issue.objects.get(id=issue_id)
    except Issue.DoesNotExist:
        print(f"Issue {issue_id} not found")
        return None
    
    # Create vendor response
    vendor_log = AICommunicationLog.objects.create(
        issue=issue,
        sender='Vendor',
        message=response_text,
        message_type='email',
        subject=f"Re: Issue #{issue.id}",
        email_from=issue.vendor.email if issue.vendor else 'vendor@example.com',
        email_to='procurement@buy2rent.eu',
        status='received',
        email_thread_id=f"issue-{issue.id}",
        timestamp=timezone.now()
    )
    
    print(f"✓ Vendor response added to issue {issue.id}")
    return vendor_log

async def generate_ai_reply(issue, vendor_message):
    """Generate AI reply for vendor message"""
    # Analyze response
    analysis = await ai_manager.analyze_vendor_response(issue, vendor_message)
    print("\n📊 Analysis Results:")
    print(f"  Sentiment: {analysis.get('sentiment')}")
    print(f"  Intent: {analysis.get('intent')}")
    print(f"  Action: {analysis.get('suggested_action')}")
    
    # Generate reply
    reply_result = await ai_manager.generate_reply_for_approval(issue, vendor_message)
    
    if reply_result.get('success'):
        print(f"\n✉️ AI Reply Generated:")
        print(f"  Message ID: {reply_result.get('message_id')}")
        print(f"  Confidence: {reply_result.get('confidence')}")
        print("\n  Reply Preview:")
        print("-" * 60)
        print(reply_result.get('reply', '')[:500])
        print("-" * 60)
        return reply_result.get('message_id')
    else:
        print(f"Failed to generate reply: {reply_result.get('error')}")
        return None

def display_email_thread(issue):
    """Display the complete email thread"""
    emails = AICommunicationLog.objects.filter(
        issue=issue,
        message_type='email'
    ).order_by('timestamp')
    
    print(f"\n📧 Email Thread for Issue {issue.id}:")
    print("=" * 70)
    
    for idx, email in enumerate(emails, 1):
        print(f"\n{idx}. {email.sender} - {email.timestamp.strftime('%Y-%m-%d %H:%M')}")
        print(f"   Subject: {email.subject}")
        print(f"   Status: {email.status}")
        if email.ai_generated:
            print(f"   [AI Generated - Confidence: {email.ai_confidence}]")
        if email.approved_by:
            print(f"   [Approved by: {email.approved_by.username}]")
        print(f"\n   Message:")
        print("   " + "-" * 50)
        print(f"   {email.message[:300]}...")
        print("   " + "-" * 50)

def test_api_endpoint(issue_id):
    """Test the API endpoint for adding vendor responses"""
    print("\n🔌 Testing API Endpoint...")
    
    vendor_response = """
    Thank you for your email regarding the quality issues.
    
    We have reviewed your concerns and would like to propose the following:
    1. We will send a replacement product within 2 business days
    2. Our quality team will inspect the defective item
    3. We'll provide a 20% discount on your next order
    
    Please confirm if this resolution is acceptable.
    
    Best regards,
    Vendor Support Team
    """
    
    # Call API endpoint
    url = f"http://127.0.0.1:8000/api/issues/{issue_id}/add_vendor_response/"
    
    response = requests.post(url, json={
        'message': vendor_response,
        'subject': 'Re: Quality Issue Resolution',
        'from_email': 'vendor@example.com'
    })
    
    if response.status_code == 200:
        data = response.json()
        print("✓ API Response received")
        print(f"  Vendor Response ID: {data.get('vendor_response_id')}")
        print(f"  Analysis: {data.get('analysis', {}).get('sentiment')}")
        if data.get('ai_reply', {}).get('success'):
            print(f"  AI Reply ID: {data.get('ai_reply', {}).get('message_id')}")
        return True
    else:
        print(f"✗ API Error: {response.status_code}")
        print(response.text)
        return False

def main():
    print("=" * 70)
    print(" VENDOR RESPONSE TEST")
    print("=" * 70)
    
    # Find a recent issue with AI email
    issue = find_recent_issue_with_ai_email()
    
    if not issue:
        print("No issues found with AI emails. Creating a test issue...")
        # You would create a test issue here
        return
    
    print(f"\n📋 Using Issue: {issue.id}")
    print(f"  Type: {issue.type}")
    print(f"  Vendor: {issue.vendor.name if issue.vendor else 'N/A'}")
    
    # Test 1: Add vendor response directly
    vendor_message = """
    Dear Procurement Team,
    
    Thank you for bringing this matter to our attention.
    
    We sincerely apologize for the inconvenience caused. After reviewing your complaint,
    we would like to offer the following resolution:
    
    1. Immediate replacement of the defective product (shipping within 24 hours)
    2. Full quality inspection of our current inventory
    3. 25% discount on your next purchase as compensation
    4. Dedicated support contact for future orders
    
    Please let us know if this resolution meets your requirements.
    
    Best regards,
    Customer Service Team
    """
    
    print("\n1️⃣ Adding vendor response directly...")
    vendor_log = add_vendor_response(issue.id, vendor_message)
    
    if vendor_log:
        # Generate AI reply
        print("\n2️⃣ Generating AI reply...")
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            message_id = loop.run_until_complete(
                generate_ai_reply(issue, vendor_message)
            )
            
            if message_id:
                print(f"\n✅ AI Reply ready for approval")
                print(f"   View at: /api/ai-communication-logs/{message_id}/")
        finally:
            loop.close()
    
    # Display complete thread
    display_email_thread(issue)
    
    # Test API endpoint with a different issue if available
    issues = Issue.objects.filter(ai_activated=True).exclude(id=issue.id).first()
    if issues:
        print("\n" + "=" * 70)
        print(" TESTING API ENDPOINT")
        print("=" * 70)
        test_api_endpoint(issues.id)

if __name__ == "__main__":
    main()
