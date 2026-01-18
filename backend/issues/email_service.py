"""
Email Service for Issue Management
Handles outbound email sending with proper tracking and Issue UUID embedding
"""
from typing import Dict, Any
from django.conf import settings
from django.core.mail import EmailMessage, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.html import strip_tags
import logging

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending and tracking issue-related emails"""
    
    def __init__(self):
        self.from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'procurement@buy2rent.eu')
    
    def send_issue_email(self, issue, subject: str, body: str, is_initial_report: bool = True, ai_data: Dict[str, Any] = None) -> str:
        """
        Send email to vendor about issue with HTML template
        
        Args:
            issue: Issue model instance
            subject: Email subject (should already contain Issue ID)
            body: Email body (plain text or AI-generated message)
            is_initial_report: Whether this is the initial issue report (uses detailed template)
            ai_data: Optional dictionary with AI-generated structured data
        
        Returns:
            email_message_id: The Message-ID header from sent email
        """
        from .models import AICommunicationLog
        
        vendor_email = issue.vendor.email if issue.vendor else issue.vendor_contact
        
        if not vendor_email:
            logger.error(f"No vendor email for issue {issue.id}")
            raise ValueError("Vendor email not found")
        
        try:
            # Prepare context for HTML template
            if is_initial_report:
                # Get priority class for styling
                priority_class = issue.priority.lower() if issue.priority else 'medium'
                
                # Parse AI-generated content or use defaults
                if ai_data and isinstance(ai_data, dict):
                    opening_message = ai_data.get('opening_message', 'We are writing to report an issue with our recent order.')
                    closing_message = ai_data.get('closing_message', 'We kindly request your urgent attention to resolve this matter. Please provide us with a resolution timeline at your earliest convenience.')
                else:
                    # Extract opening and closing from body if available
                    body_lines = body.split('\n\n')
                    opening_message = body_lines[0] if len(body_lines) > 0 else 'We are writing to report an issue with our recent order.'
                    closing_message = body_lines[-1] if len(body_lines) > 1 else 'We kindly request your urgent attention to resolve this matter.'
                
                # Get affected products with images
                affected_products = []
                if hasattr(issue, 'items') and issue.items.exists():
                    for item in issue.items.all():
                        # Process issue types - split by comma if it's a string
                        issue_types_display = item.issue_types
                        if item.issue_types and isinstance(item.issue_types, str):
                            # Split and create HTML badges
                            types_list = [t.strip() for t in item.issue_types.split(',') if t.strip()]
                            issue_types_display = ', '.join(types_list)
                        
                        # Get image URL and convert to absolute URL
                        image_url = item.get_product_image()
                        if image_url and not image_url.startswith('http'):
                            # Convert relative path to absolute URL
                            from django.conf import settings
                            domain = getattr(settings, 'SITE_DOMAIN', 'https://procurement.buy2rent.eu')
                            image_url = f"{domain}{image_url}"
                        
                        product_data = {
                            'name': item.product_name or 'Unknown Product',
                            'quantity': item.quantity_affected,
                            'issue_types': issue_types_display,
                            'description': item.description,
                            'image_url': image_url,
                        }
                        affected_products.append(product_data)
                else:
                    # Fallback to single product
                    product_image = None
                    if issue.product:
                        product_image = issue.product.product_image or issue.product.image_url or (issue.product.image_file.url if issue.product.image_file else None)
                    elif issue.order_item:
                        product_image = issue.order_item.product_image_url
                    
                    # Convert to absolute URL if needed
                    if product_image and not product_image.startswith('http'):
                        from django.conf import settings
                        domain = getattr(settings, 'SITE_DOMAIN', 'https://procurement.buy2rent.eu')
                        product_image = f"{domain}{product_image}"
                    
                    affected_products.append({
                        'name': issue.get_product_name(),
                        'quantity': 1,
                        'issue_types': issue.type,
                        'description': issue.description,
                        'image_url': product_image,
                    })
                
                context = {
                    'vendor_name': issue.vendor.name if issue.vendor else 'Vendor',
                    'issue_id': str(issue.id),
                    'issue_slug': issue.get_issue_slug(),
                    'issue_type': issue.type,
                    'priority': issue.priority or 'Medium',
                    'priority_class': priority_class,
                    'product_name': issue.get_product_name(),
                    'order_reference': f"Order #{issue.order.po_number}" if issue.order else None,
                    'reported_date': issue.reported_on.strftime('%B %d, %Y') if issue.reported_on else timezone.now().strftime('%B %d, %Y'),
                    'description': issue.description,
                    'impact': issue.impact if hasattr(issue, 'impact') and issue.impact else None,
                    'opening_message': opening_message,
                    'closing_message': closing_message,
                    'reply_email': self.from_email,
                    'affected_products': affected_products,
                }
                
                # Render HTML template
                html_content = render_to_string('emails/issue_report.html', context)
            else:
                # Reply template
                context = {
                    'vendor_name': issue.vendor.name if issue.vendor else 'Vendor',
                    'issue_id': str(issue.id),
                    'issue_slug': issue.get_issue_slug(),
                    'message_body': body,
                }
                html_content = render_to_string('emails/issue_reply.html', context)
            
            # Create plain text version
            plain_text = strip_tags(html_content)
            
            # Create email message with HTML
            email = EmailMultiAlternatives(
                subject=subject,
                body=plain_text,
                from_email=self.from_email,
                to=[vendor_email],
                reply_to=[self.from_email],
            )
            
            # Attach HTML version
            email.attach_alternative(html_content, "text/html")
            
            # Add custom headers for tracking
            email.extra_headers = {
                'X-Issue-ID': str(issue.id),
                'X-Issue-Thread': f'issue-{issue.id}',
            }
            
            # Send email
            email.send(fail_silently=False)
            
            # Get Message-ID (Django doesn't expose this easily, so we generate one)
            email_message_id = f"<issue-{issue.id}-{timezone.now().timestamp()}@buy2rent.eu>"
            
            # Create communication log (store both plain text and HTML version)
            log_entry = AICommunicationLog.objects.create(
                issue=issue,
                sender='AI',
                message=plain_text,
                html_content=html_content,
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
                message=body if isinstance(body, str) else str(body),
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
        Send manual message from admin to vendor with HTML template
        
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
        
        issue_slug = issue.get_issue_slug()
        if f'Issue #{issue_slug}' not in subject and f'[Issue #{issue_slug}]' not in subject:
            subject = f'[Issue #{issue_slug}] {subject}'
        
        try:
            # Prepare context for HTML template
            context = {
                'vendor_name': issue.vendor.name if issue.vendor else 'Vendor',
                'issue_id': str(issue.id),
                'issue_slug': issue.get_issue_slug(),
                'message_body': body,
            }
            
            # Render HTML template
            html_content = render_to_string('emails/manual_message.html', context)
            plain_text = strip_tags(html_content)
            
            # Create email message with HTML
            email = EmailMultiAlternatives(
                subject=subject,
                body=plain_text,
                from_email=self.from_email,
                to=[vendor_email],
                reply_to=[self.from_email],
            )
            
            # Attach HTML version
            email.attach_alternative(html_content, "text/html")
            
            email.extra_headers = {
                'X-Issue-ID': str(issue.id),
                'X-Issue-Thread': f'issue-{issue.id}',
            }
            
            # Send email
            email.send(fail_silently=False)
            
            email_message_id = f"<issue-{issue.id}-{timezone.now().timestamp()}@buy2rent.eu>"
            
            # Create communication log (store plain text version)
            AICommunicationLog.objects.create(
                issue=issue,
                sender='Admin',
                message=plain_text,
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
        Send an approved AI-generated draft with HTML template
        
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
            # Prepare context for HTML template (reply template)
            context = {
                'vendor_name': issue.vendor.name if issue.vendor else 'Vendor',
                'issue_id': str(issue.id),
                'issue_slug': issue.get_issue_slug(),
                'message_body': communication_log.message,
            }
            
            # Render HTML template
            html_content = render_to_string('emails/issue_reply.html', context)
            plain_text = strip_tags(html_content)
            
            # Create email message with HTML
            email = EmailMultiAlternatives(
                subject=communication_log.subject,
                body=plain_text,
                from_email=self.from_email,
                to=[vendor_email],
                reply_to=[self.from_email],
            )
            
            # Attach HTML version
            email.attach_alternative(html_content, "text/html")
            
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
