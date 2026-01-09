#!/usr/bin/env python
"""
Detailed IMAP debugging to find vendor replies
"""
import os
import sys
import django
import imaplib
import email
from email.header import decode_header
import re

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, '/root/buy2rent/backend')
django.setup()

from django.conf import settings
from issues.models import Issue

def decode_mime_string(s):
    """Decode MIME encoded string"""
    if not s:
        return ""
    decoded_parts = []
    for part, encoding in decode_header(s):
        if isinstance(part, bytes):
            decoded_parts.append(part.decode(encoding or 'utf-8', errors='ignore'))
        else:
            decoded_parts.append(str(part))
    return ' '.join(decoded_parts)

def extract_text_from_email(msg):
    """Extract text content from email message"""
    body = ""
    
    if msg.is_multipart():
        for part in msg.walk():
            content_type = part.get_content_type()
            content_disposition = str(part.get("Content-Disposition", ""))
            
            # Skip attachments
            if "attachment" in content_disposition:
                continue
                
            if content_type == "text/plain":
                try:
                    payload = part.get_payload(decode=True)
                    if payload:
                        body += payload.decode('utf-8', errors='ignore')
                except:
                    pass
            elif content_type == "text/html" and not body:  # Use HTML if no plain text
                try:
                    payload = part.get_payload(decode=True)
                    if payload:
                        # Simple HTML to text
                        html_text = payload.decode('utf-8', errors='ignore')
                        # Remove HTML tags
                        html_text = re.sub('<[^<]+?>', '', html_text)
                        body += html_text
                except:
                    pass
    else:
        try:
            payload = msg.get_payload(decode=True)
            if payload:
                body = payload.decode('utf-8', errors='ignore')
        except:
            pass
    
    return body.strip()

def find_issue_id(text):
    """Find Issue ID in text using multiple patterns"""
    if not text:
        return None
    
    # Patterns to search for Issue IDs
    patterns = [
        # Standard UUID format
        r'([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})',
        # With "Issue #" prefix
        r'Issue\s*#?\s*([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})',
        # In brackets
        r'\[Issue\s*#?\s*([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\]',
        # With "issue-" prefix
        r'issue-([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})',
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            return matches[0]
    
    return None

def debug_imap():
    print("=== Detailed IMAP Debug ===\n")
    
    # Check credentials
    print("📧 Configuration:")
    print(f"   IMAP Host: {settings.IMAP_HOST}")
    print(f"   Email User: {settings.EMAIL_HOST_USER or 'NOT SET'}")
    
    if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
        print("\n❌ Email credentials not configured!")
        return
    
    try:
        # Connect to IMAP
        print("\n🔌 Connecting to IMAP...")
        imap = imaplib.IMAP4_SSL(settings.IMAP_HOST, settings.IMAP_PORT)
        imap.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
        print("✅ Connected successfully")
        
        # Select inbox
        imap.select('INBOX')
        
        # Get ALL emails first
        print("\n📬 Fetching ALL emails...")
        status, messages = imap.search(None, 'ALL')
        all_email_ids = messages[0].split() if messages[0] else []
        print(f"Total emails: {len(all_email_ids)}")
        
        # Get UNREAD emails
        print("\n📨 Fetching UNREAD emails...")
        status, unread = imap.search(None, 'UNSEEN')
        unread_ids = unread[0].split() if unread[0] else []
        print(f"Unread emails: {len(unread_ids)}")
        
        # Check last 10 emails (both read and unread)
        print("\n🔍 Analyzing last 10 emails for Issue IDs...")
        print("="*60)
        
        recent_ids = all_email_ids[-10:] if len(all_email_ids) > 0 else []
        
        found_issues = []
        
        for idx, email_id in enumerate(reversed(recent_ids), 1):
            # Fetch email
            status, msg_data = imap.fetch(email_id, '(RFC822 FLAGS)')
            
            # Check if email is unread
            flags = msg_data[0][0].decode() if msg_data[0][0] else ""
            is_unread = "\\Seen" not in flags
            
            # Parse email
            raw_email = msg_data[0][1]
            msg = email.message_from_bytes(raw_email)
            
            # Decode headers
            subject = decode_mime_string(msg.get('Subject', ''))
            from_addr = decode_mime_string(msg.get('From', ''))
            to_addr = decode_mime_string(msg.get('To', ''))
            date = msg.get('Date', '')
            
            # Extract body
            body = extract_text_from_email(msg)
            
            print(f"\n#{idx} Email ID: {email_id.decode()}")
            print(f"   Status: {'UNREAD' if is_unread else 'READ'}")
            print(f"   Date: {date[:30]}")
            print(f"   From: {from_addr}")
            print(f"   To: {to_addr}")
            print(f"   Subject: {subject}")
            
            # Show body preview
            if body:
                preview = body[:200].replace('\n', ' ').strip()
                print(f"   Body preview: {preview}...")
            
            # Search for Issue ID in subject and body
            combined_text = f"{subject} {body}"
            issue_id = find_issue_id(combined_text)
            
            if issue_id:
                print(f"   ✅ FOUND Issue ID: {issue_id}")
                
                # Check if issue exists in database
                try:
                    issue = Issue.objects.get(id=issue_id)
                    print(f"   ✅ Issue exists: {issue.type}")
                    found_issues.append({
                        'email_id': email_id.decode(),
                        'issue_id': issue_id,
                        'subject': subject,
                        'is_unread': is_unread
                    })
                except Issue.DoesNotExist:
                    print(f"   ❌ Issue not in database")
            else:
                print(f"   ❌ No Issue ID found")
                
                # Show what we're looking for
                if idx <= 3:  # Only show for first few
                    print("   Looking for patterns like:")
                    print("      - UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx")
                    print("      - Issue #xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx")
                    print("      - [Issue #xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx]")
        
        print("\n" + "="*60)
        print(f"\n📊 Summary:")
        print(f"   Checked {len(recent_ids)} recent emails")
        print(f"   Found {len(found_issues)} emails with Issue IDs")
        
        if found_issues:
            print("\n📧 Emails with Issue IDs:")
            for item in found_issues:
                status = "UNREAD" if item['is_unread'] else "READ"
                print(f"   - [{status}] {item['subject'][:50]}...")
                print(f"     Issue: {item['issue_id']}")
        
        # Show existing Issue IDs for reference
        print("\n📋 Recent Issues in Database:")
        recent_issues = Issue.objects.all().order_by('-created_at')[:5]
        for issue in recent_issues:
            print(f"   - {issue.id}: {issue.type}")
        
        imap.close()
        imap.logout()
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_imap()
