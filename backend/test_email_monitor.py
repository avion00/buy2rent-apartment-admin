#!/usr/bin/env python
"""
Test IMAP email monitor functionality
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, '/root/buy2rent/backend')
django.setup()

from django.conf import settings
import imaplib
import email
from issues.email_monitor import EmailMonitor
from issues.models import Issue, AICommunicationLog

def test_imap_connection():
    """Test IMAP connection with debug output"""
    print("=== Testing IMAP Email Monitor ===\n")
    
    # Check configuration
    print("📧 Email Configuration:")
    print(f"   IMAP Host: {settings.IMAP_HOST}")
    print(f"   IMAP Port: {settings.IMAP_PORT}")
    print(f"   Email User: {settings.EMAIL_HOST_USER or 'NOT SET'}")
    print(f"   Password: {'SET' if settings.EMAIL_HOST_PASSWORD else 'NOT SET'}")
    
    if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
        print("\n❌ Email credentials not configured!")
        print("   Add to .env file:")
        print("   EMAIL_HOST_USER=your-email@gmail.com")
        print("   EMAIL_HOST_PASSWORD=your-app-password")
        return False
    
    print("\n🔌 Testing IMAP connection...")
    
    try:
        # Direct IMAP test
        imap = imaplib.IMAP4_SSL(settings.IMAP_HOST, settings.IMAP_PORT)
        imap.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
        print("✅ IMAP connection successful!")
        
        # Check inbox
        imap.select('INBOX')
        status, messages = imap.search(None, 'ALL')
        email_count = len(messages[0].split()) if messages[0] else 0
        print(f"📬 Found {email_count} emails in inbox")
        
        imap.close()
        imap.logout()
        
        return True
        
    except Exception as e:
        print(f"❌ IMAP connection failed: {e}")
        return False

def test_email_monitor():
    """Test the email monitor service"""
    print("\n🤖 Testing Email Monitor Service...")
    
    monitor = EmailMonitor()
    
    # Test connection
    if monitor.connect():
        print("✅ Monitor connected successfully")
        
        # Test fetching emails
        emails = monitor.fetch_unread_emails()
        print(f"📨 Found {len(emails)} unread emails")
        
        for email_data in emails:
            print(f"\n   Email: {email_data['subject']}")
            print(f"   From: {email_data['from']}")
            
            # Test issue ID extraction
            issue_id = monitor.extract_issue_id_from_email(
                email_data['subject'],
                email_data['body']
            )
            
            if issue_id:
                print(f"   ✅ Found Issue ID: {issue_id}")
                
                # Check if issue exists
                try:
                    issue = Issue.objects.get(id=issue_id)
                    print(f"   ✅ Issue exists: {issue.type}")
                except Issue.DoesNotExist:
                    print(f"   ⚠️ Issue not found in database")
            else:
                print(f"   ℹ️ No Issue ID found in email")
        
        monitor.disconnect()
        print("\n✅ Monitor test complete")
        return True
    else:
        print("❌ Monitor failed to connect")
        return False

def test_sample_vendor_response():
    """Test processing a sample vendor response"""
    print("\n📝 Testing Sample Vendor Response Processing...")
    
    # Get a recent issue
    issue = Issue.objects.filter(ai_activated=True).first()
    
    if not issue:
        print("❌ No issues with AI activated found")
        return False
    
    print(f"Using issue: {issue.id} - {issue.type}")
    
    # Create sample vendor response
    sample_email = {
        'subject': f'Re: Issue #{issue.id}',
        'from': 'vendor@example.com',
        'to': 'procurement@buy2rent.eu',
        'body': 'Thank you for reporting this issue. We will send a technician tomorrow to fix the problem.',
        'message_id': f'<test-{issue.id}@example.com>',
        'in_reply_to': '',
        'date': None
    }
    
    monitor = EmailMonitor()
    
    # Process the response
    try:
        monitor.process_vendor_response(sample_email)
        print("✅ Vendor response processed successfully")
        
        # Check if it was added
        logs = AICommunicationLog.objects.filter(
            issue=issue,
            sender='Vendor'
        ).order_by('-timestamp')
        
        if logs.exists():
            latest = logs.first()
            print(f"✅ Vendor response added to issue")
            print(f"   Status: {latest.status}")
            
            # Check for AI reply
            ai_replies = AICommunicationLog.objects.filter(
                issue=issue,
                sender='AI',
                status='pending_approval'
            ).order_by('-timestamp')
            
            if ai_replies.exists():
                print(f"✅ AI reply generated and pending approval")
            else:
                print(f"⚠️ No AI reply generated")
        
        return True
        
    except Exception as e:
        print(f"❌ Error processing vendor response: {e}")
        return False

if __name__ == "__main__":
    # Test IMAP connection
    connection_ok = test_imap_connection()
    
    if connection_ok:
        # Test email monitor
        monitor_ok = test_email_monitor()
        
        # Test sample processing
        sample_ok = test_sample_vendor_response()
        
        print("\n" + "="*40)
        if monitor_ok and sample_ok:
            print("✅ All tests PASSED")
        else:
            print("⚠️ Some tests failed")
    else:
        print("\n" + "="*40)
        print("❌ Cannot proceed without IMAP connection")
        print("\nTo fix:")
        print("1. For Gmail: Enable IMAP in settings")
        print("2. Generate App Password (not regular password)")
        print("3. Add to /root/buy2rent/backend/.env:")
        print("   EMAIL_HOST_USER=your-email@gmail.com")
        print("   EMAIL_HOST_PASSWORD=your-16-char-app-password")
