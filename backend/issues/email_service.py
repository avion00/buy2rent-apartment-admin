"""
Email Service for Issue Management
Handles outbound email sending with proper tracking and Issue UUID embedding
"""
from typing import Dict, Any
from django.conf import settings
from django.core.mail import EmailMessage
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending and tracking issue-related emails"""
    
    def __init__(self):
        self.from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'procurement@buy2rent.eu')
    
    def send_issue_email(self, issue, subject: str, body: str) -> str:
        """
        Send email to vendor about issue
        
        Args:
            issue: Issue model instance
            subject: Email subject (should already contain Issue ID)
            body: Email body (should already contain Issue ID reference)
        
        Returns:
            email_message_id: The Message-ID header from sent email
        """
        from .models import AICommunicationLog
        
        vendor_email = issue.vendor.email if issue.vendor else issue.vendor_contact
        
        if not vendor_email:
            logger.error(f"No vendor email for issue {issue.id}")
            raise ValueError("Vendor email not found")
        
        try:
            # Create email message with custom headers
            email = EmailMessage(
                subject=subject,
                body=body,
                from_email=self.from_email,
                to=[vendor_email],
                reply_to=[self.from_email],
            )
            
            # Add custom headers for tracking
            email.extra_headers = {
                'X-Issue-ID': str(issue.id),
                'X-Issue-Thread': f'issue-{issue.id}',
            }
            
            # Send email
            email.send(fail_silently=False)
            
            # Get Message-ID (Django doesn't expose this easily, so we generate one)
            email_message_id = f"<issue-{issue.id}-{timezone.now().timestamp()}@buy2rent.eu>"
            
            # Create communication log
            log_entry = AICommunicationLog.objects.create(
                issue=issue,
                sender='AI',
                message=body,
                message_type='email',
                subject=subject,
                email_from=self.from_email,
                email_to=vendor_email,
                email_message_id=email_message_id,
                email_thread_id=f'issue-{issue.id}',
                ai_generated=True,
                status='sent',
                timestamp=timezone.now()
            )
            
            # Update issue
            if not issue.first_sent_at:
                issue.first_sent_at = timezone.now()
            issue.status = 'Pending Vendor Response'
            issue.ai_activated = True
            issue.save()
            
            logger.info(f"Email sent for issue {issue.id} to {vendor_email}")
            
            return email_message_id
            
        except Exception as e:
            logger.error(f"Failed to send email for issue {issue.id}: {e}")
            
            # Create failed log entry
            AICommunicationLog.objects.create(
                issue=issue,
                sender='AI',
                message=body,
                message_type='email',
                subject=subject,
                email_from=self.from_email,
                email_to=vendor_email,
                email_thread_id=f'issue-{issue.id}',
                ai_generated=True,
                status='failed',
                timestamp=timezone.now()
            )
            
            raise
    
    def send_manual_message(self, issue, subject: str, body: str, user) -> str:
        """
        Send manual message from admin to vendor
        
        Args:
            issue: Issue model instance
            subject: Email subject
            body: Email body
            user: User sending the message
        
        Returns:
            email_message_id: The Message-ID header from sent email
        """
        from .models import AICommunicationLog
        
        vendor_email = issue.vendor.email if issue.vendor else issue.vendor_contact
        
        if not vendor_email:
            raise ValueError("Vendor email not found")
        
        # Ensure Issue ID is in subject
        if f'Issue #{issue.id}' not in subject and f'[Issue #{issue.id}]' not in subject:
            subject = f'[Issue #{issue.id}] {subject}'
        
        try:
            # Create email message
            email = EmailMessage(
                subject=subject,
                body=body,
                from_email=self.from_email,
                to=[vendor_email],
                reply_to=[self.from_email],
            )
            
            email.extra_headers = {
                'X-Issue-ID': str(issue.id),
                'X-Issue-Thread': f'issue-{issue.id}',
            }
            
            # Send email
            email.send(fail_silently=False)
            
            email_message_id = f"<issue-{issue.id}-{timezone.now().timestamp()}@buy2rent.eu>"
            
            # Create communication log
            AICommunicationLog.objects.create(
                issue=issue,
                sender='Admin',
                message=body,
                message_type='email',
                subject=subject,
                email_from=self.from_email,
                email_to=vendor_email,
                email_message_id=email_message_id,
                email_thread_id=f'issue-{issue.id}',
                ai_generated=False,
                status='sent',
                approved_by=user,
                approved_at=timezone.now(),
                timestamp=timezone.now()
            )
            
            # Update issue status if needed
            if issue.status == 'Open':
                issue.status = 'Pending Vendor Response'
                issue.save()
            
            logger.info(f"Manual email sent for issue {issue.id} by {user.email}")
            
            return email_message_id
            
        except Exception as e:
            logger.error(f"Failed to send manual email for issue {issue.id}: {e}")
            raise
    
    def send_approved_draft(self, communication_log, user) -> bool:
        """
        Send an approved AI-generated draft
        
        Args:
            communication_log: AICommunicationLog instance with status='pending_approval'
            user: User approving the message
        
        Returns:
            bool: True if sent successfully
        """
        if communication_log.status != 'pending_approval':
            raise ValueError("Communication log is not pending approval")
        
        issue = communication_log.issue
        vendor_email = communication_log.email_to
        
        try:
            # Create email message
            email = EmailMessage(
                subject=communication_log.subject,
                body=communication_log.message,
                from_email=self.from_email,
                to=[vendor_email],
                reply_to=[self.from_email],
            )
            
            email.extra_headers = {
                'X-Issue-ID': str(issue.id),
                'X-Issue-Thread': f'issue-{issue.id}',
            }
            
            # Send email
            email.send(fail_silently=False)
            
            # Update communication log
            communication_log.status = 'sent'
            communication_log.approved_by = user
            communication_log.approved_at = timezone.now()
            communication_log.email_message_id = f"<issue-{issue.id}-{timezone.now().timestamp()}@buy2rent.eu>"
            communication_log.save()
            
            logger.info(f"Approved draft sent for issue {issue.id} by {user.email}")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to send approved draft for issue {issue.id}: {e}")
            communication_log.status = 'failed'
            communication_log.save()
            raise
    
    def send_bulk_emails(self, issue_ids: list, subject: str, body: str, user, include_issue_details: bool = True, include_photos: bool = False) -> dict:
        """
        Send bulk emails to vendors grouped by their issues
        
        Args:
            issue_ids: List of issue IDs to send emails for
            subject: Email subject template
            body: Email body template
            user: User sending the emails
            include_issue_details: Whether to include issue details in email
            include_photos: Whether to attach photos (not implemented yet)
        
        Returns:
            dict: Summary of sent emails with success/failure counts
        """
        from .models import Issue, AICommunicationLog
        from collections import defaultdict
        
        # Group issues by vendor
        issues = Issue.objects.filter(id__in=issue_ids).select_related('vendor', 'product')
        vendor_issues = defaultdict(list)
        
        for issue in issues:
            if issue.vendor and issue.vendor.email:
                vendor_issues[issue.vendor].append(issue)
        
        results = {
            'total_vendors': len(vendor_issues),
            'total_issues': len(issue_ids),
            'sent': 0,
            'failed': 0,
            'errors': []
        }
        
        # Send email to each vendor
        for vendor, vendor_issue_list in vendor_issues.items():
            try:
                # Build email content
                email_subject = subject
                email_body = body + "\n\n"
                
                if include_issue_details:
                    email_body += "=" * 60 + "\n"
                    email_body += "ISSUE DETAILS\n"
                    email_body += "=" * 60 + "\n\n"
                    
                    for idx, issue in enumerate(vendor_issue_list, 1):
                        email_body += f"Issue #{idx} - ID: {issue.id}\n"
                        email_body += f"Product: {issue.product_name or (issue.product.product if issue.product else 'N/A')}\n"
                        email_body += f"Type: {issue.type}\n"
                        email_body += f"Description: {issue.description}\n"
                        email_body += f"Reported: {issue.reported_on.strftime('%Y-%m-%d')}\n"
                        email_body += f"Status: {issue.status}\n"
                        email_body += "-" * 60 + "\n\n"
                
                email_body += "\n\nBest regards,\n"
                email_body += "Procurement Team\n"
                email_body += "Buy2Rent"
                
                # Create email message
                email = EmailMessage(
                    subject=email_subject,
                    body=email_body,
                    from_email=self.from_email,
                    to=[vendor.email],
                    reply_to=[self.from_email],
                )
                
                # Send email
                email.send(fail_silently=False)
                
                email_message_id = f"<bulk-{timezone.now().timestamp()}@buy2rent.eu>"
                
                # Create communication log for each issue
                for issue in vendor_issue_list:
                    AICommunicationLog.objects.create(
                        issue=issue,
                        sender='Admin',
                        message=email_body,
                        message_type='email',
                        subject=email_subject,
                        email_from=self.from_email,
                        email_to=vendor.email,
                        email_message_id=email_message_id,
                        email_thread_id=f'bulk-{timezone.now().timestamp()}',
                        ai_generated=False,
                        status='sent',
                        approved_by=user,
                        approved_at=timezone.now(),
                        timestamp=timezone.now()
                    )
                    
                    # Update issue status if needed
                    if issue.status == 'Open':
                        issue.status = 'Pending Vendor Response'
                        issue.save()
                
                results['sent'] += 1
                logger.info(f"Bulk email sent to {vendor.name} ({vendor.email}) for {len(vendor_issue_list)} issues")
                
            except Exception as e:
                results['failed'] += 1
                error_msg = f"Failed to send to {vendor.name}: {str(e)}"
                results['errors'].append(error_msg)
                logger.error(error_msg)
                
                # Create failed log entries
                for issue in vendor_issue_list:
                    AICommunicationLog.objects.create(
                        issue=issue,
                        sender='Admin',
                        message=body,
                        message_type='email',
                        subject=subject,
                        email_from=self.from_email,
                        email_to=vendor.email,
                        email_thread_id=f'bulk-{timezone.now().timestamp()}',
                        ai_generated=False,
                        status='failed',
                        timestamp=timezone.now()
                    )
        
        return results


# Singleton instance
email_service = EmailService()
