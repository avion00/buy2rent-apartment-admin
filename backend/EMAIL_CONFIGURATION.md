# Email Configuration Guide for AI Vendor Communication

## Overview
This guide explains how to configure email credentials for both sending (SMTP) and receiving (IMAP) emails in the AI-powered vendor communication system.

## Configuration Methods

### Method 1: Environment Variables (.env file)
Create or edit `/root/buy2rent/backend/.env` file:

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-your-api-key-here
USE_MOCK_AI=False

# SMTP Settings (Outgoing Email)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=procurement@buy2rent.eu
SERVER_EMAIL=procurement@buy2rent.eu

# IMAP Settings (Incoming Email)
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USE_SSL=True
IMAP_USER=your-email@gmail.com
IMAP_PASSWORD=your-app-password
IMAP_INBOX_FOLDER=INBOX
IMAP_PROCESSED_FOLDER=Processed
IMAP_CHECK_INTERVAL=300
```

### Method 2: Export Environment Variables
```bash
# OpenAI
export OPENAI_API_KEY="sk-proj-your-api-key-here"
export USE_MOCK_AI=False

# SMTP
export EMAIL_HOST="smtp.gmail.com"
export EMAIL_PORT=587
export EMAIL_USE_TLS=True
export EMAIL_HOST_USER="your-email@gmail.com"
export EMAIL_HOST_PASSWORD="your-app-password"
export DEFAULT_FROM_EMAIL="procurement@buy2rent.eu"

# IMAP
export IMAP_HOST="imap.gmail.com"
export IMAP_PORT=993
export IMAP_USE_SSL=True
export IMAP_USER="your-email@gmail.com"
export IMAP_PASSWORD="your-app-password"
```

## Email Provider Configurations

### Gmail Configuration
1. **Enable 2-Factor Authentication** in your Google Account
2. **Generate App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and generate password
   - Use this password for `EMAIL_HOST_PASSWORD` and `IMAP_PASSWORD`

3. **Settings**:
```bash
# SMTP (Outgoing)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-16-char-app-password

# IMAP (Incoming)
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USE_SSL=True
IMAP_USER=your-email@gmail.com
IMAP_PASSWORD=your-16-char-app-password
```

### Outlook/Office365 Configuration
```bash
# SMTP (Outgoing)
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@outlook.com
EMAIL_HOST_PASSWORD=your-password

# IMAP (Incoming)
IMAP_HOST=outlook.office365.com
IMAP_PORT=993
IMAP_USE_SSL=True
IMAP_USER=your-email@outlook.com
IMAP_PASSWORD=your-password
```

### Yahoo Mail Configuration
```bash
# SMTP (Outgoing)
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@yahoo.com
EMAIL_HOST_PASSWORD=your-app-password

# IMAP (Incoming)
IMAP_HOST=imap.mail.yahoo.com
IMAP_PORT=993
IMAP_USE_SSL=True
IMAP_USER=your-email@yahoo.com
IMAP_PASSWORD=your-app-password
```

### Custom Email Server
```bash
# SMTP (Outgoing)
EMAIL_HOST=mail.yourdomain.com
EMAIL_PORT=587  # or 465 for SSL
EMAIL_USE_TLS=True  # or EMAIL_USE_SSL=True
EMAIL_HOST_USER=user@yourdomain.com
EMAIL_HOST_PASSWORD=your-password

# IMAP (Incoming)
IMAP_HOST=mail.yourdomain.com
IMAP_PORT=993  # or 143 for non-SSL
IMAP_USE_SSL=True
IMAP_USER=user@yourdomain.com
IMAP_PASSWORD=your-password
```

## Testing Email Configuration

### Test SMTP (Sending)
```python
# Run in Django shell: python manage.py shell
from django.core.mail import send_mail
from django.conf import settings

send_mail(
    'Test Email',
    'This is a test email from Buy2Rent AI system.',
    settings.DEFAULT_FROM_EMAIL,
    ['test@example.com'],
    fail_silently=False,
)
```

### Test IMAP (Receiving)
```python
# Run in Django shell: python manage.py shell
import imaplib
from django.conf import settings

# Connect to IMAP
mail = imaplib.IMAP4_SSL(settings.IMAP_HOST, settings.IMAP_PORT)
mail.login(settings.IMAP_USER, settings.IMAP_PASSWORD)
mail.select('INBOX')

# Check for emails
status, messages = mail.search(None, 'ALL')
print(f"Found {len(messages[0].split())} emails")
mail.logout()
```

## Security Best Practices

1. **Never commit credentials** to version control
2. **Use App Passwords** instead of regular passwords when available
3. **Enable 2FA** on email accounts
4. **Use environment variables** or secure secret management
5. **Rotate credentials** regularly
6. **Monitor email logs** for unauthorized access

## Troubleshooting

### Common SMTP Issues
- **Authentication failed**: Check app password or enable "Less secure apps"
- **Connection refused**: Check firewall/port settings
- **TLS/SSL errors**: Try toggling between TLS and SSL

### Common IMAP Issues
- **Login failed**: Verify IMAP is enabled in email settings
- **Folder not found**: Check folder names (case-sensitive)
- **Connection timeout**: Verify port and SSL settings

## Email Flow in AI System

1. **Issue Created** → AI generates email → Sent via SMTP
2. **Vendor Replies** → Email received via IMAP → Stored in database
3. **AI Analyzes** → Generates response → Admin approves
4. **Approved Reply** → Sent via SMTP → Conversation continues

## Running the Email Processor

To automatically fetch and process incoming emails:

```bash
# Run as a management command
python manage.py process_incoming_emails

# Or run as a background task
python manage.py process_incoming_emails --continuous
```

## Support

For issues with email configuration:
1. Check the logs: `tail -f /root/buy2rent/backend/logs/email.log`
2. Verify credentials with email provider
3. Test with simple Python SMTP/IMAP scripts first
4. Ensure ports are not blocked by firewall
