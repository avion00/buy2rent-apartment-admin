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
        - "opening_message": A DETAILED, comprehensive message body that includes:
          * A professional introduction mentioning the issue ID and order reference
          * A bullet-point list of ALL specific issues/problems identified
          * The business impact of these issues
          * A clear resolution request (refund, replacement, etc.)
          * A request for confirmation of next steps and timeline
          This should be the FULL email body content (multiple paragraphs), NOT just 1-2 sentences.
        - "closing_message": A polite closing paragraph (2-3 sentences) thanking them for their attention and requesting swift response
        
        Do NOT include greetings like "Dear..." or signatures in the opening/closing messages.
        The opening_message should contain ALL the detailed information about the issue.
        """
        
        try:
            response = await asyncio.to_thread(
                self.client.chat.completions.create,
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a professional procurement specialist writing to vendors about issues. Always return valid JSON with 'subject', 'opening_message', and 'closing_message' fields."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )
            
            # Try to parse JSON response
            content = response.choices[0].message.content
            try:
                result = json.loads(content)
            except json.JSONDecodeError:
                # If not valid JSON, create structure from content with detailed message
                issue_types = issue_data.get('type', 'quality issue')
                product_name = issue_data.get('product_name', 'the product')
                order_ref = issue_data.get('order_reference', 'N/A')
                description = issue_data.get('description', '')
                impact = issue_data.get('impact', '')
                priority = issue_data.get('priority', 'Medium')
                
                detailed_opening = f"""We are writing to formally report a {priority.lower()} priority issue concerning our recent order with reference {order_ref} for {product_name}.

Upon receipt, we identified the following issues with the products delivered:
{description}

{f"These problems have severely impacted our operations: {impact}" if impact else "These issues require your immediate attention."}

We request an immediate resolution to this matter. Please confirm the next steps and provide a timeline for resolution given the {priority.lower()} priority of this issue."""
                
                result = {
                    'subject': f"Issue Report: {issue_data.get('type')}",
                    'opening_message': detailed_opening,
                    'closing_message': 'We appreciate your urgent attention and a swift response to this matter. If you require any additional evidence, such as photographs of the damaged products or copies of the invoice, please let us know.'
                }
            
            # Build a detailed fallback if AI didn't provide opening_message
            if not result.get('opening_message'):
                issue_types = issue_data.get('type', 'quality issue')
                product_name = issue_data.get('product_name', 'the product')
                order_ref = issue_data.get('order_reference', 'N/A')
                description = issue_data.get('description', '')
                impact = issue_data.get('impact', '')
                priority = issue_data.get('priority', 'Medium')
                
                default_opening = f"""We are writing to formally report a {priority.lower()} priority issue concerning our recent order with reference {order_ref} for {product_name}.

Upon receipt, we identified the following issues with the products delivered:
{description}

{f"These problems have severely impacted our operations: {impact}" if impact else "These issues require your immediate attention."}

We request an immediate resolution to this matter. Please confirm the next steps and provide a timeline for resolution given the {priority.lower()} priority of this issue."""
            else:
                default_opening = result.get('opening_message')
            
            return {
                'success': True,
                'subject': result.get('subject', f"Issue Report: {issue_data.get('type')}"),
                'body': result.get('body', ''),  # Keep for backward compatibility
                'opening_message': default_opening,
                'closing_message': result.get('closing_message', 'We appreciate your urgent attention and a swift response to this matter. If you require any additional evidence, such as photographs of the damaged products or copies of the invoice, please let us know.'),
                'confidence': 0.95,
                'model': self.model
            }
        except Exception as e:
            fallback_body = self._generate_fallback_email(issue_data)
            # Generate detailed opening message for fallback
            issue_types = issue_data.get('type', 'quality issue')
            product_name = issue_data.get('product_name', 'the product')
            order_ref = issue_data.get('order_reference', 'N/A')
            description = issue_data.get('description', '')
            impact = issue_data.get('impact', '')
            priority = issue_data.get('priority', 'Medium')
            
            detailed_opening = f"""We are writing to formally report a {priority.lower()} priority issue concerning our recent order with reference {order_ref} for {product_name}.

Upon receipt, we identified the following issues with the products delivered:
{description}

{f"These problems have severely impacted our operations: {impact}" if impact else "These issues require your immediate attention."}

We request an immediate resolution to this matter. Please confirm the next steps and provide a timeline for resolution given the {priority.lower()} priority of this issue."""
            
            return {
                'success': False,
                'error': str(e),
                'subject': f"Issue Report: {issue_data.get('type')}",
                'body': fallback_body,
                'opening_message': detailed_opening,
                'closing_message': 'We appreciate your urgent attention and a swift response to this matter. If you require any additional evidence, such as photographs of the damaged products or copies of the invoice, please let us know.'
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
        
        # Generate detailed structured messages for HTML template
        priority = issue_data.get('priority', 'Medium')
        product_name = issue_data.get('product_name', 'the product')
        order_ref = issue_data.get('order_reference', 'N/A')
        description = issue_data.get('description', '')
        impact = issue_data.get('impact', '')
        issue_type = issue_data.get('type', 'quality issue')
        
        opening_message = f"""We are writing to formally report a {priority.lower()} priority issue concerning our recent order with reference {order_ref} for {product_name}.

Upon receipt, we identified the following issues with the products delivered:
{description}

{f"These problems have severely impacted our operations: {impact}" if impact else "These issues require your immediate attention."}

We request an immediate resolution to this matter. Please confirm the next steps and provide a timeline for resolution given the {priority.lower()} priority of this issue."""
        
        closing_message = "We appreciate your urgent attention and a swift response to this matter. If you require any additional evidence, such as photographs of the damaged products or copies of the invoice, please let us know."
        
        return {
            'success': True,
            'subject': f"Critical {issue_type} - {product_name}",
            'body': f"Issue with {product_name}: {description}",
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
    
    async def process_vendor_reply(self, issue, email_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process incoming vendor email reply with AI analysis and response generation
        
        Args:
            issue: Issue model instance
            email_data: Dictionary containing email details (body, subject, from, message_id, etc.)
        
        Returns:
            Dictionary with processing results including analysis and generated response
        """
        from .models import AICommunicationLog
        
        vendor_message = email_data.get('body', '')
        
        # Store vendor reply
        vendor_log = AICommunicationLog.objects.create(
            issue=issue,
            sender='Vendor',
            message=vendor_message,
            message_type='email',
            subject=email_data.get('subject', ''),
            email_from=email_data.get('from', ''),
            email_to=self.email_service.email_service.from_email,
            status='received',
            email_thread_id=f"issue-{issue.id}",
            email_message_id=email_data.get('message_id', ''),
            in_reply_to=email_data.get('in_reply_to', '')
        )
        
        # Get conversation history for context
        conversation_history = []
        previous_messages = AICommunicationLog.objects.filter(
            issue=issue,
            message_type='email'
        ).order_by('timestamp')
        
        for msg in previous_messages:
            conversation_history.append({
                'sender': msg.sender,
                'message': msg.message,
                'timestamp': msg.timestamp.isoformat()
            })
        
        # Analyze vendor reply using AI
        issue_data = {
            'vendor_name': issue.vendor.name if issue.vendor else 'Vendor',
            'type': issue.type,
            'priority': issue.priority,
            'product_name': issue.get_product_name(),
            'description': issue.description,
            'order_reference': issue.order.po_number if issue.order else None
        }
        
        # Get AI manager instance to access AI service
        from . import ai_services
        ai_manager = ai_services.IssueAIManager()
        
        # Analyze vendor response
        analysis = await ai_manager.ai_service.analyze_vendor_reply(issue_data, vendor_message)
        
        # Update vendor log with analysis
        vendor_log.ai_analysis = analysis
        vendor_log.save()
        
        # Update issue status based on analysis
        sentiment = analysis.get('sentiment', 'neutral')
        intent = analysis.get('intent', 'unknown')
        
        if intent == 'resolution_offered':
            issue.status = 'Pending Resolution'
        elif intent == 'information_request':
            issue.status = 'Awaiting Information'
        elif intent == 'rejection':
            issue.status = 'Disputed'
        elif intent == 'acknowledgment':
            issue.status = 'Acknowledged'
        
        issue.save()
        
        # Generate AI response if auto-reply is enabled
        auto_reply_enabled = getattr(settings, 'AI_AUTO_REPLY_ENABLED', False)
        auto_approve = getattr(settings, 'AI_EMAIL_AUTO_APPROVE', False)
        
        response_result = None
        if auto_reply_enabled or analysis.get('requires_response', False):
            # Draft AI reply
            reply_result = await ai_manager.ai_service.draft_reply(
                issue_data, 
                conversation_history, 
                vendor_message
            )
            
            # Create draft response
            subject = f"Re: {email_data.get('subject', f'Issue {issue.id}')}"
            
            # Determine if auto-approve based on confidence
            confidence = reply_result.get('confidence', 0.5)
            confidence_threshold = getattr(settings, 'AI_EMAIL_CONFIDENCE_THRESHOLD', 0.8)
            
            status = 'sent' if (auto_approve and confidence >= confidence_threshold) else 'pending_approval'
            
            ai_response_log = AICommunicationLog.objects.create(
                issue=issue,
                sender='AI',
                message=reply_result.get('message', ''),
                message_type='email',
                subject=subject,
                email_from=self.email_service.email_service.from_email,
                email_to=email_data.get('from', ''),
                email_thread_id=f"issue-{issue.id}",
                in_reply_to=email_data.get('message_id', ''),
                ai_generated=True,
                ai_confidence=confidence,
                status=status,
                timestamp=timezone.now()
            )
            
            # If auto-approved, send immediately
            if status == 'sent':
                try:
                    self.email_service.send_issue_email(
                        issue=issue,
                        subject=subject,
                        body=reply_result.get('message', ''),
                        is_initial_report=False,
                        ai_data=reply_result
                    )
                    response_result = {
                        'sent': True,
                        'log_id': str(ai_response_log.id)
                    }
                except Exception as e:
                    ai_response_log.status = 'failed'
                    ai_response_log.save()
                    response_result = {
                        'sent': False,
                        'error': str(e)
                    }
            else:
                response_result = {
                    'pending_approval': True,
                    'log_id': str(ai_response_log.id)
                }
        
        return {
            'vendor_log_id': str(vendor_log.id),
            'analysis': analysis,
            'issue_status': issue.status,
            'response': response_result
        }


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
            'order_reference': issue.order.po_number if issue.order else None
        }
        
        # Generate email
        email_result = await self.ai_service.generate_issue_email(issue_data)
        
        if email_result.get('success'):
            # Send email
            vendor_email = issue.vendor.email if issue.vendor else issue.vendor_contact
            if vendor_email:
                # Simple, clean subject: Order #PO, Product, Priority
                priority_label = issue.priority or 'Medium'
                product_name = issue.get_product_name()
                
                if issue.order and issue.order.po_number:
                    subject = f"{priority_label} Issues - Order {issue.order.po_number} - {product_name}"
                else:
                    subject = f"{priority_label} Issues - {product_name}"
                
                # Prepare AI data for template
                ai_email_data = {
                    'opening_message': email_result.get('opening_message', email_result.get('body', 'We are writing to report an issue with our recent order.')),
                    'closing_message': email_result.get('closing_message', 'We kindly request your urgent attention to resolve this matter. Please provide us with a resolution timeline at your earliest convenience.'),
                }
                
                # Use body as fallback
                body_text = email_result.get('body', '')
                
                # Call synchronous email service from async context
                await asyncio.to_thread(
                    self.email_service.send_issue_email,
                    issue=issue,
                    subject=subject,
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
            'order_reference': issue.order.po_number if issue.order else None,
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
                    subject = 'Urgent: Response to Your Message - Immediate Action Required'
                    if issue.order and issue.order.po_number:
                        subject = f'Urgent: Response Required - Order #{issue.order.po_number}'
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
                    subject=f"Urgent: Response Required - Order #{issue.order.po_number}" if issue.order else 'Urgent: Response to Your Message - Immediate Action Required',
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
                subject=f"Urgent: Response Required - Order #{issue.order.po_number}" if issue.order else 'Urgent: Response to Your Message - Immediate Action Required',
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
