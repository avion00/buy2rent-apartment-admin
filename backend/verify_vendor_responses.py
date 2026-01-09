#!/usr/bin/env python
"""
Manually verify vendor response system
"""
import os
import sys
import django
import json
from datetime import datetime, timedelta

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, '/root/buy2rent/backend')
django.setup()

from django.utils import timezone
from issues.models import Issue, AICommunicationLog
from django.db.models import Q

def check_vendor_responses():
    """Check all vendor responses in the system"""
    print("=== Verifying Vendor Response System ===\n")
    
    # 1. Check all communication logs
    print("📊 Step 1: Database Check")
    print("-" * 40)
    
    all_logs = AICommunicationLog.objects.all().order_by('-timestamp')
    print(f"Total communication logs: {all_logs.count()}")
    
    vendor_logs = all_logs.filter(sender='Vendor')
    print(f"Vendor responses: {vendor_logs.count()}")
    
    ai_logs = all_logs.filter(sender='AI')
    print(f"AI messages: {ai_logs.count()}")
    
    admin_logs = all_logs.filter(sender='Admin')
    print(f"Admin messages: {admin_logs.count()}")
    
    # 2. Show recent vendor responses
    print("\n📧 Step 2: Recent Vendor Responses")
    print("-" * 40)
    
    if vendor_logs.exists():
        for log in vendor_logs[:5]:
            print(f"\nVendor Response ID: {log.id}")
            print(f"Issue: {log.issue.id} - {log.issue.type}")
            print(f"Subject: {log.subject or 'No subject'}")
            print(f"Message: {log.message[:100]}...")
            print(f"Status: {log.status}")
            print(f"Timestamp: {log.timestamp}")
            print(f"Email Thread ID: {log.email_thread_id}")
    else:
        print("No vendor responses found in database")
    
    # 3. Check issues with email threads
    print("\n🔍 Step 3: Issues with Email Threads")
    print("-" * 40)
    
    issues_with_threads = Issue.objects.filter(
        ai_communication_log__isnull=False
    ).distinct()
    
    print(f"Issues with communication: {issues_with_threads.count()}")
    
    for issue in issues_with_threads[:3]:
        thread = AICommunicationLog.objects.filter(issue=issue).order_by('timestamp')
        print(f"\nIssue {issue.id}:")
        print(f"  Type: {issue.type}")
        print(f"  AI Activated: {issue.ai_activated}")
        print(f"  Thread messages: {thread.count()}")
        
        for msg in thread:
            icon = "📨" if msg.sender == "Vendor" else "🤖" if msg.sender == "AI" else "👤"
            print(f"    {icon} {msg.sender}: {msg.subject or msg.message[:50]}...")
    
    # 4. Test API endpoint
    print("\n🌐 Step 4: Testing API Endpoints")
    print("-" * 40)
    
    # Get a test issue
    test_issue = issues_with_threads.first()
    if test_issue:
        print(f"Testing with issue: {test_issue.id}")
        
        # Import requests to test API
        import requests
        
        # Test email_thread endpoint
        try:
            # Get auth token if available
            token = None
            try:
                with open('/root/.jwt_token', 'r') as f:
                    token = f.read().strip()
            except:
                pass
            
            headers = {}
            if token:
                headers['Authorization'] = f'Bearer {token}'
            
            # Test the endpoint
            response = requests.get(
                f'http://localhost:8000/api/issues/{test_issue.id}/email_thread/',
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ API endpoint working")
                print(f"   Emails returned: {len(data.get('emails', []))}")
                print(f"   AI activated: {data.get('ai_activated', False)}")
                
                # Show email details
                for email in data.get('emails', [])[:3]:
                    print(f"\n   Email ID: {email.get('id')}")
                    print(f"   Sender: {email.get('sender')}")
                    print(f"   Subject: {email.get('subject', 'No subject')}")
                    print(f"   Status: {email.get('status')}")
            else:
                print(f"❌ API endpoint error: {response.status_code}")
                print(f"   Response: {response.text[:200]}")
        except Exception as e:
            print(f"❌ API test failed: {e}")
    else:
        print("No issues available for API testing")
    
    # 5. Check frontend configuration
    print("\n🖥️ Step 5: Frontend Configuration")
    print("-" * 40)
    
    # Check if frontend is calling correct endpoints
    frontend_file = '/root/buy2rent/frontend/src/components/AIEmailThreadEnhanced.tsx'
    if os.path.exists(frontend_file):
        with open(frontend_file, 'r') as f:
            content = f.read()
            
        if '/email_thread/' in content:
            print("✅ Frontend using email_thread endpoint")
        else:
            print("❌ Frontend not using email_thread endpoint")
            
        if 'sender === "Vendor"' in content or 'sender === \'Vendor\'' in content:
            print("✅ Frontend checking for Vendor messages")
        else:
            print("⚠️ Frontend may not be displaying Vendor messages correctly")
    
    # 6. Summary and recommendations
    print("\n📋 Summary")
    print("-" * 40)
    
    if vendor_logs.exists():
        print(f"✅ Found {vendor_logs.count()} vendor responses in database")
        print("\nPossible issues:")
        print("1. Frontend not fetching/displaying vendor responses")
        print("2. API endpoint not returning vendor messages")
        print("3. Frontend filtering out vendor messages")
    else:
        print("❌ No vendor responses in database")
        print("\nTo add vendor response:")
        print("1. Use 'Add Vendor Response' tab in UI")
        print("2. Or run: python manage.py monitor_vendor_emails")
        print("3. Or manually add via Django admin")
    
    return vendor_logs.exists()

if __name__ == "__main__":
    has_vendor_responses = check_vendor_responses()
    
    if not has_vendor_responses:
        print("\n🔧 Creating test vendor response...")
        
        # Create a test vendor response
        issue = Issue.objects.filter(ai_activated=True).first()
        if issue:
            test_response = AICommunicationLog.objects.create(
                issue=issue,
                sender='Vendor',
                message='This is a test vendor response to verify the system is working.',
                message_type='email',
                subject=f'Re: Issue #{issue.id}',
                email_from='vendor@example.com',
                email_to='procurement@buy2rent.eu',
                status='received',
                email_thread_id=f"issue-{issue.id}",
                timestamp=timezone.now()
            )
            print(f"✅ Created test vendor response for issue {issue.id}")
            print("   Please refresh the UI to see it")
