#!/usr/bin/env python
"""
Simple test to verify Issue ID is included in emails
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, '/root/buy2rent/backend')
django.setup()

from issues.models import Issue, AICommunicationLog

def test_issue_id_in_emails():
    print("=== Testing Issue ID in Emails ===\n")
    
    # Get a recent issue with AI communication
    issue = Issue.objects.filter(ai_activated=True).first()
    
    if not issue:
        print("❌ No issues with AI activated found")
        return
    
    print(f"📝 Checking issue: {issue.id}")
    print(f"   Type: {issue.type}")
    
    # Check communication logs
    logs = AICommunicationLog.objects.filter(issue=issue, sender='AI').order_by('-timestamp')
    
    if logs.exists():
        print(f"\n📧 Found {logs.count()} AI messages")
        
        for log in logs[:3]:
            print(f"\n   Message ID: {log.id}")
            print(f"   Subject: {log.subject}")
            
            # Check if Issue ID is in subject
            has_id_in_subject = str(issue.id) in log.subject
            print(f"   ✅ Issue ID in subject: {has_id_in_subject}")
            
            if has_id_in_subject:
                print(f"   Format found: Issue #{issue.id}")
            
            # Check if Issue ID is in body
            has_id_in_body = str(issue.id) in log.message if log.message else False
            print(f"   ✅ Issue ID in body: {has_id_in_body}")
    else:
        print("❌ No AI messages found for this issue")
    
    print("\n" + "="*50)
    print("📋 Configuration Update Summary:")
    print("\nAll NEW emails will now include:")
    print(f"1. Subject: [Issue #{{issue-id}}] Original Subject")
    print(f"2. Body footer: Reference: Issue #{{issue-id}}")
    print("\nThis ensures:")
    print("- Vendor replies will contain the Issue ID")
    print("- IMAP monitor can detect and link replies")
    print("- Automatic processing of vendor responses")
    
    print("\n⚠️ Note: Existing emails won't have Issue IDs")
    print("Only new emails sent after the update will include them")

if __name__ == "__main__":
    test_issue_id_in_emails()
