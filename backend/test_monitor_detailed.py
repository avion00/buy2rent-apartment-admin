#!/usr/bin/env python
"""
Test email monitor with detailed output
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, '/root/buy2rent/backend')
django.setup()

from issues.email_monitor import EmailMonitor
from issues.models import Issue, AICommunicationLog

def test_monitor():
    print("=== Testing Email Monitor ===\n")
    
    monitor = EmailMonitor()
    
    print("📧 Connecting to email...")
    if monitor.connect():
        print("✅ Connected successfully")
        
        print("\n🔍 Fetching emails...")
        emails = monitor.fetch_unread_emails()
        print(f"Found {len(emails)} emails to check")
        
        if emails:
            for idx, email_data in enumerate(emails[:5], 1):
                print(f"\n#{idx} Email:")
                print(f"   Subject: {email_data['subject'][:100]}")
                print(f"   From: {email_data['from']}")
                print(f"   Message ID: {email_data.get('message_id', 'None')}")
                
                # Check for Issue ID
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
                        
                        # Check if already processed
                        if email_data.get('message_id'):
                            existing = AICommunicationLog.objects.filter(
                                email_message_id=email_data['message_id']
                            ).exists()
                            
                            if existing:
                                print(f"   ⚠️ Already processed")
                            else:
                                print(f"   📝 Ready to process")
                                
                                # Process it
                                print(f"   Processing vendor response...")
                                monitor.process_vendor_response(email_data)
                                print(f"   ✅ Processed successfully")
                    except Issue.DoesNotExist:
                        print(f"   ❌ Issue not found in database")
                    except Exception as e:
                        print(f"   ❌ Error processing: {e}")
                else:
                    print(f"   ❌ No Issue ID found")
        else:
            print("\n❌ No emails found to process")
            print("\nPossible reasons:")
            print("1. All emails already processed")
            print("2. No emails with Issue IDs")
            print("3. Email filtering issue")
        
        monitor.disconnect()
        print("\n✅ Monitor test complete")
    else:
        print("❌ Failed to connect to email")

if __name__ == "__main__":
    test_monitor()
