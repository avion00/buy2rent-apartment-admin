#!/usr/bin/env python
"""
Setup email configuration for SMTP and IMAP
"""
import os

# Common email credentials for both SMTP and IMAP
email_config = """
# Email Configuration (SMTP and IMAP use same credentials)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
EMAIL_HOST_USER=procurement@buy2rent.eu
EMAIL_HOST_PASSWORD=your-app-password-here
DEFAULT_FROM_EMAIL=procurement@buy2rent.eu

# IMAP Configuration (uses EMAIL_HOST_USER and EMAIL_HOST_PASSWORD)
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
"""

env_file = '/root/buy2rent/backend/.env'

# Check if .env exists
if os.path.exists(env_file):
    with open(env_file, 'r') as f:
        content = f.read()
    
    # Check if email config already exists
    if 'EMAIL_HOST_USER=' not in content:
        print("Adding email configuration to .env file...")
        with open(env_file, 'a') as f:
            f.write('\n' + email_config)
        print("✅ Email configuration added to .env")
        print("\n⚠️ IMPORTANT: You need to update EMAIL_HOST_PASSWORD with your actual app password")
    else:
        print("Email configuration already exists in .env")
        print("Current configuration uses EMAIL_HOST_USER and EMAIL_HOST_PASSWORD for both SMTP and IMAP")
else:
    print("Creating .env file with email configuration...")
    with open(env_file, 'w') as f:
        f.write(email_config)
    print("✅ Created .env file with email configuration")
    print("\n⚠️ IMPORTANT: You need to update EMAIL_HOST_PASSWORD with your actual app password")

print("\nTo complete setup:")
print("1. Edit /root/buy2rent/backend/.env")
print("2. Replace 'your-app-password-here' with your actual Gmail app password")
print("3. For Gmail, generate app password at: https://myaccount.google.com/apppasswords")
print("\nOnce configured, the same credentials will be used for:")
print("- Sending emails (SMTP)")
print("- Receiving emails (IMAP)")
