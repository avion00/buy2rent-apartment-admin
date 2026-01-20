"""
Email Monitor Service - Automatically fetches vendor replies via IMAP
"""
import imaplib
import email
from email.header import decode_header
import re
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from django.conf import settings
from django.utils import timezone
from issues.models import Issue, AICommunicationLog
from issues.ai_services import ai_manager
import asyncio

logger = logging.getLogger(__name__)


class EmailMonitor:
    """Monitor email inbox for vendor responses"""
    
    def __init__(self):
        self.imap_host = getattr(settings, 'IMAP_HOST', 'imap.gmail.com')
        self.imap_port = getattr(settings, 'IMAP_PORT', 993)
        # Use same credentials as SMTP
        self.imap_user = getattr(settings, 'EMAIL_HOST_USER', '')
        self.imap_password = getattr(settings, 'EMAIL_HOST_PASSWORD', '')
        self.imap = None
        
    def connect(self):
        """Connect to IMAP server"""
        try:
            self.imap = imaplib.IMAP4_SSL(self.imap_host, self.imap_port)
            self.imap.login(self.imap_user, self.imap_password)
            self.imap.select('INBOX')
            logger.info(f"Connected to IMAP server {self.imap_host}")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to IMAP: {e}")
            return False
    
    def disconnect(self):
        """Disconnect from IMAP server"""
        if self.imap:
            try:
                self.imap.close()
                self.imap.logout()
            except:
                pass
    
    def extract_issue_id_from_email(self, subject: str, body: str) -> Optional[str]:
        """Extract Issue UUID from email subject or body"""
        slug_pattern = r'([a-z0-9-]+-[a-f0-9]{8})'
        short_uuid_pattern = r'[a-f0-9]{8}'
        uuid_pattern = r'[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}'

        patterns = [
            rf'\[Issue\s*#\s*({slug_pattern})\]',
            rf'Issue\s*#\s*({slug_pattern})',
            rf'#({slug_pattern})',
            rf'\[Issue\s*#\s*({uuid_pattern})\]',
            rf'Issue\s*#?\s*({uuid_pattern})',
            rf'issue-({uuid_pattern})',
            rf'#({short_uuid_pattern})',
        ]

        def _resolve(extracted: str) -> Optional[str]:
            try:
                if '-' in extracted and len(extracted) > 8:
                    parts = extracted.split('-')
                    short_uuid = parts[-1]
                    if len(short_uuid) == 8 and re.match(r'^[a-f0-9]{8}$', short_uuid):
                        issue = Issue.objects.filter(id__startswith=short_uuid).first()
                        if issue:
                            return str(issue.id)

                if len(extracted) == 36:
                    issue = Issue.objects.filter(id=extracted).first()
                    if issue:
                        return str(issue.id)

                if len(extracted) == 8 and re.match(r'^[a-f0-9]{8}$', extracted):
                    issue = Issue.objects.filter(id__startswith=extracted).first()
                    if issue:
                        return str(issue.id)
            except Exception as e:
                logger.error(f"Error resolving issue identifier {extracted}: {e}")
            return None

        for pattern in patterns:
            match = re.search(pattern, subject or '', re.IGNORECASE)
            if match:
                resolved = _resolve(match.group(1))
                if resolved:
                    return resolved

        for pattern in patterns:
            match = re.search(pattern, body or '', re.IGNORECASE)
            if match:
                resolved = _resolve(match.group(1))
                if resolved:
                    return resolved

        return None
    
    def parse_email_message(self, msg) -> Dict:
        """Parse email message and extract relevant data"""
        result = {
            'subject': '',
            'from': '',
            'to': '',
            'date': None,
            'body': '',
            'message_id': '',
            'in_reply_to': '',
        }
        
        # Extract headers
        result['subject'] = self.decode_header_value(msg.get('Subject', ''))
        result['from'] = self.decode_header_value(msg.get('From', ''))
        result['to'] = self.decode_header_value(msg.get('To', ''))
        result['message_id'] = msg.get('Message-ID', '')
        result['in_reply_to'] = msg.get('In-Reply-To', '')
        
        # Parse date
        date_str = msg.get('Date', '')
        if date_str:
            try:
                result['date'] = email.utils.parsedate_to_datetime(date_str)
            except:
                result['date'] = timezone.now()
        
        # Extract body
        body_parts = []
        if msg.is_multipart():
            for part in msg.walk():
                if part.get_content_type() == "text/plain":
                    try:
                        body_parts.append(part.get_payload(decode=True).decode('utf-8', errors='ignore'))
                    except:
                        pass
        else:
            try:
                body_parts.append(msg.get_payload(decode=True).decode('utf-8', errors='ignore'))
            except:
                pass
        
        result['body'] = '\n'.join(body_parts)
        return result
    
    def decode_header_value(self, value: str) -> str:
        """Decode email header value"""
        if not value:
            return ''
        
        decoded_parts = []
        for part, encoding in decode_header(value):
            if isinstance(part, bytes):
                try:
                    decoded_parts.append(part.decode(encoding or 'utf-8', errors='ignore'))
                except:
                    decoded_parts.append(str(part))
            else:
                decoded_parts.append(str(part))
        
        return ' '.join(decoded_parts)
    
    def fetch_unread_emails(self):
        """Fetch all emails from inbox"""
        emails = []
        
        try:
            # Get last 50 emails to check for vendor replies
            # This ensures we catch recent replies even if marked as read
            status, messages = self.imap.search(None, 'ALL')
            
            if status != 'OK':
                logger.error("Failed to search emails")
                return emails
            
            email_ids = messages[0].split()
            # Process only the last 50 emails to avoid processing old emails
            recent_email_ids = email_ids[-50:] if len(email_ids) > 50 else email_ids
            
            for email_id in recent_email_ids:
                # Fetch email
                status, msg_data = self.imap.fetch(email_id, '(RFC822)')
                
                if status != 'OK':
                    continue
                
                # Parse email
                raw_email = msg_data[0][1]
                msg = email.message_from_bytes(raw_email)
                
                email_data = self.parse_email_message(msg)
                emails.append(email_data)
                
                # Mark as read
                self.imap.store(email_id, '+FLAGS', '\\Seen')
            
            logger.info(f"Fetched {len(emails)} unread emails")
            
        except Exception as e:
            logger.error(f"Error fetching emails: {e}")
        
        return emails
    
    def process_vendor_response(self, email_data: Dict):
        """Process vendor email response and link to issue"""
        try:
            # Extract issue ID
            issue_id = self.extract_issue_id_from_email(
                email_data['subject'],
                email_data['body']
            )
            
            if not issue_id:
                logger.info(f"No issue ID found in email: {email_data['subject']}")
                return
            
            # Get issue from database
            issue = Issue.objects.get(id=issue_id)
            
            # Check if this email has already been processed
            existing_vendor_log = None
            if email_data.get('message_id'):
                existing_vendor_log = AICommunicationLog.objects.filter(
                    email_message_id=email_data['message_id'],
                    issue=issue,
                    sender='Vendor'
                ).order_by('-timestamp').first()
                
                if existing_vendor_log:
                    logger.info(f"Email already processed: {email_data['message_id']}")
                    # If AI has not responded after this vendor message, generate now
                    ai_reply_exists = AICommunicationLog.objects.filter(
                        issue=issue,
                        sender='AI',
                        message_type='email',
                        timestamp__gte=existing_vendor_log.timestamp
                    ).exists()
                    
                    if ai_reply_exists:
                        return
            
            # Create vendor response log (if not already stored)
            vendor_log = existing_vendor_log
            if not vendor_log:
                vendor_log = AICommunicationLog.objects.create(
                    issue=issue,
                    sender='Vendor',
                    message=email_data['body'],
                    message_type='email',
                    subject=email_data['subject'],
                    email_from=email_data['from'],
                    email_to=email_data['to'],
                    status='received',
                    email_thread_id=f"issue-{issue.id}",
                    email_message_id=email_data['message_id'],
                    in_reply_to=email_data['in_reply_to'],
                    timestamp=email_data['date'] or timezone.now()
                )
            
            logger.info(f"Added vendor response for issue {issue_id}")
            
            # Generate AI reply asynchronously
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                # Analyze and generate reply
                analysis = loop.run_until_complete(
                    ai_manager.analyze_vendor_response(issue, email_data['body'])
                )
                
                reply_result = loop.run_until_complete(
                    ai_manager.generate_reply_for_approval(issue, email_data['body'])
                )
                
                logger.info(f"Generated AI reply for issue {issue_id}")
                
            except Exception as e:
                logger.error(f"Error generating AI reply: {e}")
            finally:
                loop.close()
                
        except Issue.DoesNotExist:
            logger.warning(f"Issue not found: {issue_id}")
        except Exception as e:
            logger.error(f"Error processing vendor response: {e}")
    
    def monitor_inbox(self):
        """Main monitoring loop - fetch and process emails"""
        if not self.connect():
            logger.error("Failed to connect to IMAP server")
            return
        
        try:
            # Fetch unread emails
            emails = self.fetch_unread_emails()
            logger.info(f"Found {len(emails)} emails to check")
            
            processed_count = 0
            # Process each email
            for email_data in emails:
                # Check if email has Issue ID
                issue_id = self.extract_issue_id_from_email(
                    email_data.get('subject', ''),
                    email_data.get('body', '')
                )
                
                if issue_id:
                    logger.info(f"Found email with Issue ID: {issue_id}")
                    self.process_vendor_response(email_data)
                    processed_count += 1
            
            logger.info(f"Processed {processed_count} vendor responses out of {len(emails)} emails")
            
        finally:
            self.disconnect()


# Singleton instance
email_monitor = EmailMonitor()


def check_vendor_emails():
    """Function to be called by scheduler/cron"""
    email_monitor.monitor_inbox()
