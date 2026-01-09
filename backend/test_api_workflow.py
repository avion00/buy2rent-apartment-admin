#!/usr/bin/env python
"""
Test the AI email workflow through REST API endpoints
"""
import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def get_auth_token():
    """Get authentication token"""
    print("1. Getting authentication token...")
    response = requests.post(f"{BASE_URL}/auth/login/", json={
        "username": "admin",
        "password": "admin"  # You'll need to set this
    })
    
    if response.status_code == 200:
        token = response.json().get('access')
        print(f"   ✓ Token obtained")
        return token
    else:
        print(f"   ✗ Failed to get token: {response.status_code}")
        # Try without auth for testing
        return None

def test_issue_list(headers):
    """Test listing issues"""
    print("\n2. Testing issue list endpoint...")
    response = requests.get(f"{BASE_URL}/api/issues/", headers=headers)
    
    if response.status_code == 200:
        issues = response.json()
        count = issues.get('count', len(issues)) if isinstance(issues, dict) else len(issues)
        print(f"   ✓ Found {count} issues")
        
        # Get the latest issue with AI activated
        if isinstance(issues, dict) and 'results' in issues:
            issues_list = issues['results']
        else:
            issues_list = issues if isinstance(issues, list) else []
            
        for issue in issues_list[:3]:
            print(f"   - {issue.get('id')}: {issue.get('type')} (AI: {issue.get('ai_activated')})")
        
        # Return the first issue for testing
        if issues_list:
            return issues_list[0]['id']
    else:
        print(f"   ✗ Failed: {response.status_code}")
    return None

def test_activate_ai_email(issue_id, headers):
    """Test activating AI email for an issue"""
    print(f"\n3. Testing AI email activation for issue {issue_id}...")
    response = requests.post(
        f"{BASE_URL}/api/issues/{issue_id}/activate_ai_email/",
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"   ✓ {data.get('message')}")
        print(f"   Subject: {data.get('email_subject')}")
        return True
    else:
        print(f"   ✗ Failed: {response.status_code}")
        if response.text:
            print(f"   Error: {response.text}")
    return False

def test_email_thread(issue_id, headers):
    """Test getting email thread for an issue"""
    print(f"\n4. Testing email thread retrieval for issue {issue_id}...")
    response = requests.get(
        f"{BASE_URL}/api/issues/{issue_id}/email_thread/",
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        messages = data.get('messages', [])
        print(f"   ✓ Thread has {len(messages)} messages")
        print(f"   AI Activated: {data.get('ai_activated')}")
        print(f"   Current Status: {data.get('current_status')}")
        
        for msg in messages:
            print(f"   - {msg.get('sender')}: {msg.get('subject', 'No subject')[:50]}")
        
        return True
    else:
        print(f"   ✗ Failed: {response.status_code}")
    return False

def test_vendor_response_analysis(issue_id, headers):
    """Test analyzing a vendor response"""
    print(f"\n5. Testing vendor response analysis...")
    
    vendor_message = """
    Thank you for your email. We acknowledge the issue with the product.
    We will send a replacement within 3 business days and arrange for 
    collection of the damaged item. Our apologies for the inconvenience.
    """
    
    response = requests.post(
        f"{BASE_URL}/api/issues/{issue_id}/analyze_vendor_response/",
        json={"message": vendor_message},
        headers=headers
    )
    
    if response.status_code == 200:
        analysis = response.json()
        print(f"   ✓ Analysis complete")
        print(f"   Sentiment: {analysis.get('sentiment')}")
        print(f"   Intent: {analysis.get('intent')}")
        print(f"   Suggested Action: {analysis.get('suggested_action')}")
        return True
    else:
        print(f"   ✗ Failed: {response.status_code}")
    return False

def test_generate_ai_reply(issue_id, headers):
    """Test generating an AI reply"""
    print(f"\n6. Testing AI reply generation...")
    
    vendor_message = "We will process the replacement immediately."
    
    response = requests.post(
        f"{BASE_URL}/api/issues/{issue_id}/generate_ai_reply/",
        json={"vendor_message": vendor_message},
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        if data.get('success'):
            print(f"   ✓ Reply generated")
            print(f"   Message ID: {data.get('message_id')}")
            print(f"   Confidence: {data.get('confidence')}")
            print(f"   Reply preview: {data.get('reply', '')[:100]}...")
            return data.get('message_id')
        else:
            print(f"   ✗ Generation failed: {data.get('error')}")
    else:
        print(f"   ✗ Failed: {response.status_code}")
    return None

def test_pending_approvals(headers):
    """Test getting pending approvals"""
    print(f"\n7. Testing pending approvals endpoint...")
    
    response = requests.get(
        f"{BASE_URL}/api/ai-communication-logs/pending_approvals/",
        headers=headers
    )
    
    if response.status_code == 200:
        pending = response.json()
        count = len(pending) if isinstance(pending, list) else pending.get('count', 0)
        print(f"   ✓ Found {count} pending approvals")
        
        if isinstance(pending, list):
            for msg in pending[:3]:
                print(f"   - {msg.get('id')}: {msg.get('subject', 'No subject')[:50]}")
        
        return True
    else:
        print(f"   ✗ Failed: {response.status_code}")
    return False

def test_approve_message(message_id, headers):
    """Test approving a message"""
    print(f"\n8. Testing message approval for {message_id}...")
    
    response = requests.post(
        f"{BASE_URL}/api/ai-communication-logs/{message_id}/approve/",
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"   ✓ {data.get('message', 'Message approved')}")
        return True
    else:
        print(f"   ✗ Failed: {response.status_code}")
        if response.text:
            print(f"   Error: {response.text}")
    return False

def main():
    print("=" * 70)
    print("AI EMAIL API WORKFLOW TEST")
    print("=" * 70)
    
    # Get auth token (optional, will work without if auth is disabled)
    token = get_auth_token()
    headers = {}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    
    # Test issue list
    issue_id = test_issue_list(headers)
    
    if issue_id:
        # Test AI email activation
        if test_activate_ai_email(issue_id, headers):
            time.sleep(1)  # Give it a moment to process
            
            # Test email thread
            test_email_thread(issue_id, headers)
            
            # Test vendor response analysis
            test_vendor_response_analysis(issue_id, headers)
            
            # Test AI reply generation
            message_id = test_generate_ai_reply(issue_id, headers)
            
            # Test pending approvals
            test_pending_approvals(headers)
            
            # Test message approval if we have a message ID
            if message_id:
                test_approve_message(message_id, headers)
    else:
        print("\nNo issues found to test with. Please create an issue first.")
    
    print("\n" + "=" * 70)
    print("API TEST COMPLETED")
    print("=" * 70)

if __name__ == "__main__":
    main()
