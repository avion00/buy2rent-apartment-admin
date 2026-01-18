# Professional Email Templates Implementation

## Overview
The issue reporting system now sends **professional HTML-formatted emails** to vendors, similar to modern SaaS platforms like Blanxer. The emails feature a clean, branded design with proper styling and structure.

## What Changed

### Before
- Plain text emails with basic formatting
- No branding or visual appeal
- Poor readability on mobile devices
- Unprofessional appearance

### After
- **Professional HTML emails** with modern design
- **Buy2Rent branding** with logo and colors
- **Responsive layout** that works on all devices
- **Structured information** with clear sections
- **Priority badges** with color coding (Critical, High, Medium, Low)
- **Professional footer** with reference tracking

## Email Templates

### 1. Issue Report Email (`issue_report.html`)
Used when initially reporting an issue to a vendor.

**Features:**
- Buy2Rent branded header with logo
- Dark banner with "Issue Report" title
- Structured issue details section with:
  - Issue ID
  - Issue Type
  - Priority (with color-coded badge)
  - Product name
  - Order reference
  - Reported date
- Description box with the issue details
- Impact notification (if applicable)
- Professional opening and closing messages (AI-generated)
- Call-to-action button to reply
- Footer with issue reference for tracking

**Color Scheme:**
- Header: Dark gray (#2c3e50)
- Banner: Slate gray (#34495e)
- Info section: Light blue border (#3498db)
- Priority badges:
  - Critical: Red (#e74c3c)
  - High: Orange (#e67e22)
  - Medium: Yellow (#f39c12)
  - Low: Gray (#95a5a6)

### 2. Issue Reply Email (`issue_reply.html`)
Used for follow-up messages in an existing issue thread.

**Features:**
- Buy2Rent branded header
- Green banner indicating it's a reply
- Clean message body
- Issue reference footer
- Professional footer

### 3. Manual Message Email (`manual_message.html`)
Used when admins send manual messages to vendors.

**Features:**
- Buy2Rent branded header
- Simple, clean layout
- Message body with preserved formatting
- Issue reference footer
- Professional footer

## Technical Implementation

### Email Service (`/backend/issues/email_service.py`)

The `EmailService` class now uses Django's template system to render HTML emails:

```python
# Render HTML template
html_content = render_to_string('emails/issue_report.html', context)

# Create plain text version (for email clients that don't support HTML)
plain_text = strip_tags(html_content)

# Send as multipart email (HTML + plain text)
email = EmailMultiAlternatives(
    subject=subject,
    body=plain_text,
    from_email=self.from_email,
    to=[vendor_email],
)
email.attach_alternative(html_content, "text/html")
```

### AI Service (`/backend/issues/ai_services.py`)

The AI service now generates **structured content** for the HTML templates:

```python
{
    'subject': 'Issue Report: Broken/Damaged',
    'opening_message': 'We are writing to report an issue...',
    'closing_message': 'We kindly request your urgent attention...',
    'confidence': 0.95
}
```

This structured approach allows the HTML template to properly format the content with:
- Professional greeting
- AI-generated opening paragraph
- Structured issue details (from database)
- AI-generated closing paragraph
- Professional signature

### Views (`/backend/issues/views.py`)

Updated to pass the correct parameters:

```python
email_service.send_issue_email(
    issue=issue,
    subject=subject,
    body=body,
    is_initial_report=True,  # Use detailed template
    ai_data=result           # Pass AI-generated content
)
```

## Email Flow

### 1. Issue Creation
```
User creates issue → AI generates email content → HTML template renders → Email sent to vendor
```

### 2. Vendor Reply
```
Vendor replies → System detects reply → AI generates response → HTML template renders → Email sent
```

### 3. Manual Message
```
Admin writes message → HTML template renders → Email sent to vendor
```

## Template Variables

### Issue Report Template
- `vendor_name`: Vendor company name
- `issue_id`: Unique issue identifier
- `issue_type`: Type of issue (e.g., "Broken/Damaged")
- `priority`: Priority level (Critical/High/Medium/Low)
- `priority_class`: CSS class for priority badge styling
- `product_name`: Name of the affected product
- `order_reference`: Order number/reference
- `reported_date`: Date the issue was reported
- `description`: Detailed issue description
- `impact`: Business impact (optional)
- `opening_message`: AI-generated opening paragraph
- `closing_message`: AI-generated closing paragraph
- `reply_email`: Email address for replies

### Reply Template
- `vendor_name`: Vendor company name
- `issue_id`: Unique issue identifier
- `message_body`: The reply message content

### Manual Message Template
- `vendor_name`: Vendor company name
- `issue_id`: Unique issue identifier
- `message_body`: The manual message content

## Benefits

### For Vendors
✅ **Professional appearance** builds trust and credibility
✅ **Clear structure** makes it easy to understand the issue
✅ **Mobile-friendly** design works on all devices
✅ **Priority indicators** help prioritize responses
✅ **Reference tracking** makes it easy to reply to the correct issue

### For Your Team
✅ **Consistent branding** across all communications
✅ **Automated formatting** - no manual email composition
✅ **AI-generated content** saves time
✅ **Professional image** improves vendor relationships
✅ **Better tracking** with embedded issue IDs

### For the System
✅ **Structured data** enables better analytics
✅ **Template-based** approach is easy to maintain
✅ **Multipart emails** ensure compatibility
✅ **Plain text fallback** for older email clients

## Customization

### Changing Colors
Edit the CSS in the template files:
- `/root/buy2rent/backend/templates/emails/issue_report.html`
- `/root/buy2rent/backend/templates/emails/issue_reply.html`
- `/root/buy2rent/backend/templates/emails/manual_message.html`

### Changing Logo/Branding
Update the header section in each template:
```html
<div class="header">
    <h1 class="logo">Buy2Rent</h1>
    <div class="logo-subtitle">Procurement System</div>
</div>
```

### Changing Email Content
The AI generates the opening and closing messages. To customize the AI behavior, edit:
- `/root/buy2rent/backend/issues/ai_services.py`
- Modify the `prompt` in the `generate_issue_email` method

## Testing

### Test Email Sending
1. Create a test issue with a vendor
2. Check the vendor's email inbox
3. Verify the HTML formatting appears correctly
4. Test on mobile devices

### Test AI Content Generation
1. Enable AI: Set `USE_MOCK_AI=False` in `.env`
2. Add OpenAI API key: `OPENAI_API_KEY=sk-proj-...`
3. Create an issue and check the generated content

### Test Manual Messages
1. Go to an issue detail page
2. Send a manual message
3. Verify HTML formatting in vendor's inbox

## Troubleshooting

### Emails Appear as Plain Text
- Check that the email client supports HTML
- Verify the `EmailMultiAlternatives` is being used
- Check email headers for `Content-Type: text/html`

### Template Not Found Error
```
TemplateDoesNotExist: emails/issue_report.html
```
**Solution:** Ensure templates are in `/root/buy2rent/backend/templates/emails/`

### AI Content Not Structured
**Solution:** Update AI service to return `opening_message` and `closing_message` fields

### Styling Issues
- Check CSS in the `<style>` section of templates
- Test in different email clients (Gmail, Outlook, etc.)
- Use inline styles for better compatibility

## Files Modified

### Created
- `/root/buy2rent/backend/templates/emails/issue_report.html`
- `/root/buy2rent/backend/templates/emails/issue_reply.html`
- `/root/buy2rent/backend/templates/emails/manual_message.html`

### Modified
- `/root/buy2rent/backend/issues/email_service.py`
- `/root/buy2rent/backend/issues/ai_services.py`
- `/root/buy2rent/backend/issues/views.py`

## Next Steps

1. ✅ Templates created
2. ✅ Email service updated
3. ✅ AI service enhanced
4. ✅ Views updated
5. 🔄 Restart backend server
6. 🔄 Test with real issue creation
7. 🔄 Verify vendor receives professional email

## Support

For issues or questions about the email system:
1. Check the logs: `tail -f /root/buy2rent/logs/backend-dev.log`
2. Test email sending manually
3. Verify SMTP configuration in `.env`
4. Check Django email settings in `config/settings.py`
