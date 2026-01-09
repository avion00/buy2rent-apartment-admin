#!/usr/bin/env python
"""
Find the specific vendor reply email
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

def find_vendor_email():
    print("=== Finding Vendor Reply Email ===\n")
    
    try:
        # Connect directly to IMAP
        imap = imaplib.IMAP4_SSL(settings.IMAP_HOST, settings.IMAP_PORT)
        imap.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
        imap.select('INBOX')
        
        # Get ALL emails
        status, messages = imap.search(None, 'ALL')
        all_ids = messages[0].split() if messages[0] else []
        
        print(f"Total emails: {len(all_ids)}")
        
        # We know the vendor reply is email ID 19811 from earlier debug
        target_id = b'19811'
        
        if target_id in all_ids:
            print(f"\n✅ Found email ID {target_id.decode()}")
            
            # Fetch this specific email
            status, msg_data = imap.fetch(target_id, '(RFC822)')
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
            message_id = msg.get('Message-ID', '')
            
            print(f"Subject: {subject}")
            print(f"From: {from_addr}")
            print(f"Message-ID: {message_id}")
            
            # Extract body
            body = ""
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
            
            print(f"Body preview: {body[:200].strip()}...")
            
            # Now process this with EmailMonitor
            print("\n📧 Processing with EmailMonitor...")
            
            monitor = EmailMonitor()
            if monitor.connect():
                # Create email data structure
                email_data = {
                    'subject': subject,
                    'from': from_addr,
                    'to': msg.get('To', ''),
                    'body': body,
                    'message_id': message_id,
                    'in_reply_to': msg.get('In-Reply-To', ''),
                    'date': None
                }
                
                # Extract Issue ID
                issue_id = monitor.extract_issue_id_from_email(subject, body)
                
                if issue_id:
                    print(f"✅ Found Issue ID: {issue_id}")
                    
                    # Process the vendor response
                    try:
                        monitor.process_vendor_response(email_data)
                        print("✅ Vendor response processed successfully!")
                    except Exception as e:
                        print(f"❌ Error processing: {e}")
                else:
                    print("❌ No Issue ID found")
                
                monitor.disconnect()
        else:
            print(f"❌ Email ID {target_id.decode()} not found")
        
        imap.close()
        imap.logout()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    find_vendor_email()
