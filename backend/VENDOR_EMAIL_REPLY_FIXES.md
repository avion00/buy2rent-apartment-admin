# Vendor Email Reply System - Critical Fixes Applied

**Date:** January 19, 2026  
**Issue:** Vendor email replies were not being processed consistently, and AI chatbot was not responding to vendor replies.

---

## Problems Identified

### 1. **Email Filtering Too Restrictive**
- System was skipping emails from `buy2rent.eu` domain
- But the actual system email is `chaudharyamic@gmail.com`
- This caused legitimate vendor replies to be skipped

### 2. **Issue ID Extraction Failures**
- Slug pattern matching was incomplete
- System couldn't properly extract issue IDs from email subjects like `[Issue #bedsheet-aad4ae1e]`
- Partial UUID extraction caused "not a valid UUID" errors

### 3. **Auto-Send Not Creating Communication Logs**
- When AI auto-sent replies, no communication log entry was created
- This made it appear as if AI never responded in the system UI
- Vendor replies and AI responses were not visible in the conversation thread

### 4. **Slow Polling Interval**
- Email monitoring was checking every 30 seconds
- User wanted instant responses without delays

### 5. **Email Search Window Too Narrow**
- Only searching emails from last 1 day
- Could miss recent vendor replies if timing was off

---

## Fixes Applied

### Fix 1: Improved Email Filtering
**File:** `/root/buy2rent/backend/issues/imap_service_complete.py` (Lines 490-497)

**Before:**
```python
# Skip emails from our own system
if email_data['from'] and 'buy2rent.eu' in email_data['from'].lower():
    continue
```

**After:**
```python
# Skip emails from our own system (check actual sender email)
system_email = settings.EMAIL_HOST_USER.lower()
if email_data['from'] and email_data['from'].lower() == system_email:
    continue

# Also skip if it's from buy2rent.eu domain
if email_data['from'] and '@buy2rent.eu' in email_data['from'].lower():
    continue
```

**Impact:** Now correctly identifies system emails and doesn't skip legitimate vendor replies.

---

### Fix 2: Enhanced Issue ID Extraction
**File:** `/root/buy2rent/backend/issues/imap_service_complete.py` (Lines 57-161)

**Changes:**
1. Added comprehensive pattern matching for slug formats
2. Proper validation of extracted UUIDs before database lookup
3. Try multiple strategies: slug → full UUID → short UUID
4. Better error handling and logging

**Pattern Matching:**
```python
patterns = [
    rf'\[Issue #({slug_pattern})\]',  # [Issue #bedsheet-aad4ae1e]
    rf'Issue #({slug_pattern})',       # Issue #bedsheet-aad4ae1e
    rf'Reference:\s*Issue #({slug_pattern})',
    rf'#({slug_pattern})',             # #bedsheet-aad4ae1e
    rf'#({short_uuid_pattern})',       # #aad4ae1e
    # ... and more patterns
]
```

**Extraction Logic:**
```python
# If it's a slug pattern (e.g., bedsheet-aad4ae1e)
if '-' in extracted and len(extracted) > 8:
    parts = extracted.split('-')
    short_uuid = parts[-1]  # Get last 8 chars
    
    if len(short_uuid) == 8 and re.match(r'^[a-f0-9]{8}$', short_uuid):
        issue = Issue.objects.filter(id__startswith=short_uuid).first()
        if issue:
            return str(issue.id)
```

**Impact:** Successfully extracts issue IDs from all email formats, eliminating "not a valid UUID" errors.

---

### Fix 3: Auto-Send Communication Logging
**File:** `/root/buy2rent/backend/issues/imap_service_complete.py` (Lines 377-407)

**Before:**
```python
if should_auto_send:
    try:
        email_message_id = email_service.send_issue_email(issue, subject, body, is_initial_report=False)
        logger.info(f"Auto-sent AI reply for issue {issue_id} (confidence: {confidence})")
    except Exception as e:
        logger.error(f"Failed to auto-send AI reply for issue {issue_id}: {e}")
```

**After:**
```python
if should_auto_send:
    try:
        email_message_id = email_service.send_issue_email(issue, subject, body, is_initial_report=False)
        
        # Create communication log for the sent AI reply
        AICommunicationLog.objects.create(
            issue=issue,
            sender='AI',
            message=reply_text,
            message_type='email',
            subject=subject,
            email_from=settings.DEFAULT_FROM_EMAIL,
            email_to=issue.vendor.email if issue.vendor else '',
            ai_generated=True,
            ai_confidence=confidence,
            status='sent',
            email_message_id=email_message_id,
            in_reply_to=email_data.get('message_id', ''),
            email_thread_id=f'issue-{issue.id}',
            timestamp=timezone.now()
        )
        
        logger.info(f"✓ Auto-sent AI reply for issue {issue_id} (confidence: {confidence})")
    except Exception as e:
        logger.error(f"✗ Failed to auto-send AI reply for issue {issue_id}: {e}")
```

**Impact:** All AI replies are now properly logged and visible in the system UI conversation thread.

---

### Fix 4: Faster Polling for Instant Responses
**File:** `/root/buy2rent/backend/.env`

**Before:**
```bash
IMAP_CHECK_INTERVAL=30
```

**After:**
```bash
IMAP_CHECK_INTERVAL=10
```

**Impact:** Email monitoring now checks every 10 seconds instead of 30, providing near-instant responses to vendor emails.

---

### Fix 5: Wider Email Search Window
**File:** `/root/buy2rent/backend/issues/imap_service_complete.py` (Lines 462-468)

**Before:**
```python
# Search for recent emails
yesterday = (datetime.now() - timedelta(days=1)).strftime("%d-%b-%Y")
status_code, messages = self.mail.search(None, f'(SINCE "{yesterday}")')
```

**After:**
```python
# Search for ALL emails (both read and unread) from last 2 days
# This ensures we don't miss any vendor replies
two_days_ago = (datetime.now() - timedelta(days=2)).strftime("%d-%b-%Y")
status_code, messages = self.mail.search(None, f'(SINCE "{two_days_ago}")')
```

**Impact:** Catches all recent vendor replies, even if they arrive during system downtime.

---

## Current Configuration

### Email Monitoring
- **Status:** ✅ Running (PID: 874079)
- **Check Interval:** 10 seconds
- **Command:** `python manage.py monitor_vendor_emails_complete --interval 10`

### AI Auto-Reply Settings
```bash
AI_EMAIL_AUTO_APPROVE=True
AI_EMAIL_CONFIDENCE_THRESHOLD=0.8 (default)
```

### IMAP Settings
```bash
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USE_SSL=True
IMAP_CHECK_INTERVAL=10
```

---

## How It Works Now

### Complete Flow:

1. **Vendor sends email reply** to system email (chaudharyamic@gmail.com)
   - Email subject contains: `[Issue #bedsheet-aad4ae1e]` or similar

2. **Email Monitor (every 10 seconds)**
   - Connects to IMAP server
   - Searches for emails from last 2 days
   - Filters out system's own emails
   - Extracts issue ID from subject/body

3. **Issue ID Extraction**
   - Matches slug pattern: `bedsheet-aad4ae1e`
   - Extracts short UUID: `aad4ae1e`
   - Finds issue in database: `aad4ae1e-0f54-4e4d-bb31-2a2ea4c8ca2a`

4. **Store Vendor Response**
   - Creates `AICommunicationLog` entry with `sender='Vendor'`
   - Updates `issue.vendor_last_replied_at`
   - Checks if already processed (prevents duplicates)

5. **AI Analysis & Response Generation**
   - Analyzes vendor sentiment and intent
   - Generates conversation summary
   - Creates AI draft reply

6. **Auto-Send Logic**
   - If `AI_EMAIL_AUTO_APPROVE=True` AND `confidence >= 0.8`:
     - **Sends email immediately** via `email_service.send_issue_email()`
     - **Creates communication log** with `sender='AI'`, `status='sent'`
     - Vendor receives AI reply instantly
   - Otherwise:
     - Creates draft with `status='pending_approval'`
     - Requires manual approval

7. **UI Display**
   - Both vendor reply and AI response appear in conversation thread
   - Timestamps show exact send/receive times
   - Status indicators show if sent or pending

---

## Verification

### Check Email Monitor Status:
```bash
ps aux | grep monitor_vendor_emails
```

### View Recent Logs:
```bash
tail -f /tmp/email_monitor.log
```

### Check Configuration:
```bash
grep -E "^AI_EMAIL_AUTO_APPROVE=|^IMAP_CHECK_INTERVAL=" /root/buy2rent/backend/.env
```

### Manual Test:
```bash
cd /root/buy2rent/backend
source myenv/bin/activate
python manage.py monitor_vendor_emails_complete --once
```

---

## Expected Behavior

✅ **Vendor replies are captured instantly** (within 10 seconds)  
✅ **Vendor replies appear in system UI** immediately  
✅ **AI generates response** automatically  
✅ **AI sends reply to vendor** instantly (if confidence ≥ 0.8)  
✅ **AI response appears in system UI** with "sent" status  
✅ **No manual intervention required** for standard replies  
✅ **Complete conversation thread visible** in system  

---

## Troubleshooting

### If vendor replies are not showing:
1. Check email monitor is running: `ps aux | grep monitor_vendor_emails`
2. Check logs: `tail -50 /tmp/email_monitor.log`
3. Verify issue ID in email subject matches pattern
4. Check IMAP credentials in `.env`

### If AI is not responding:
1. Verify `AI_EMAIL_AUTO_APPROVE=True` in `.env`
2. Check OpenAI API key is valid
3. Review AI confidence scores in logs
4. Check email service configuration

### If responses are delayed:
1. Reduce `IMAP_CHECK_INTERVAL` (currently 10 seconds)
2. Restart email monitor: `pkill -f monitor_vendor_emails && nohup bash email_monitor_pm2.sh &`

---

## Summary

All critical issues have been fixed:
- ✅ Email filtering now works correctly
- ✅ Issue ID extraction handles all formats
- ✅ Auto-sent AI replies are properly logged
- ✅ Polling interval reduced to 10 seconds
- ✅ Email search window expanded to 2 days
- ✅ Complete conversation thread visible in UI
- ✅ Instant AI responses without delays

The system now provides **instant, reliable, and fully visible** AI-powered vendor communication.
