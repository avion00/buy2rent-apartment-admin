#!/usr/bin/env python
"""
SMTP Email Configuration Test Script
Tests email sending functionality for the AI vendor communication system
"""
import os
import sys
import django

# Setup Django environment
sys.path.insert(0, '/root/buy2rent/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.mail import send_mail, EmailMessage
from django.conf import settings
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def test_smtp_connection():
    """Test basic SMTP connection"""
    print("\n1. Testing SMTP Connection")
    print("-" * 50)
    
    try:
        print(f"Host: {settings.EMAIL_HOST}")
        print(f"Port: {settings.EMAIL_PORT}")
        print(f"TLS: {settings.EMAIL_USE_TLS}")
        print(f"User: {settings.EMAIL_HOST_USER}")
        print(f"From: {settings.DEFAULT_FROM_EMAIL}")
        
        # Test connection
        if settings.EMAIL_USE_SSL:
            server = smtplib.SMTP_SSL(settings.EMAIL_HOST, settings.EMAIL_PORT)
        else:
            server = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT)
            if settings.EMAIL_USE_TLS:
                server.starttls()
        
        server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
        server.quit()
        
        print("✓ SMTP connection successful!")
        return True
        
    except Exception as e:
        print(f"✗ SMTP connection failed: {e}")
        return False


def test_django_email():
    """Test Django's email sending"""
    print("\n2. Testing Django Email Send")
    print("-" * 50)
    
    test_recipient = input("Enter test recipient email: ").strip()
    if not test_recipient:
        print("No recipient provided, skipping test")
        return False
    
    try:
        # Send test email
        subject = "Test Email - Buy2Rent AI System"
        message = """
This is a test email from the Buy2Rent AI Vendor Communication System.

If you receive this email, your SMTP configuration is working correctly!

Configuration Details:
- SMTP Host: {}
- Port: {}
- From: {}

This email was sent to verify that the AI system can send automated emails to vendors.
        """.format(settings.EMAIL_HOST, settings.EMAIL_PORT, settings.DEFAULT_FROM_EMAIL)
        
        result = send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[test_recipient],
            fail_silently=False,
        )
        
        if result:
            print(f"✓ Email sent successfully to {test_recipient}")
            print(f"  Subject: {subject}")
            print(f"  From: {settings.DEFAULT_FROM_EMAIL}")
            return True
        else:
            print("✗ Email sending failed (no exception but returned 0)")
            return False
            
    except Exception as e:
        print(f"✗ Email sending failed: {e}")
        print("\nTroubleshooting tips:")
        print("1. Check your EMAIL_HOST_PASSWORD - use app password for Gmail")
        print("2. Verify EMAIL_HOST and EMAIL_PORT are correct")
        print("3. For Gmail, ensure 'Less secure app access' or use App Password")
        print("4. Check firewall settings for port", settings.EMAIL_PORT)
        return False


def test_ai_email_template():
    """Test sending an AI-style vendor email"""
    print("\n3. Testing AI Vendor Email Template")
    print("-" * 50)
    
    test_recipient = input("Enter vendor email for template test (or press Enter to skip): ").strip()
    if not test_recipient:
        print("Skipping template test")
        return False
    
    try:
        # Create AI-style email
        email = EmailMessage(
            subject="Issue Report: Quality Control - Order #12345",
            body="""
Dear Vendor,

We are writing to inform you about a quality issue with a recent order.

Order Details:
- Order Number: #12345
- Product: Test Product
- Issue Type: Quality Control
- Priority: High

Issue Description:
The product delivered does not meet the expected quality standards. We have identified several defects that require immediate attention.

Requested Action:
Please review this issue and provide a resolution plan within 2 business days. We expect either a replacement or a full refund for the affected items.

This is an automated message from our AI-powered procurement system. A human representative will review any responses.

Best regards,
Procurement Team
Buy2Rent EU
            """,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[test_recipient],
            reply_to=[settings.DEFAULT_FROM_EMAIL],
        )
        
        email.send(fail_silently=False)
        
        print(f"✓ AI template email sent successfully to {test_recipient}")
        return True
        
    except Exception as e:
        print(f"✗ Template email failed: {e}")
        return False


def check_configuration():
    """Check current email configuration"""
    print("\n" + "="*60)
    print(" CURRENT EMAIL CONFIGURATION")
    print("="*60)
    
    config_items = [
        ('EMAIL_BACKEND', settings.EMAIL_BACKEND),
        ('EMAIL_HOST', settings.EMAIL_HOST),
        ('EMAIL_PORT', settings.EMAIL_PORT),
        ('EMAIL_USE_TLS', settings.EMAIL_USE_TLS),
        ('EMAIL_USE_SSL', settings.EMAIL_USE_SSL),
        ('EMAIL_HOST_USER', settings.EMAIL_HOST_USER),
        ('EMAIL_HOST_PASSWORD', '***' if settings.EMAIL_HOST_PASSWORD else 'NOT SET'),
        ('DEFAULT_FROM_EMAIL', settings.DEFAULT_FROM_EMAIL),
        ('SERVER_EMAIL', settings.SERVER_EMAIL),
    ]
    
    for name, value in config_items:
        status = "✓" if value else "✗"
        print(f"{status} {name:20} : {value}")
    
    # Check OpenAI configuration
    print("\n" + "="*60)
    print(" AI CONFIGURATION")
    print("="*60)
    
    ai_config = [
        ('USE_MOCK_AI', getattr(settings, 'USE_MOCK_AI', True)),
        ('OPENAI_API_KEY', '***' if getattr(settings, 'OPENAI_API_KEY', '') else 'NOT SET'),
        ('OPENAI_MODEL', getattr(settings, 'OPENAI_MODEL', 'gpt-4')),
    ]
    
    for name, value in ai_config:
        status = "✓" if value != 'NOT SET' else "✗"
        print(f"{status} {name:20} : {value}")


def main():
    """Main test runner"""
    print("\n" + "="*60)
    print(" SMTP EMAIL CONFIGURATION TEST")
    print("="*60)
    
    # Show current configuration
    check_configuration()
    
    # Run tests
    print("\n" + "="*60)
    print(" RUNNING TESTS")
    print("="*60)
    
    # Test SMTP connection
    if test_smtp_connection():
        # Test Django email
        if test_django_email():
            # Test AI template
            test_ai_email_template()
    
    print("\n" + "="*60)
    print(" TEST COMPLETE")
    print("="*60)
    
    print("\nNext Steps:")
    print("1. If tests passed, your SMTP is configured correctly")
    print("2. Set USE_MOCK_AI=False to use real OpenAI")
    print("3. The AI system will now send real emails to vendors")
    print("4. Monitor /api/issues/{id}/email_thread/ for conversations")


if __name__ == "__main__":
    main()
