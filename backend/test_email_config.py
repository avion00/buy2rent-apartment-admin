#!/usr/bin/env python
"""
Test email configuration - verify SMTP and IMAP use same credentials
"""
import os
import sys
import django
import imaplib
import smtplib

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, '/root/buy2rent/backend')
django.setup()

from django.conf import settings

def test_email_configuration():
    """Test that SMTP and IMAP are properly configured with same credentials"""
    print("=== Testing Email Configuration ===\n")
    
    # Display current configuration
    print("📧 Current Configuration:")
    print(f"   SMTP Host: {settings.EMAIL_HOST}")
    print(f"   SMTP Port: {settings.EMAIL_PORT}")
    print(f"   IMAP Host: {settings.IMAP_HOST}")
    print(f"   IMAP Port: {settings.IMAP_PORT}")
    print(f"   Email User: {settings.EMAIL_HOST_USER or 'NOT SET'}")
    print(f"   Password: {'SET' if settings.EMAIL_HOST_PASSWORD else 'NOT SET'}")
    print(f"   From Email: {settings.DEFAULT_FROM_EMAIL}")
    
    print("\n✅ Configuration Status:")
    print("   SMTP and IMAP use the same credentials: EMAIL_HOST_USER & EMAIL_HOST_PASSWORD")
    
    if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
        print("\n⚠️ Credentials not configured!")
        print("\nTo configure:")
        print("1. Edit /root/buy2rent/backend/.env")
        print("2. Set EMAIL_HOST_USER=your-email@gmail.com")
        print("3. Set EMAIL_HOST_PASSWORD=your-app-password")
        print("\nFor Gmail:")
        print("- Enable 2-factor authentication")
        print("- Generate app password at: https://myaccount.google.com/apppasswords")
        print("- Use the 16-character app password (not your regular password)")
        return False
    
    # Test SMTP connection
    print("\n🔌 Testing SMTP connection...")
    try:
        smtp = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT)
        smtp.starttls()
        smtp.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
        smtp.quit()
        print("✅ SMTP connection successful!")
    except Exception as e:
        print(f"❌ SMTP connection failed: {e}")
        return False
    
    # Test IMAP connection
    print("\n🔌 Testing IMAP connection...")
    try:
        imap = imaplib.IMAP4_SSL(settings.IMAP_HOST, settings.IMAP_PORT)
        imap.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
        imap.select('INBOX')
        
        # Get email count
        status, messages = imap.search(None, 'ALL')
        email_count = len(messages[0].split()) if messages[0] else 0
        print(f"✅ IMAP connection successful!")
        print(f"📬 Found {email_count} emails in inbox")
        
        # Check for unread emails
        status, unread = imap.search(None, 'UNSEEN')
        unread_count = len(unread[0].split()) if unread[0] else 0
        print(f"📨 {unread_count} unread emails")
        
        imap.close()
        imap.logout()
        
    except Exception as e:
        print(f"❌ IMAP connection failed: {e}")
        return False
    
    print("\n" + "="*50)
    print("✅ Email configuration is working correctly!")
    print("\nBoth SMTP and IMAP are using the same credentials:")
    print(f"   User: {settings.EMAIL_HOST_USER}")
    print("\nThe system can now:")
    print("   ✅ Send emails to vendors (SMTP)")
    print("   ✅ Receive vendor replies (IMAP)")
    print("   ✅ Automatically process responses")
    
    return True

if __name__ == "__main__":
    success = test_email_configuration()
    
    if success:
        print("\n📍 Next step: Start the email monitor")
        print("   python manage.py monitor_vendor_emails")
    else:
        print("\n❌ Please configure email credentials first")
