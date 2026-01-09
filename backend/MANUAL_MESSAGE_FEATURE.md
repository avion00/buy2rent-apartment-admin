# Manual Message Feature - Communication Log

## Feature Overview
Admins can now send messages directly to vendors from the Communication Log input field. Messages are sent via email and appear in the conversation history with "Admin" as the sender.

---

## How It Works

### **Frontend Flow:**
1. Admin types message in Communication Log input field
2. Clicks Send button or presses Enter
3. Message is sent to backend API
4. Email is sent to vendor
5. Message appears in Communication Log with "Admin" sender
6. Success notification shown

### **Backend Flow:**
1. Receives message via `/api/issues/{id}/send_manual_message/` endpoint
2. Creates `AICommunicationLog` entry with:
   - `sender='Admin'`
   - `status='sent'`
   - `message_type='email'`
   - `ai_generated=False`
3. Sends email to vendor with:
   - Subject: `[Issue #{UUID}] Re: Issue #{UUID}`
   - Body: Message + Issue UUID reference
4. Updates issue status to 'Pending Vendor Response' if currently 'Open'
5. Returns success response

---

## Implementation Details

### **Frontend Changes**

**File:** `/root/buy2rent/frontend/src/components/issues/AIConversationPanel.tsx`

**Updated `handleSendMessage` function:**
```typescript
const handleSendMessage = async () => {
  if (!newMessage.trim()) return;

  setIsAIProcessing(true);

  try {
    // Send message to vendor via email
    await issueApi.sendManualMessage(issue.id, {
      subject: `Re: Issue #${issue.id}`,
      message: newMessage,
      to_email: issue.vendor_details?.email || issue.vendor_details?.email
    });

    // Refresh conversation to show the sent message
    const data = await issueApi.getConversation(issue.id);
    setConversation(data.conversation || []);
    
    setNewMessage('');
    toast.success('Message sent to vendor successfully');
  } catch (error: any) {
    console.error('Failed to send message:', error);
    toast.error(error.response?.data?.message || 'Failed to send message to vendor');
  } finally {
    setIsAIProcessing(false);
  }
};
```

**API Service:**
```typescript
// Already exists in /root/buy2rent/frontend/src/services/issueApi.ts
sendManualMessage: async (issueId: string, data: {
  subject: string;
  message: string;
  to_email?: string;
}) => {
  const response = await axiosInstance.post(`/issues/${issueId}/send_manual_message/`, data);
  return response.data;
}
```

---

### **Backend Changes**

**File:** `/root/buy2rent/backend/issues/views.py`

**Endpoint:** `POST /api/issues/{id}/send_manual_message/`

**Updated implementation:**
```python
@action(detail=True, methods=['post'])
def send_manual_message(self, request, pk=None):
    """Send a manual message to vendor without AI processing"""
    issue = self.get_object()
    
    # Ensure Issue ID is in subject
    subject = request.data.get('subject', f'Re: Issue #{issue.id}')
    if f'Issue #{issue.id}' not in subject and f'[Issue #{issue.id}]' not in subject:
        subject = f'[Issue #{issue.id}] {subject}'
    
    message = request.data.get('message', '')
    to_email = request.data.get('to_email', issue.vendor.email if issue.vendor else '')
    
    if not message:
        return Response({'success': False, 'message': 'Message content is required'}, status=400)
    
    if not to_email:
        return Response({'success': False, 'message': 'Vendor email is required'}, status=400)
    
    try:
        # Create communication log for manual message
        from issues.models import AICommunicationLog
        log = AICommunicationLog.objects.create(
            issue=issue,
            sender='Admin',
            message=message,
            message_type='email',
            subject=subject,
            email_from=settings.DEFAULT_FROM_EMAIL,
            email_to=to_email,
            ai_generated=False,
            status='sent',
            requires_approval=False,
            email_thread_id=f"issue-{issue.id}"
        )
        
        # Send the email with Issue UUID reference
        from django.core.mail import send_mail
        email_body = f"{message}\n\n---\nReference: Issue #{issue.id}\nPlease keep this reference in your reply."
        
        send_mail(
            subject=subject,
            message=email_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[to_email],
            fail_silently=False,
        )
        
        # Update issue status if needed
        if issue.status == 'Open':
            issue.status = 'Pending Vendor Response'
            issue.save()
        
        return Response({
            'success': True,
            'message': 'Manual message sent successfully',
            'log_id': str(log.id)
        })
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Failed to send message: {str(e)}'
        }, status=500)
```

---

## Email Format

### **Subject:**
```
[Issue #e3dac2e6-d0fd-4af0-bc3d-f8047bacfe8b] Re: Issue #e3dac2e6-d0fd-4af0-bc3d-f8047bacfe8b
```

### **Body:**
```
{Admin's message content}

---
Reference: Issue #e3dac2e6-d0fd-4af0-bc3d-f8047bacfe8b
Please keep this reference in your reply.
```

### **From:**
```
chaudharyamic@gmail.com
```

### **To:**
```
{vendor.email}
```

---

## Communication Log Display

### **Message Appearance:**
- **Sender Badge:** "Admin" (blue badge)
- **Icon:** User icon
- **Background:** Muted background
- **Status:** "sent"
- **Timestamp:** Current date/time

### **Example:**
```
┌─────────────────────────────────────────────┐
│ 👤 Admin                  12/25/2025, 8:15 AM│
│                                               │
│ Please provide an update on the replacement  │
│ product delivery timeline.                    │
└─────────────────────────────────────────────┘
```

---

## User Experience

### **Before:**
- Messages added to local log only
- No email sent to vendor
- Vendor never received the message
- Manual email required outside system

### **After:**
- Message sent directly to vendor via email ✅
- Appears in Communication Log immediately ✅
- Marked as "Admin" sender ✅
- Includes Issue UUID for tracking ✅
- Vendor receives email in inbox ✅
- Issue status updated automatically ✅

---

## Testing

### **Test Scenario:**
1. Navigate to Issue Details page
2. Go to "Communication Log" tab
3. Type message: "Please provide delivery update"
4. Click Send button
5. **Expected Results:**
   - ✅ Success toast: "Message sent to vendor successfully"
   - ✅ Message appears in log with "Admin" badge
   - ✅ Vendor receives email at their registered email
   - ✅ Email includes Issue UUID reference
   - ✅ Issue status changes to "Pending Vendor Response"

### **Verify Email:**
1. Check vendor's Gmail inbox
2. Email subject should contain `[Issue #{UUID}]`
3. Email body should contain message + Issue UUID reference
4. Email from: `chaudharyamic@gmail.com`

---

## Error Handling

### **Frontend:**
- Empty message: Prevented (button disabled)
- API error: Toast error with message
- Network error: Toast error "Failed to send message to vendor"

### **Backend:**
- Missing message: 400 error "Message content is required"
- Missing vendor email: 400 error "Vendor email is required"
- Email send failure: 500 error with exception details
- All errors logged to console/logs

---

## API Reference

### **Endpoint:**
```
POST /api/issues/{issue_id}/send_manual_message/
```

### **Request Body:**
```json
{
  "subject": "Re: Issue #e3dac2e6-d0fd-4af0-bc3d-f8047bacfe8b",
  "message": "Please provide delivery update",
  "to_email": "vendor@example.com"  // Optional, defaults to issue.vendor.email
}
```

### **Response (Success):**
```json
{
  "success": true,
  "message": "Manual message sent successfully",
  "log_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### **Response (Error):**
```json
{
  "success": false,
  "message": "Failed to send message: {error details}"
}
```

---

## Status: ✅ FULLY IMPLEMENTED

**Changes Applied:**
1. ✅ Frontend: Updated `AIConversationPanel.tsx` to send messages via API
2. ✅ Backend: Enhanced `send_manual_message` endpoint with Issue UUID reference
3. ✅ Email: Includes Issue UUID in subject and body
4. ✅ Communication Log: Shows messages with "Admin" sender
5. ✅ Status Update: Automatically updates issue to "Pending Vendor Response"

**The feature is now ready to use!** 🎉

Admins can send messages directly to vendors from the Communication Log, and all messages are properly tracked and sent via email.
