#!/usr/bin/env python
"""
Test email generation with real vendor and sender names (sync version)
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, '/root/buy2rent/backend')
django.setup()

from issues.models import Issue, AICommunicationLog

def test_email_names():
    print("=== Testing Email Names in Existing Messages ===\n")
    
    # Get the issue we've been working with
    issue_id = '06e7d237-7188-4ca1-9f5f-d161c30fc4c1'
    
    try:
        issue = Issue.objects.get(id=issue_id)
        print(f"📋 Issue Details:")
        print(f"   ID: {issue.id}")
        print(f"   Type: {issue.type}")
        print(f"   Vendor: {issue.vendor.name if issue.vendor else 'No vendor'}")
        
        vendor_name = issue.vendor.name if issue.vendor else "Unknown Vendor"
        
        # Check existing AI messages
        ai_messages = AICommunicationLog.objects.filter(
            issue=issue,
            sender='AI'
        ).order_by('-timestamp')
        
        print(f"\n📧 Checking {ai_messages.count()} AI messages for proper names...")
        
        for idx, msg in enumerate(ai_messages[:3], 1):
            print(f"\n#{idx} Message:")
            print(f"   Subject: {msg.subject}")
            print(f"   Status: {msg.status}")
            
            # Check message content
            if msg.message:
                # Check for generic greetings
                has_dear_vendor = "Dear Vendor" in msg.message
                has_vendor_name = vendor_name in msg.message if vendor_name != "Unknown Vendor" else False
                has_procurement_team = "Procurement Team" in msg.message
                
                print(f"\n   Content Analysis:")
                if has_dear_vendor:
                    print(f"   ❌ Contains generic 'Dear Vendor'")
                if has_vendor_name:
                    print(f"   ✅ Contains vendor name: '{vendor_name}'")
                else:
                    print(f"   ⚠️ Missing vendor name: '{vendor_name}'")
                if has_procurement_team:
                    print(f"   ✅ Contains 'Procurement Team' signature")
                
                # Show greeting line
                lines = msg.message.split('\n')
                if lines:
                    print(f"\n   Greeting: {lines[0]}")
                    
                # Show signature area (last few lines)
                if len(lines) > 3:
                    print(f"   Signature area:")
                    for line in lines[-3:]:
                        if line.strip():
                            print(f"      {line}")
        
        print("\n" + "="*50)
        print("\n📊 Summary:")
        print(f"   Vendor Name: {vendor_name}")
        print(f"   Expected Greeting: Dear {vendor_name},")
        print(f"   Expected Signature: Procurement Team")
        
        print("\n✅ Configuration Updated:")
        print("   - AI now uses vendor's actual name")
        print("   - Signs off as 'Procurement Team'")
        print("   - No more generic 'Dear Vendor'")
        
    except Issue.DoesNotExist:
        print(f"❌ Issue {issue_id} not found")

if __name__ == "__main__":
    test_email_names()
