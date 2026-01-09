#!/usr/bin/env python
"""
Debug email monitor to see why it's not detecting emails
"""
import os
import sys
import django
import imaplib
import email
from email.header import decode_header

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, '/root/buy2rent/backend')
django.setup()

from django.conf import settings
from issues.email_monitor import EmailMonitor
from issues.models import Issue

def debug_email_monitor():
    print("=== Debugging Email Monitor ===\n")
    
    # 1. Check configuration
    print("📧 Step 1: Configuration Check")
    print("-" * 40)
    print(f"IMAP Host: {settings.IMAP_HOST}")
    print(f"IMAP Port: {settings.IMAP_PORT}")
    print(f"Email User: {settings.EMAIL_HOST_USER or 'NOT SET'}")
    print(f"Password: {'SET' if settings.EMAIL_HOST_PASSWORD else 'NOT SET'}")
    
    if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
        print("\n❌ Email credentials not configured!")
        print("Please add to /root/buy2rent/backend/.env:")
        print("EMAIL_HOST_USER=your-email@gmail.com")
        print("EMAIL_HOST_PASSWORD=your-app-password")
        return
    
    # 2. Test IMAP connection
    print("\n🔌 Step 2: Testing IMAP Connection")
    print("-" * 40)
    
    try:
        imap = imaplib.IMAP4_SSL(settings.IMAP_HOST, settings.IMAP_PORT)
        imap.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
        print("✅ IMAP login successful")
        
        # Select inbox
        imap.select('INBOX')
        
        # 3. Check ALL emails (not just unread)
        print("\n📬 Step 3: Checking ALL Emails")
        print("-" * 40)
        
        status, messages = imap.search(None, 'ALL')
        email_ids = messages[0].split() if messages[0] else []
        print(f"Total emails in inbox: {len(email_ids)}")
        
        # 4. Check UNREAD emails
        print("\n📨 Step 4: Checking UNREAD Emails")
        print("-" * 40)
        
        status, unread = imap.search(None, 'UNSEEN')
        unread_ids = unread[0].split() if unread[0] else []
        print(f"Unread emails: {len(unread_ids)}")
        
        # 5. Show recent emails to check for Issue IDs
        print("\n🔍 Step 5: Analyzing Recent Emails for Issue IDs")
        print("-" * 40)
        
        # Get last 5 emails
        recent_emails = email_ids[-5:] if len(email_ids) > 0 else []
        
        for email_id in recent_emails:
            status, msg_data = imap.fetch(email_id, '(RFC822)')
            raw_email = msg_data[0][1]
            msg = email.message_from_bytes(raw_email)
            
            # Decode subject
            subject = msg.get('Subject', '')
            if subject:
                decoded_parts = []
                for part, encoding in decode_header(subject):
                    if isinstance(part, bytes):
                        decoded_parts.append(part.decode(encoding or 'utf-8', errors='ignore'))
                    else:
                        decoded_parts.append(str(part))
                subject = ' '.join(decoded_parts)
            
            from_addr = msg.get('From', '')
            
            # Extract body
            body = ''
            if msg.is_multipart():
                for part in msg.walk():
                    if part.get_content_type() == "text/plain":
                        try:
                            body = part.get_payload(decode=True).decode('utf-8', errors='ignore')
                            break
                        except:
                            pass
            else:
                try:
                    body = msg.get_payload(decode=True).decode('utf-8', errors='ignore')
                except:
                    pass
            
            print(f"\nEmail #{email_id.decode()}:")
            print(f"  From: {from_addr[:50]}")
            print(f"  Subject: {subject[:100]}")
            print(f"  Body preview: {body[:150].strip()}...")
            
            # Check for Issue ID patterns
            monitor = EmailMonitor()
            issue_id = monitor.extract_issue_id_from_email(subject, body)
            
            if issue_id:
                print(f"  ✅ Found Issue ID: {issue_id}")
                
                # Check if issue exists
                try:
                    issue = Issue.objects.get(id=issue_id)
                    print(f"  ✅ Issue exists in database: {issue.type}")
                except Issue.DoesNotExist:
                    print(f"  ❌ Issue {issue_id} not found in database")
            else:
                print(f"  ❌ No Issue ID found")
                
                # Show what patterns we're looking for
                import re
                patterns = [
                    r'Issue\s*#?\s*([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})',
                    r'issue-([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})',
                ]
                
                print("  Looking for patterns like:")
                print("    - Issue #xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx")
                print("    - issue-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx")
        
        imap.close()
        imap.logout()
        
    except Exception as e:
        print(f"❌ IMAP error: {e}")
        return
    
    # 6. Test the monitor directly
    print("\n🤖 Step 6: Testing Email Monitor")
    print("-" * 40)
    
    monitor = EmailMonitor()
    if monitor.connect():
        print("✅ Monitor connected")
        
        emails = monitor.fetch_unread_emails()
        print(f"Monitor found {len(emails)} unread emails")
        
        for email_data in emails:
            print(f"\n  Subject: {email_data['subject'][:100]}")
            issue_id = monitor.extract_issue_id_from_email(
                email_data['subject'],
                email_data['body']
            )
            if issue_id:
                print(f"  ✅ Would process for issue: {issue_id}")
            else:
                print(f"  ❌ No issue ID detected")
        
        monitor.disconnect()
    else:
        print("❌ Monitor failed to connect")
    
    print("\n" + "="*50)
    print("📋 Summary:")
    print("\nFor emails to be detected, they must:")
    print("1. Be UNREAD (not previously processed)")
    print("2. Contain an Issue ID in subject or body")
    print("3. Issue ID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx")
    print("4. Issue must exist in the database")
    print("\nTo test:")
    print("1. Send an email with subject: 'Re: Issue #[actual-issue-id]'")
    print("2. Make sure the email is unread")
    print("3. Run: python manage.py monitor_vendor_emails --once")

if __name__ == "__main__":
    debug_email_monitor()
