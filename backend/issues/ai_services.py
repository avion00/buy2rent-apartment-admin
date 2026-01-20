"""
AI Email Services for Issue Management
Integrates with existing Issue model to provide AI-powered vendor communication
"""
import asyncio
from typing import Dict, Any, List
from abc import ABC, abstractmethod
from django.conf import settings
import json
from openai import OpenAI
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils import timezone
import re


class AIServiceInterface(ABC):
    """Abstract base class for AI services"""
    
    @abstractmethod
    async def generate_issue_email(self, issue_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate an issue report email for vendor"""
        pass
    
    @abstractmethod
    async def analyze_vendor_reply(self, issue_data: Dict[str, Any], vendor_email_text: str) -> Dict[str, Any]:
        """Analyze vendor's response for sentiment and intent"""
        pass
    
    @abstractmethod
    async def draft_reply(self, issue_data: Dict[str, Any], conversation_history: List[Dict], vendor_message: str) -> Dict[str, Any]:
        """Generate a reply to vendor's message"""
        pass
    
    @abstractmethod
    async def generate_conversation_summary(self, conversation_history: List[Dict]) -> Dict[str, Any]:
        """Generate conversation summary and next action"""
        pass


class OpenAIService(AIServiceInterface):
    """OpenAI implementation of AI service"""
    
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = getattr(settings, 'OPENAI_MODEL', 'gpt-4.1')
    
    async def generate_issue_email(self, issue_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate professional issue report email"""
        
        vendor_name = issue_data.get('vendor_name', 'Vendor')
        sender_name = issue_data.get('sender_name', 'Procurement Team')
        
        prompt = f"""
        Generate a professional email to report the following issue to a vendor:
        
        Vendor Name: {vendor_name}
        Sender Name: {sender_name}
        Issue Type: {issue_data.get('type')}
        Priority: {issue_data.get('priority')}
        Product: {issue_data.get('product_name')}
        Order Reference: {issue_data.get('order_reference', 'N/A')}
        Description: {issue_data.get('description')}
        Impact: {issue_data.get('impact', 'N/A')}
        
        The email should:
        1. Be professional and courteous
        2. Clear about the issue and its impact
        3. Include a request for resolution
        4. Mention expected timeline based on priority
        
        Return as JSON with these fields:
        - "subject": A clear, concise subject line
        - "opening_message": A brief, professional opening paragraph (1-2 sentences)
        - "closing_message": A polite closing paragraph requesting action and timeline (2-3 sentences)
        
        Do NOT include greetings like "Dear..." or signatures in the opening/closing messages.
        The opening should introduce the issue briefly.
        The closing should request resolution and provide contact information.
        """
        
        try:
            response = await asyncio.to_thread(
                self.client.chat.completions.create,
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a professional procurement specialist writing to vendors about issues. Always return valid JSON with 'subject' and 'body' fields."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )
            
            # Try to parse JSON response
            content = response.choices[0].message.content
            try:
                result = json.loads(content)
            except json.JSONDecodeError:
                # If not valid JSON, create structure from content
                result = {
                    'subject': f"Issue Report: {issue_data.get('type')}",
                    'opening_message': 'We are writing to report an issue with our recent order.',
                    'closing_message': 'We kindly request your urgent attention to resolve this matter. Please provide us with a resolution timeline at your earliest convenience.'
                }
            
            return {
                'success': True,
                'subject': result.get('subject', f"Issue Report: {issue_data.get('type')}"),
                'body': result.get('body', ''),  # Keep for backward compatibility
                'opening_message': result.get('opening_message', 'We are writing to report an issue with our recent order.'),
                'closing_message': result.get('closing_message', 'We kindly request your urgent attention to resolve this matter. Please provide us with a resolution timeline at your earliest convenience.'),
                'confidence': 0.95,
                'model': self.model
            }
        except Exception as e:
            fallback_body = self._generate_fallback_email(issue_data)
            return {
                'success': False,
                'error': str(e),
                'subject': f"Issue Report: {issue_data.get('type')}",
                'body': fallback_body,
                'opening_message': 'We are writing to report an issue with our recent order that requires your immediate attention.',
                'closing_message': 'We kindly request your urgent attention to resolve this matter. Please provide us with a resolution timeline at your earliest convenience. Thank you for your cooperation.'
            }
    
    async def draft_reply(self, issue_data: Dict[str, Any], conversation_history: List[Dict], vendor_message: str) -> Dict[str, Any]:
        """Generate a reply to vendor's message"""
        
        vendor_name = issue_data.get('vendor_name', 'Vendor')
        sender_name = issue_data.get('sender_name', 'Procurement Team')

        context_json = json.dumps(issue_data, ensure_ascii=False, default=str)

        messages = [
            {
                "role": "system",
                "content": (
                    "You are the Buy2Rent procurement system assistant writing email replies to the vendor. "
                    "You must use the provided ISSUE_CONTEXT to answer accurately. "
                    "Respond directly to the vendor's latest message. Keep the reply formal, polite, clear, and concise. "
                    "Do NOT repeat the affected product list in every reply. "
                    "Only include affected product details/images if the vendor explicitly asks for product details/images/list OR ISSUE_CONTEXT_JSON.include_products is true. "
                    "If include_products is false, do not mention or paste product lists. "
                    "If the vendor asks for the affected product list / details / images, you MUST provide the list from ISSUE_CONTEXT (names, quantities, issue types, descriptions, image URLs) and NOT ask the vendor to provide it. "
                    "Only ask the vendor for information that is truly missing (e.g. tracking number, replacement ETA, pickup date). "
                    f"Address the vendor as: {vendor_name}. Sign off as: {sender_name}.\n\n"
                    f"ISSUE_CONTEXT_JSON: {context_json}"
                )
            }
        ]
        
        # Add conversation history
        for msg in conversation_history[-5:]:  # Last 5 messages for context
            role = "assistant" if msg.get('sender') == 'AI' else "user"
            messages.append({"role": role, "content": msg.get('message', '')})
        
        # Add latest vendor message
        messages.append({"role": "user", "content": vendor_message})
        
        try:
            response = await asyncio.to_thread(
                self.client.chat.completions.create,
                model=self.model,
                messages=messages,
                temperature=0.7
            )
            
            reply = response.choices[0].message.content
            
            return {
                'success': True,
                'reply': reply,
                'confidence': 0.9,
                'model': self.model
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'reply': "Thank you for your response. We will review and get back to you shortly."
            }
    
    async def analyze_vendor_reply(self, issue_data: Dict[str, Any], vendor_email_text: str) -> Dict[str, Any]:
        """Analyze vendor's response for sentiment and intent"""
        
        message = vendor_email_text
        
        prompt = f"""
        Analyze this vendor response and determine:
        1. Sentiment (positive/neutral/negative)
        2. Intent (accepting_responsibility/proposing_solution/requesting_info/disputing/other)
        3. Key commitments made
        4. Suggested next action
        5. Whether escalation is recommended
        
        Message: {message}
        
        Return as JSON.
        """
        message = vendor_email_text  # Use the parameter name
        
        try:
            response = await asyncio.to_thread(
                self.client.chat.completions.create,
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an AI analyzing vendor responses. Return analysis as JSON with fields: sentiment, intent, key_commitments (array), suggested_action, escalation_recommended (boolean)."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3
            )
            
            # Try to parse JSON response
            content = response.choices[0].message.content
            try:
                analysis = json.loads(content)
            except json.JSONDecodeError:
                # Fallback if not valid JSON
                analysis = {
                    'sentiment': 'neutral',
                    'intent': 'unclear',
                    'key_commitments': [],
                    'suggested_action': 'Review manually',
                    'escalation_recommended': False
                }
            return {
                'sentiment': analysis.get('sentiment', 'neutral'),
                'intent': analysis.get('intent', 'other'),
                'key_commitments': analysis.get('key_commitments', []),
                'suggested_action': analysis.get('suggested_action', 'Review manually'),
                'escalation_recommended': analysis.get('escalation_recommended', False),
                'error': None
            }
        except Exception as e:
            return {
                'sentiment': 'neutral',
                'intent': 'other',
                'key_commitments': [],
                'suggested_action': 'Review manually',
                'escalation_recommended': False,
                'error': str(e)
            }
    
    async def generate_conversation_summary(self, conversation_history: List[Dict]) -> Dict[str, Any]:
        """Generate conversation summary and next action"""
        
        if not conversation_history:
            return {
                'summary': 'No conversation history available.',
                'next_action': 'Initiate contact with vendor.',
                'key_points': []
            }
        
        # Format conversation for AI
        conversation_text = "\n".join([
            f"{msg.get('sender', 'Unknown')}: {msg.get('message', '')}" 
            for msg in conversation_history
        ])
        
        prompt = f"""
        Summarize this vendor communication thread and suggest next action:
        
        {conversation_text}
        
        Provide:
        1. Brief summary (2-3 sentences)
        2. Key points discussed (array)
        3. Suggested next action
        
        Return as JSON with fields: summary, key_points (array), next_action
        """
        
        try:
            response = await asyncio.to_thread(
                self.client.chat.completions.create,
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an AI summarizing vendor communications. Return JSON with fields: summary, key_points (array), next_action."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3
            )
            
            content = response.choices[0].message.content
            try:
                result = json.loads(content)
            except json.JSONDecodeError:
                result = {
                    'summary': content[:200],
                    'key_points': [],
                    'next_action': 'Review conversation'
                }
            
            return {
                'summary': result.get('summary', 'Conversation in progress'),
                'key_points': result.get('key_points', []),
                'next_action': result.get('next_action', 'Continue monitoring')
            }
        except Exception as e:
            return {
                'summary': f'Error generating summary: {str(e)}',
                'key_points': [],
                'next_action': 'Review manually'
            }
    
    def _generate_fallback_email(self, issue_data: Dict[str, Any]) -> str:
        """Generate fallback email if AI fails"""
        return f"""
Dear Vendor,

We are writing to report an issue with a recent order.

Issue Type: {issue_data.get('type')}
Product: {issue_data.get('product_name')}
Priority: {issue_data.get('priority')}

Description:
{issue_data.get('description')}

We would appreciate your prompt attention to this matter and a proposed resolution.

Best regards,
Procurement Team
"""


class MockAIService(AIServiceInterface):
    """Mock AI service for testing"""
    
    async def generate_issue_email(self, issue_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate mock issue report email"""
        
        # Generate structured messages for HTML template
        opening_message = f"We are writing to report a {issue_data.get('priority', 'Medium').lower()} priority issue regarding {issue_data.get('product_name')}. The products received do not meet our quality standards and require your immediate attention."
        
        closing_message = f"We kindly request your urgent attention to resolve this matter. Please provide us with a resolution timeline at your earliest convenience. For any questions or clarifications, please reach out to us at procurement@buy2rent.eu. Your prompt action on this issue is highly appreciated."
        
        return {
            'success': True,
            'subject': f"Critical {issue_data.get('type')} - {issue_data.get('product_name')}",
            'body': f"Issue with {issue_data.get('product_name')}: {issue_data.get('description')}",
            'opening_message': opening_message,
            'closing_message': closing_message,
            'confidence': 1.0,
            'model': 'mock'
        }
    
    async def draft_reply(self, issue_data: Dict[str, Any], conversation_history: List[Dict], vendor_message: str) -> Dict[str, Any]:
        """Generate mock reply"""
        vendor_name = issue_data.get('vendor_name', 'Vendor')
        sender_name = issue_data.get('sender_name', 'Procurement Team')

        vendor_text = (vendor_message or '').lower()
        wants_products = bool(issue_data.get('include_products')) or any(k in vendor_text for k in ['product', 'products', 'list', 'items', 'issue details', 'images', 'image'])
        affected_products = issue_data.get('affected_products') or []

        if wants_products and affected_products:
            lines = []
            for idx, p in enumerate(affected_products, 1):
                name = p.get('name', 'Unknown Product')
                qty = p.get('quantity', 1)
                issue_types = p.get('issue_types') or ''
                desc = p.get('description') or ''
                img = p.get('image_url') or ''
                item_line = f"{idx}) {name} (Qty: {qty})"
                if issue_types:
                    item_line += f"\n   Issue types: {issue_types}"
                if desc:
                    item_line += f"\n   Description: {desc}"
                if img:
                    item_line += f"\n   Image: {img}"
                lines.append(item_line)

            reply_text = (
                f"Dear {vendor_name},\n\n"
                "Here is the list of affected products for this issue:\n\n"
                + "\n\n".join(lines)
                + f"\n\nBest regards,\n{sender_name}"
            )

            return {
                'success': True,
                'reply': reply_text,
                'confidence': 1.0,
                'model': 'mock'
            }

        return {
            'success': True,
            'reply': f"Dear {vendor_name},\n\n[TEST REPLY] Thank you for your message. We acknowledge: '{vendor_message[:100]}...' and will process accordingly.\n\nBest regards,\n{sender_name}",
            'confidence': 1.0,
            'model': 'mock'
        }
    
    async def analyze_vendor_reply(self, issue_data: Dict[str, Any], vendor_email_text: str) -> Dict[str, Any]:
        """Mock analysis of vendor response"""
        return {
            'sentiment': 'positive',
            'intent': 'proposing_solution',
            'key_commitments': ['Will investigate', 'Provide replacement'],
            'suggested_action': 'Accept proposed solution',
            'escalation_recommended': False
        }
    
    async def generate_conversation_summary(self, conversation_history: List[Dict]) -> Dict[str, Any]:
        """Mock conversation summary"""
        return {
            'summary': f'Mock summary of {len(conversation_history)} messages',
            'key_points': ['Point 1', 'Point 2'],
            'next_action': 'Continue monitoring'
        }


# Import the proper EmailService with HTML template support
from .email_service import EmailService as ProperEmailService


class EmailServiceWrapper:
    """Wrapper to make sync EmailService work with async AI services"""
    
    def __init__(self):
        self.email_service = ProperEmailService()
    
    def send_issue_email(self, issue, subject: str, body: str, is_initial_report: bool = True, ai_data: Dict[str, Any] = None) -> str:
        """Send email using the proper HTML email service"""
        return self.email_service.send_issue_email(
            issue=issue,
            subject=subject,
            body=body,
            is_initial_report=is_initial_report,
            ai_data=ai_data
        )
    
    async def process_vendor_reply(self, issue, email_data: Dict[str, Any]) -> None:
        """Process incoming vendor email reply"""
        from .models import AICommunicationLog
        
        # Store vendor reply
        AICommunicationLog.objects.create(
            issue=issue,
            sender='Vendor',
            message=email_data.get('body', ''),
            message_type='email',
            subject=email_data.get('subject', ''),
            email_from=email_data.get('from', ''),
            email_to=self.from_email,
            status='received',
            email_thread_id=f"issue-{issue.id}",
            email_message_id=email_data.get('message_id', ''),
            in_reply_to=email_data.get('in_reply_to', '')
        )


class IssueAIManager:
    """Manager for AI-powered issue communications"""
    
    def __init__(self):
        use_mock = getattr(settings, 'USE_MOCK_AI', True)
        self.ai_service = MockAIService() if use_mock else OpenAIService()
        self.email_service = EmailServiceWrapper()
    
    async def start_issue_conversation(self, issue) -> Dict[str, Any]:
        """Start AI conversation for an issue"""
        
        # Get vendor name and sender name
        vendor_name = issue.vendor.name if issue.vendor else "Vendor"
        sender_name = "Procurement Team"  # Can be customized from settings
        
        # Prepare issue data
        issue_data = {
            'vendor_name': vendor_name,
            'sender_name': sender_name,
            'type': issue.type,
            'priority': issue.priority,
            'product_name': issue.get_product_name(),
            'description': issue.description,
            'impact': issue.impact,
            'order_reference': f"Order #{issue.order.id}" if issue.order else None
        }
        
        # Generate email
        email_result = await self.ai_service.generate_issue_email(issue_data)
        
        if email_result.get('success'):
            # Send email
            vendor_email = issue.vendor.email if issue.vendor else issue.vendor_contact
            if vendor_email:
                # Add Issue ID to subject for tracking
                issue_slug = issue.get_issue_slug()
                subject_with_id = f"[Issue #{issue_slug}] {email_result['subject']}"
                
                # Prepare AI data for template
                ai_email_data = {
                    'opening_message': email_result.get('opening_message', email_result.get('body', 'We are writing to report an issue with our recent order.')),
                    'closing_message': email_result.get('closing_message', 'We kindly request your urgent attention to resolve this matter. Please provide us with a resolution timeline at your earliest convenience.'),
                }
                
                # Use body as fallback
                body_text = email_result.get('body', '')
                
                self.email_service.send_issue_email(
                    issue=issue,
                    subject=subject_with_id,
                    body=body_text,
                    is_initial_report=True,
                    ai_data=ai_email_data
                )
                
                return {
                    'success': True,
                    'message': 'Issue email sent successfully',
                    'email_subject': email_result['subject']
                }
        
        return {
            'success': False,
            'message': 'Failed to generate or send email',
            'error': email_result.get('error')
        }
    
    async def generate_reply_for_approval(self, issue, vendor_message: str) -> Dict[str, Any]:
        """Generate AI reply and auto-send if approved"""
        
        from asgiref.sync import sync_to_async

        @sync_to_async
        def get_vendor_context():
            vendor_name = issue.vendor.name if issue.vendor else "Vendor"
            vendor_email = issue.vendor.email if issue.vendor else issue.vendor_contact
            issue_slug = issue.get_issue_slug()

            domain = getattr(settings, 'SITE_DOMAIN', 'https://procurement.buy2rent.eu')

            affected_products = []
            if hasattr(issue, 'items') and issue.items.exists():
                for item in issue.items.all():
                    issue_types_display = item.issue_types
                    if item.issue_types and isinstance(item.issue_types, str):
                        types_list = [t.strip() for t in item.issue_types.split(',') if t.strip()]
                        issue_types_display = ', '.join(types_list)

                    image_url = item.get_product_image() if hasattr(item, 'get_product_image') else None
                    if image_url and not str(image_url).startswith('http'):
                        image_url = f"{domain}{image_url}"

                    affected_products.append({
                        'name': item.product_name or 'Unknown Product',
                        'quantity': item.quantity_affected or 1,
                        'issue_types': issue_types_display or '',
                        'description': item.description or '',
                        'image_url': image_url or ''
                    })
            else:
                product_image = None
                if getattr(issue, 'product', None):
                    product_image = issue.product.product_image or issue.product.image_url or (issue.product.image_file.url if issue.product.image_file else None)
                elif getattr(issue, 'order_item', None):
                    product_image = issue.order_item.product_image_url

                if product_image and not str(product_image).startswith('http'):
                    product_image = f"{domain}{product_image}"

                affected_products.append({
                    'name': issue.get_product_name(),
                    'quantity': 1,
                    'issue_types': getattr(issue, 'type', '') or '',
                    'description': getattr(issue, 'description', '') or '',
                    'image_url': product_image or ''
                })

            return vendor_name, vendor_email, issue_slug, affected_products

        vendor_name, vendor_email, issue_slug, affected_products = await get_vendor_context()
        sender_name = "Procurement Team"
        
        # Get conversation history
        from .models import AICommunicationLog
        
        @sync_to_async
        def get_history():
            return list(AICommunicationLog.objects.filter(
                issue=issue,
                message_type='email'
            ).order_by('timestamp').values('sender', 'message'))
        
        history = await get_history()

        vendor_text = (vendor_message or '').lower()
        product_keywords = [
            'product', 'products', 'item', 'items', 'list', 'affected', 'issue details', 'details',
            'image', 'images', 'photo', 'photos', 'which product', 'which products'
        ]
        wants_product_info = any(k in vendor_text for k in product_keywords)

        matched_products = []
        if not wants_product_info:
            for p in affected_products:
                name = (p.get('name') or '').strip().lower()
                if name and name in vendor_text:
                    matched_products.append(p)
            if matched_products:
                wants_product_info = True

        products_for_context = matched_products if matched_products else (affected_products if wants_product_info else [])
        
        # Prepare issue data for draft_reply
        issue_data = {
            'vendor_name': vendor_name,
            'sender_name': sender_name,
            'issue_id': str(issue.id),
            'issue_slug': issue_slug,
            'type': getattr(issue, 'type', ''),
            'priority': getattr(issue, 'priority', ''),
            'include_products': bool(wants_product_info),
            'affected_products': products_for_context,
        }
        
        # Generate reply using draft_reply method
        reply_result = await self.ai_service.draft_reply(issue_data, history, vendor_message)
        
        if reply_result.get('success'):
            confidence = reply_result.get('confidence', 0.8)
            auto_approve = getattr(settings, 'AI_EMAIL_AUTO_APPROVE', False)
            confidence_threshold = getattr(settings, 'AI_EMAIL_CONFIDENCE_THRESHOLD', 0.8)
            
            should_auto_send = auto_approve and confidence >= confidence_threshold
            
            if should_auto_send:
                try:
                    # Send the email immediately
                    subject = f"Re: Issue #{issue_slug}"
                    if vendor_email:
                        email_message_id = await asyncio.to_thread(
                            self.email_service.send_issue_email,
                            issue=issue,
                            subject=subject,
                            body=reply_result['reply'],
                            is_initial_report=False
                        )
                        
                        return {
                            'success': True,
                            'reply': reply_result['reply'],
                            'confidence': confidence,
                            'auto_sent': True,
                            'email_message_id': email_message_id
                        }
                except Exception as e:
                    logger.error(f"Failed to auto-send AI reply for issue {issue.id}: {e}")
                    # Fall through to create draft
            
            # Create draft for manual approval
            @sync_to_async
            def create_draft():
                return AICommunicationLog.objects.create(
                    issue=issue,
                    sender='AI',
                    message=reply_result['reply'],
                    message_type='email',
                    subject=f"Re: Issue #{issue_slug}",
                    email_from=getattr(settings, 'DEFAULT_FROM_EMAIL', 'procurement@buy2rent.eu'),
                    email_to=vendor_email,
                    ai_generated=True,
                    ai_confidence=confidence,
                    status='pending_approval',
                    requires_approval=True,
                    email_thread_id=f"issue-{issue.id}"
                )
            
            draft = await create_draft()
            
            return {
                'success': True,
                'draft_id': str(draft.id),
                'reply': reply_result['reply'],
                'confidence': confidence,
                'requires_approval': True,
                'auto_sent': False
            }

        error_text = reply_result.get('error', 'Failed to generate reply')
        fallback_reply = (
            "Thank you for your response. We have received your update and are reviewing it. "
            "Please share the expected resolution timeline and the next steps from your side."
        )

        @sync_to_async
        def create_fallback_logs():
            from .models import AICommunicationLog
            AICommunicationLog.objects.create(
                issue=issue,
                sender='System',
                message=f"AI reply generation failed: {error_text}",
                message_type='system',
                status='internal',
                email_thread_id=f"issue-{issue.id}"
            )
            draft = AICommunicationLog.objects.create(
                issue=issue,
                sender='AI',
                message=fallback_reply,
                message_type='email',
                subject=f"Re: Issue #{issue_slug}",
                email_from=getattr(settings, 'DEFAULT_FROM_EMAIL', 'procurement@buy2rent.eu'),
                email_to=vendor_email,
                ai_generated=False,
                ai_confidence=None,
                status='pending_approval',
                requires_approval=True,
                email_thread_id=f"issue-{issue.id}"
            )
            return draft

        draft = await create_fallback_logs()

        return {
            'success': True,
            'draft_id': str(draft.id),
            'reply': fallback_reply,
            'confidence': None,
            'requires_approval': True,
            'auto_sent': False,
            'fallback': True
        }
    
    async def analyze_vendor_response(self, issue, message: str) -> Dict[str, Any]:
        """Analyze vendor's response"""
        from asgiref.sync import sync_to_async

        @sync_to_async
        def get_issue_data():
            return {
                'vendor_name': issue.vendor.name if issue.vendor else 'Vendor',
                'type': issue.type,
                'priority': issue.priority
            }

        issue_data = await get_issue_data()
        
        analysis = await self.ai_service.analyze_vendor_reply(issue_data, message)
        
        # Update issue based on analysis
        @sync_to_async
        def update_issue():
            if analysis.get('escalation_recommended'):
                issue.priority = 'Critical'
            
            if analysis.get('intent') == 'accepting_responsibility':
                issue.status = 'Resolution Agreed'
            
            issue.save()
        
        await update_issue()
        
        return analysis


# Singleton instance
ai_manager = IssueAIManager()
