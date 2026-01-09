"""
IMAP Service for fetching and processing vendor email replies
Complete implementation with Issue UUID tracking
"""
import imaplib
import email
from email.header import decode_header
import re
from typing import Dict, List, Optional
from django.conf import settings
from django.utils import timezone
from .models import Issue, AICommunicationLog
from .ai_services_complete import ai_service
from .email_service import email_service
import asyncio
import logging

logger = logging.getLogger(__name__)


class IMAPService:
    """Service for fetching and processing vendor emails via IMAP"""
    
    def __init__(self):
        self.host = getattr(settings, 'IMAP_HOST', 'imap.gmail.com')
        self.port = getattr(settings, 'IMAP_PORT', 993)
        self.user = getattr(settings, 'EMAIL_HOST_USER', '')
        self.password = getattr(settings, 'EMAIL_HOST_PASSWORD', '')
        self.use_ssl = getattr(settings, 'IMAP_USE_SSL', True)
        self.inbox_folder = getattr(settings, 'IMAP_INBOX_FOLDER', 'INBOX')
        self.processed_folder = getattr(settings, 'IMAP_PROCESSED_FOLDER', 'Processed')
        self.mail = None
    
    def connect(self) -> bool:
        """Connect to IMAP server"""
        try:
            if self.use_ssl:
                self.mail = imaplib.IMAP4_SSL(self.host, self.port)
            else:
                self.mail = imaplib.IMAP4(self.host, self.port)
            
            self.mail.login(self.user, self.password)
            logger.info(f"Connected to IMAP server {self.host}")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to IMAP: {e}")
            return False
    
    def disconnect(self):
        """Disconnect from IMAP server"""
        if self.mail:
            try:
                self.mail.logout()
            except:
                pass
    
    def extract_issue_id(self, subject: str, body: str) -> Optional[str]:
        """
        Extract Issue UUID from email subject or body
        Looks for patterns like [Issue #uuid] or Issue #uuid
        """
        # UUID pattern
        uuid_pattern = r'[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}'
        
        # Patterns to search for
        patterns = [
            rf'\[Issue #({uuid_pattern})\]',  # [Issue #uuid]
            rf'Issue #({uuid_pattern})',       # Issue #uuid
            rf'Issue ID:\s*({uuid_pattern})',  # Issue ID: uuid
            rf'Reference:\s*Issue #({uuid_pattern})',  # Reference: Issue #uuid
            rf'issue-({uuid_pattern})',        # issue-uuid (from thread ID)
        ]
        
        # Check subject first
        for pattern in patterns:
            match = re.search(pattern, subject, re.IGNORECASE)
            if match:
                return match.group(1)
        
        # Check body
        for pattern in patterns:
            match = re.search(pattern, body, re.IGNORECASE)
            if match:
                return match.group(1)
        
        return None
    
    def parse_email(self, msg) -> Dict:
        """Parse email message and extract relevant data"""
        result = {
            'subject': '',
            'from': '',
            'to': '',
            'body': '',
            'date': None,
            'message_id': '',
            'in_reply_to': '',
        }
        
        # Extract headers
        try:
            # Subject
            subject_header = msg.get('Subject', '')
            if subject_header:
                decoded = decode_header(subject_header)
                subject_parts = []
                for part, encoding in decoded:
                    if isinstance(part, bytes):
                        subject_parts.append(part.decode(encoding or 'utf-8', errors='ignore'))
                    else:
                        subject_parts.append(str(part))
                result['subject'] = ' '.join(subject_parts)
            
            # From
            from_header = msg.get('From', '')
            if from_header:
                result['from'] = email.utils.parseaddr(from_header)[1]
            
            # To
            result['to'] = msg.get('To', '')
            
            # Date
            date_str = msg.get('Date', '')
            if date_str:
                try:
                    result['date'] = email.utils.parsedate_to_datetime(date_str)
                except:
                    result['date'] = timezone.now()
            
            # Message-ID and In-Reply-To
            result['message_id'] = msg.get('Message-ID', '')
            result['in_reply_to'] = msg.get('In-Reply-To', '')
            
        except Exception as e:
            logger.error(f"Error parsing email headers: {e}")
        
        # Extract body
        try:
            body_text = ''
            if msg.is_multipart():
                for part in msg.walk():
                    content_type = part.get_content_type()
                    if content_type == "text/plain":
                        payload = part.get_payload(decode=True)
                        if payload:
                            body_text = payload.decode('utf-8', errors='ignore')
                            break
                    elif content_type == "text/html" and not body_text:
                        # Fallback to HTML if no plain text
                        payload = part.get_payload(decode=True)
                        if payload:
                            body_text = payload.decode('utf-8', errors='ignore')
            else:
                payload = msg.get_payload(decode=True)
                if payload:
                    body_text = payload.decode('utf-8', errors='ignore')
            
            # Clean up quoted text and extract only new message
            body_text = self.extract_new_message(body_text.strip())
            result['body'] = body_text
        except Exception as e:
            logger.error(f"Error parsing email body: {e}")
            result['body'] = ''
        
        return result
    
    def extract_new_message(self, body: str) -> str:
        """Extract only the new message, removing quoted text and signatures"""
        if not body:
            return body
        
        # Normalize line endings
        body = body.replace('\r\n', '\n').replace('\r', '\n')
        
        # Split into lines
        lines = body.split('\n')
        new_message_lines = []
        
        for line in lines:
            stripped = line.strip()
            
            # Stop at Gmail-style reply marker "On ... wrote:"
            if re.match(r'^On .+wrote:\s*$', stripped, re.IGNORECASE):
                break
            
            # Stop at "From:" header
            if re.match(r'^From:\s*.+', stripped, re.IGNORECASE):
                break
            
            # Skip quoted lines (start with >)
            if stripped.startswith('>'):
                continue
            
            # Stop at common signature separators
            if stripped in ['--', '---', '___', '_______________']:
                break
            
            # Stop at "Sent from" (mobile signatures)
            if stripped.startswith('Sent from ') or stripped.startswith('Get Outlook for'):
                break
            
            # Add non-empty lines or preserve single blank lines
            if stripped or (new_message_lines and new_message_lines[-1].strip()):
                new_message_lines.append(line)
        
        # Join and clean up
        new_message = '\n'.join(new_message_lines).strip()
        
        # Remove excessive blank lines (more than 2 consecutive)
        new_message = re.sub(r'\n\n\n+', '\n\n', new_message)
        
        return new_message if new_message else body
    
    def process_vendor_email(self, email_data: Dict) -> bool:
        """
        Process a vendor email reply and update Issue
        Returns True if processed successfully
        """
        # Extract Issue ID
        issue_id = self.extract_issue_id(email_data['subject'], email_data['body'])
        
        if not issue_id:
            logger.warning(f"Could not extract Issue ID from email: {email_data['subject']}")
            return False
        
        try:
            issue = Issue.objects.get(id=issue_id)
        except Issue.DoesNotExist:
            logger.error(f"Issue {issue_id} not found")
            return False
        
        # Check if this email was already processed
        if email_data.get('message_id'):
            existing = AICommunicationLog.objects.filter(
                email_message_id=email_data['message_id']
            ).first()
            
            if existing:
                logger.info(f"Email already stored: {email_data['message_id']}")
                # Check if AI already replied to this vendor message
                ai_reply_exists = AICommunicationLog.objects.filter(
                    issue=issue,
                    sender='AI',
                    timestamp__gte=existing.timestamp
                ).exists()
                
                if ai_reply_exists:
                    logger.info(f"AI already replied to this email, skipping")
                    return True
                else:
                    logger.info(f"No AI reply yet, generating one now")
                    vendor_log = existing
        
        # Store vendor response if not already stored
        if not email_data.get('message_id') or not existing:
            vendor_log = AICommunicationLog.objects.create(
                issue=issue,
                sender='Vendor',
                message=email_data['body'],
                message_type='email',
                subject=email_data['subject'],
                email_from=email_data['from'],
                email_to=email_data['to'],
                email_message_id=email_data['message_id'],
                in_reply_to=email_data.get('in_reply_to', ''),
                status='received',
                email_thread_id=f'issue-{issue.id}',
                timestamp=email_data['date'] or timezone.now()
            )
            
            # Update issue
            issue.vendor_last_replied_at = timezone.now()
            issue.save()
            
            logger.info(f"Stored vendor response for issue {issue_id}")
        
        # Run AI analysis and generate summary
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            # Prepare issue data
            issue_data = {
                'issue_id': str(issue.id),
                'vendor_name': issue.vendor.name if issue.vendor else 'Vendor',
                'type': issue.type,
                'priority': issue.priority,
                'product_name': issue.get_product_name()
            }
            
            # Analyze vendor response
            analysis = loop.run_until_complete(
                ai_service.analyze_vendor_reply(issue_data, email_data['body'])
            )
            
            logger.info(f"AI Analysis for issue {issue_id}: {analysis}")
            
            # Update issue based on analysis
            if analysis.get('escalation'):
                issue.status = 'Escalated'
                issue.priority = 'Critical'
                logger.warning(f"Issue {issue_id} escalated based on AI analysis")
            elif analysis.get('intent') in ['accepting_responsibility', 'proposing_solution']:
                issue.status = 'Resolution Agreed'
                logger.info(f"Issue {issue_id} status updated to Resolution Agreed")
            
            # Generate conversation summary
            conversation_history = list(AICommunicationLog.objects.filter(
                issue=issue,
                message_type='email'
            ).order_by('timestamp').values('sender', 'message', 'timestamp'))
            
            summary_result = loop.run_until_complete(
                ai_service.generate_conversation_summary(conversation_history)
            )
            
            # Update issue with summary
            issue.last_summary = summary_result.get('summary', '')
            issue.next_action = summary_result.get('next_action', '')
            issue.last_summary_at = timezone.now()
            issue.save()
            
            logger.info(f"Updated conversation summary for issue {issue_id}")
            
            # Generate AI draft reply (pending approval)
            draft_result = loop.run_until_complete(
                ai_service.draft_reply(issue_data, conversation_history, email_data['body'])
            )
            
            if draft_result.get('success'):
                confidence = draft_result.get('confidence', 0.8)
                auto_approve = getattr(settings, 'AI_EMAIL_AUTO_APPROVE', False)
                confidence_threshold = getattr(settings, 'AI_EMAIL_CONFIDENCE_THRESHOLD', 0.8)
                
                # Get reply text from draft_result
                reply_text = draft_result.get('reply', draft_result.get('body', ''))
                reply_subject = f"Re: Issue #{issue.id}"
                
                # Check if we should auto-send or create draft
                should_auto_send = auto_approve and confidence >= confidence_threshold
                
                if should_auto_send:
                    # Auto-send the AI reply
                    from .email_service import email_service
                    
                    subject = reply_subject
                    body = f"{reply_text}\n\n---\nReference: Issue #{issue.id}\nPlease keep this reference in your reply."
                    
                    try:
                        email_message_id = email_service.send_issue_email(issue, subject, body)
                        logger.info(f"Auto-sent AI reply for issue {issue_id} (confidence: {confidence})")
                    except Exception as e:
                        logger.error(f"Failed to auto-send AI reply for issue {issue_id}: {e}")
                else:
                    # Create draft for manual approval
                    AICommunicationLog.objects.create(
                        issue=issue,
                        sender='AI',
                        message=reply_text,
                        message_type='email',
                        subject=reply_subject,
                        email_from=settings.DEFAULT_FROM_EMAIL,
                        email_to=issue.vendor.email if issue.vendor else '',
                        ai_generated=True,
                        ai_confidence=confidence,
                        status='pending_approval',
                        requires_approval=True,
                        email_thread_id=f'issue-{issue.id}'
                    )
                    logger.info(f"Created AI draft reply for issue {issue_id} (requires approval, confidence: {confidence})")
            
            loop.close()
            
            # Create notification for admins if escalation or low confidence
            if analysis.get('escalation') or analysis.get('confidence', 1.0) < 0.7:
                from notifications.models import Notification
                from accounts.models import User
                
                admins = User.objects.filter(is_superuser=True)
                for admin in admins:
                    Notification.objects.create(
                        user=admin,
                        title=f"Issue #{issue.id} Requires Attention",
                        message=f"Vendor response received. {analysis.get('suggested_next_action', 'Review required.')}",
                        notification_type='issue',
                        priority='high' if analysis.get('escalation') else 'medium',
                        related_object_type='Issue',
                        related_object_id=str(issue.id)
                    )
            
        except Exception as e:
            logger.error(f"Error in AI processing for issue {issue_id}: {e}")
        
        return True
    
    def fetch_new_emails(self) -> List[Dict]:
        """Fetch new emails from inbox and process them"""
        if not self.mail:
            if not self.connect():
                return []
        
        emails_processed = []
        
        try:
            # Select inbox
            self.mail.select(self.inbox_folder)
            
            # Search for unread emails or recent emails
            from datetime import datetime, timedelta
            yesterday = (datetime.now() - timedelta(days=1)).strftime("%d-%b-%Y")
            
            # Search for recent emails
            status_code, messages = self.mail.search(None, f'(SINCE "{yesterday}")')
            
            if status_code != 'OK':
                logger.error("Failed to search emails")
                return emails_processed
            
            email_ids = messages[0].split()
            logger.info(f"Found {len(email_ids)} emails to check")
            
            for email_id in email_ids:
                try:
                    # Fetch email
                    status_code, msg_data = self.mail.fetch(email_id, '(RFC822)')
                    
                    if status_code != 'OK':
                        continue
                    
                    # Parse email
                    raw_email = msg_data[0][1]
                    msg = email.message_from_bytes(raw_email)
                    email_data = self.parse_email(msg)
                    
                    # Skip emails from our own system
                    if email_data['from'] and 'buy2rent.eu' in email_data['from'].lower():
                        continue
                    
                    # Check if email has Issue ID
                    issue_id = self.extract_issue_id(email_data['subject'], email_data['body'])
                    
                    if issue_id:
                        # Process vendor email
                        if self.process_vendor_email(email_data):
                            emails_processed.append(email_data)
                            logger.info(f"Processed email for Issue {issue_id}")
                            
                            # Mark as seen
                            self.mail.store(email_id, '+FLAGS', '\\Seen')
                
                except Exception as e:
                    logger.error(f"Error processing email {email_id}: {e}")
                    continue
            
        except Exception as e:
            logger.error(f"Error fetching emails: {e}")
        
        return emails_processed
    
    def test_connection(self) -> bool:
        """Test IMAP connection and list folders"""
        if self.connect():
            try:
                status_code, folders = self.mail.list()
                if status_code == 'OK':
                    logger.info("IMAP connection successful. Available folders:")
                    for folder in folders:
                        logger.info(f"  - {folder.decode()}")
                    return True
            except Exception as e:
                logger.error(f"IMAP test failed: {e}")
            finally:
                self.disconnect()
        
        return False


# Singleton instance
imap_service = IMAPService()
