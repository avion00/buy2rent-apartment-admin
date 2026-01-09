#!/usr/bin/env python
"""
Test IMAP search to find vendor emails
"""
import os
import sys
import django
import imaplib
import email
from email.header import decode_header

# Setup Django environment
sys.path.insert(0, '/root/buy2rent/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.conf import settings

def test_imap_search():
    """Test different search criteria to find vendor emails"""
    
    print("Connecting to IMAP...")
    mail = imaplib.IMAP4_SSL(settings.IMAP_HOST, settings.IMAP_PORT)
    mail.login(settings.IMAP_USER, settings.IMAP_PASSWORD)
    
    # Select inbox
    mail.select('INBOX')
    
    # Test different search criteria
    search_tests = [
        ('FROM "anonsagar00@gmail.com"', "Emails from vendor"),
        ('(UNSEEN FROM "anonsagar00@gmail.com")', "Unread emails from vendor"),
        ('(SINCE "13-Dec-2024" FROM "anonsagar00@gmail.com")', "Recent emails from vendor"),
        ('(OR SUBJECT "Issue" SUBJECT "Quality" SUBJECT "Resolution")', "Emails with Issue keywords"),
        ('ALL', "All emails (first 10)"),
    ]
    
    for search_criteria, description in search_tests:
        print(f"\n{'='*60}")
        print(f"Testing: {description}")
        print(f"Criteria: {search_criteria}")
        print('='*60)
        
        try:
            status, messages = mail.search(None, search_criteria)
            
            if status == 'OK':
                email_ids = messages[0].split()
                
                # Limit to first 10 for ALL search
                if search_criteria == 'ALL':
                    email_ids = email_ids[-10:] if len(email_ids) > 10 else email_ids
                
                print(f"Found {len(email_ids)} emails")
                
                # Show details of first 5 emails
                for email_id in email_ids[:5]:
                    status, msg_data = mail.fetch(email_id, '(RFC822)')
                    
                    if status == 'OK':
                        raw_email = msg_data[0][1]
                        msg = email.message_from_bytes(raw_email)
                        
                        # Decode subject
                        subject = msg.get('Subject', '')
                        if subject:
                            decoded = decode_header(subject)
                            if decoded[0][1]:
                                subject = decoded[0][0].decode(decoded[0][1])
                            elif isinstance(decoded[0][0], bytes):
                                subject = decoded[0][0].decode('utf-8', errors='ignore')
                            else:
                                subject = decoded[0][0]
                        
                        from_addr = email.utils.parseaddr(msg.get('From', ''))[1]
                        date = msg.get('Date', '')
                        
                        # Check if email is seen
                        status_check, flags_data = mail.fetch(email_id, '(FLAGS)')
                        is_seen = b'\\Seen' in flags_data[0]
                        
                        print(f"\n  Email ID: {email_id.decode()}")
                        print(f"  From: {from_addr}")
                        print(f"  Subject: {subject[:80]}")
                        print(f"  Date: {date}")
                        print(f"  Status: {'Read' if is_seen else 'Unread'}")
                        
                        # Check body for Issue ID
                        body = ""
                        if msg.is_multipart():
                            for part in msg.walk():
                                if part.get_content_type() == "text/plain":
                                    try:
                                        body = part.get_payload(decode=True).decode('utf-8', errors='ignore')
                                        break
                                    except:
                                        continue
                        else:
                            try:
                                body = msg.get_payload(decode=True).decode('utf-8', errors='ignore')
                            except:
                                body = str(msg.get_payload())
                        
                        # Look for issue references
                        import re
                        issue_patterns = [
                            r'Issue #([a-f0-9-]{36})',
                            r'Issue ID:\s*([a-f0-9-]{36})',
                            r'Quality Issue',
                            r'Urgent Quality',
                        ]
                        
                        found_patterns = []
                        for pattern in issue_patterns:
                            if re.search(pattern, subject + " " + body, re.IGNORECASE):
                                found_patterns.append(pattern)
                        
                        if found_patterns:
                            print(f"  ✓ Contains issue references: {', '.join(found_patterns)}")
                        
            else:
                print(f"Search failed: {status}")
                
        except Exception as e:
            print(f"Error: {e}")
    
    # Check specific folders
    print(f"\n{'='*60}")
    print("Available folders:")
    print('='*60)
    status, folders = mail.list()
    if status == 'OK':
        for folder in folders[:10]:
            print(f"  {folder.decode()}")
    
    mail.logout()
    print("\nDisconnected from IMAP")

if __name__ == "__main__":
    test_imap_search()
