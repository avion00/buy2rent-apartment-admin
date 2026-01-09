"""
IMAP Email Service for fetching and processing vendor replies
"""
import imaplib
import email
from email.header import decode_header
import re
from typing import Dict, List, Optional
from django.conf import settings
from django.utils import timezone
from .models import Issue, AICommunicationLog
from .ai_services import ai_manager
import asyncio
import logging

logger = logging.getLogger(__name__)


class IMAPEmailService:
    """Service for fetching and processing emails via IMAP"""
    
    def __init__(self):
        self.host = settings.IMAP_HOST
        self.port = settings.IMAP_PORT
        self.user = settings.IMAP_USER
        self.password = settings.IMAP_PASSWORD
        self.use_ssl = settings.IMAP_USE_SSL
        self.inbox_folder = settings.IMAP_INBOX_FOLDER
        self.processed_folder = getattr(settings, 'IMAP_PROCESSED_FOLDER', 'Processed')
        self.mail = None
    
    def connect(self):
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
    
    def create_processed_folder(self):
        """Create processed folder if it doesn't exist"""
        try:
            self.mail.create(self.processed_folder)
            logger.info(f"Created folder: {self.processed_folder}")
        except:
            # Folder might already exist
            pass
    
    def extract_issue_id(self, subject: str, body: str) -> Optional[str]:
        """Extract issue ID from email subject or body"""
        # Look for issue ID patterns
        patterns = [
            r'Issue #([a-f0-9-]{36})',  # UUID format
            r'Issue ID:\s*([a-f0-9-]{36})',
            r'Reference:\s*([a-f0-9-]{36})',
            r'\[Issue:\s*([a-f0-9-]{36})\]',
            r'issue-([a-f0-9-]{36})',  # From email thread ID
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
        
        # If no UUID found, try to find the most recent issue with this subject pattern
        if 'Quality Issue' in subject or 'Issue' in subject:
            from .models import Issue, AICommunicationLog
            # Find issues with similar email subjects
            recent_emails = AICommunicationLog.objects.filter(
                message_type='email',
                subject__icontains=subject.replace('Re: ', '').replace('RE: ', '').strip()[:30]
            ).order_by('-timestamp')[:1]
            
            if recent_emails:
                return str(recent_emails[0].issue.id)
        
        return None
    
    def parse_email(self, msg) -> Dict:
        """Parse email message"""
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
        for header in ['Subject', 'From', 'To', 'Date', 'Message-ID', 'In-Reply-To']:
            value = msg.get(header, '')
            if value:
                if header == 'Subject':
                    decoded = decode_header(value)
                    result['subject'] = str(decoded[0][0], decoded[0][1] or 'utf-8') if isinstance(decoded[0][0], bytes) else decoded[0][0]
                elif header == 'From':
                    result['from'] = email.utils.parseaddr(value)[1]
                elif header == 'To':
                    result['to'] = value
                elif header == 'Date':
                    result['date'] = email.utils.parsedate_to_datetime(value)
                elif header == 'Message-ID':
                    result['message_id'] = value
                elif header == 'In-Reply-To':
                    result['in_reply_to'] = value
        
        # Extract body
        body_text = ''
        if msg.is_multipart():
            for part in msg.walk():
                if part.get_content_type() == "text/plain":
                    try:
                        body_text = part.get_payload(decode=True).decode('utf-8', errors='ignore')
                        break
                    except:
                        continue
        else:
            try:
                body_text = msg.get_payload(decode=True).decode('utf-8', errors='ignore')
            except:
                body_text = str(msg.get_payload())
        
        result['body'] = body_text.strip()
        return result
    
    def process_vendor_email(self, email_data: Dict) -> bool:
        """Process a vendor email reply"""
        # Extract issue ID
        issue_id = self.extract_issue_id(email_data['subject'], email_data['body'])
        
        if not issue_id:
            logger.warning(f"Could not extract issue ID from email: {email_data['subject']}")
            return False
        
        try:
            issue = Issue.objects.get(id=issue_id)
        except Issue.DoesNotExist:
            logger.error(f"Issue {issue_id} not found")
            return False
        
        # Check if this email was already processed
        existing = AICommunicationLog.objects.filter(
            issue=issue,
            email_message_id=email_data['message_id']
        ).exists()
        
        if existing:
            logger.info(f"Email already processed: {email_data['message_id']}")
            return True
        
        # Store vendor response
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
            email_thread_id=f"issue-{issue.id}",
            timestamp=email_data['date'] or timezone.now()
        )
        
        logger.info(f"Stored vendor response for issue {issue_id}")
        
        # Generate AI reply asynchronously
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            # Analyze response
            analysis = loop.run_until_complete(
                ai_manager.analyze_vendor_response(issue, email_data['body'])
            )
            logger.info(f"Analysis: {analysis}")
            
            # Generate AI reply
            reply_result = loop.run_until_complete(
                ai_manager.generate_reply_for_approval(issue, email_data['body'])
            )
            
            if reply_result.get('success'):
                logger.info(f"AI reply generated: {reply_result.get('message_id')}")
            else:
                logger.error(f"Failed to generate AI reply: {reply_result.get('error')}")
        finally:
            loop.close()
        
        return True
    
    def fetch_new_emails(self) -> List[Dict]:
        """Fetch new emails from inbox"""
        if not self.mail:
            if not self.connect():
                return []
        
        emails_processed = []
        
        try:
            # Select inbox
            self.mail.select(self.inbox_folder)
            
            # Search for emails from vendors about issues
            # Include both seen and unseen emails from today
            from datetime import datetime, timedelta
            yesterday = (datetime.now() - timedelta(days=1)).strftime("%d-%b-%Y")
            
            # Search for recent emails with issue-related subjects
            search_criteria = f'(SINCE "{yesterday}" OR SUBJECT "Issue" SUBJECT "Quality" SUBJECT "Resolution")'
            status, messages = self.mail.search(None, search_criteria)
            
            if status != 'OK':
                logger.error("Failed to search emails")
                return emails_processed
            
            email_ids = messages[0].split()
            logger.info(f"Found {len(email_ids)} new emails")
            
            for email_id in email_ids:
                try:
                    # Fetch email
                    status, msg_data = self.mail.fetch(email_id, '(RFC822)')
                    
                    if status != 'OK':
                        continue
                    
                    # Parse email
                    raw_email = msg_data[0][1]
                    msg = email.message_from_bytes(raw_email)
                    email_data = self.parse_email(msg)
                    
                    # Check if this is a vendor reply (not from our own email)
                    if email_data['from'] and email_data['from'] != settings.EMAIL_HOST_USER:
                        # Skip emails from our own procurement email
                        if 'procurement@buy2rent.eu' in email_data['from'].lower():
                            continue
                            
                        # Process the email
                        if self.process_vendor_email(email_data):
                            emails_processed.append(email_data)
                            
                            # Mark as seen
                            self.mail.store(email_id, '+FLAGS', '\\Seen')
                            
                            # Move to processed folder (optional)
                            try:
                                self.create_processed_folder()
                                self.mail.copy(email_id, self.processed_folder)
                                self.mail.store(email_id, '+FLAGS', '\\Deleted')
                            except Exception as e:
                                logger.warning(f"Could not move email to processed folder: {e}")
                    
                except Exception as e:
                    logger.error(f"Error processing email {email_id}: {e}")
                    continue
            
            # Expunge deleted messages
            self.mail.expunge()
            
        except Exception as e:
            logger.error(f"Error fetching emails: {e}")
        
        return emails_processed
    
    def test_connection(self) -> bool:
        """Test IMAP connection"""
        if self.connect():
            try:
                # List folders
                status, folders = self.mail.list()
                if status == 'OK':
                    logger.info("IMAP folders available:")
                    for folder in folders:
                        logger.info(f"  - {folder.decode()}")
                
                # Check inbox
                self.mail.select(self.inbox_folder)
                status, messages = self.mail.search(None, 'ALL')
                
                if status == 'OK':
                    count = len(messages[0].split()) if messages[0] else 0
                    logger.info(f"Inbox has {count} total messages")
                    return True
            except Exception as e:
                logger.error(f"IMAP test failed: {e}")
            finally:
                self.disconnect()
        
        return False


# Singleton instance
imap_service = IMAPEmailService()
