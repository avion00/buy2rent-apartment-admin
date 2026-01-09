# SMTP Email Setup for AI Vendor Communication

## Quick Setup

### Step 1: Create .env file
Create `/root/buy2rent/backend/.env` with:

```bash
# OpenAI (you already set this via export)
OPENAI_API_KEY=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
USE_MOCK_AI=False

# SMTP Settings
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=procurement@buy2rent.eu
```

### Step 2: Gmail App Password (if using Gmail)
1. Go to https://myaccount.google.com/apppasswords
2. Generate an app password for "Mail"
3. Use this 16-character password for EMAIL_HOST_PASSWORD

### Step 3: Test SMTP Configuration
```bash
cd /root/buy2rent/backend
source myenv/bin/activate
python test_smtp.py
```

## Common SMTP Providers

### Gmail
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
```

### Outlook/Office365
```
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
```

### Yahoo
```
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
```

### SendGrid
```
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=your-sendgrid-api-key
```

## Testing Your Configuration

Run the test script:
```bash
python test_smtp.py
```

This will:
1. Test SMTP connection
2. Send a test email
3. Send an AI-style vendor email template

## Using in Production

Once SMTP is configured:

1. **Create an issue** in the system
2. **Activate AI Email** - The system will send email to vendor
3. **Vendor replies** will need manual entry (no IMAP)
4. **AI generates response** for your approval
5. **Approve and send** the AI response

## Troubleshooting

### Authentication Failed
- Use app password, not regular password
- Check EMAIL_HOST_USER is correct
- For Gmail, enable 2FA first

### Connection Refused
- Check EMAIL_PORT (usually 587 for TLS)
- Verify firewall allows outbound SMTP
- Try EMAIL_USE_SSL=True with port 465

### Email Not Sending
- Check DEFAULT_FROM_EMAIL is valid
- Verify EMAIL_USE_TLS matches provider requirements
- Look at Django logs for detailed errors

## Manual Vendor Response Entry

Since you're using SMTP only (no IMAP), vendor responses need manual entry:

```python
# Django shell command to add vendor response
python manage.py shell

from issues.models import Issue, AICommunicationLog
from django.utils import timezone

# Find the issue
issue = Issue.objects.get(id='issue-id-here')

# Add vendor response manually
vendor_response = AICommunicationLog.objects.create(
    issue=issue,
    sender='Vendor',
    message='Vendor response text here',
    message_type='email',
    subject='Re: Issue Report',
    email_from='vendor@example.com',
    status='received',
    timestamp=timezone.now()
)

print("Vendor response added successfully")
```

## Next Steps

1. Configure SMTP credentials in .env
2. Run test_smtp.py to verify
3. Set USE_MOCK_AI=False for real AI responses
4. Start using the system for vendor communications
