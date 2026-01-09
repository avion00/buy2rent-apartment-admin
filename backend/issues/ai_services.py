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
        self.model = getattr(settings, 'OPENAI_MODEL', 'gpt-4-turbo-preview')
    
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
        1. Address the vendor by their actual name: "{vendor_name}"
        2. Be professional and courteous
        3. Clear about the issue and its impact
        4. Include a request for resolution
        5. Mention expected timeline based on priority
        6. Sign off with the sender's name: "{sender_name}"
        
        Return as JSON with 'subject' and 'body' fields.
        """
        
        try:
            response = await asyncio.to_thread(
                self.client.chat.completions.create,
                model="gpt-3.5-turbo",  # Use gpt-3.5 for now as gpt-4-turbo might not be available
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
                    'body': content
                }
            return {
                'success': True,
                'subject': result.get('subject', f"Issue Report: {issue_data.get('type')}"),
                'body': result.get('body', ''),
                'confidence': 0.95,
                'model': self.model
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'subject': f"Issue Report: {issue_data.get('type')}",
                'body': self._generate_fallback_email(issue_data)
            }
    
    async def draft_reply(self, issue_data: Dict[str, Any], conversation_history: List[Dict], vendor_message: str) -> Dict[str, Any]:
        """Generate a reply to vendor's message"""
        
        vendor_name = issue_data.get('vendor_name', 'Vendor')
        sender_name = issue_data.get('sender_name', 'Procurement Team')
        
        messages = [
            {"role": "system", "content": f"You are a professional procurement specialist handling vendor communications about product issues. Be helpful but firm about resolution requirements. Address the vendor by their name: {vendor_name}. Sign off as: {sender_name}."}
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
                model="gpt-3.5-turbo",
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
                model="gpt-3.5-turbo",
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
                model="gpt-3.5-turbo",
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
        return {
            'success': True,
            'subject': f"[TEST] Issue Report: {issue_data.get('type')} - {issue_data.get('product_name')}",
            'body': f"""
Dear Vendor,

This is a TEST email regarding an issue with {issue_data.get('product_name')}.

Issue Type: {issue_data.get('type')}
Priority: {issue_data.get('priority')}
Description: {issue_data.get('description')}

Please provide your response at your earliest convenience.

Best regards,
Procurement Team (TEST MODE)
""",
            'confidence': 1.0,
            'model': 'mock'
        }
    
    async def draft_reply(self, issue_data: Dict[str, Any], conversation_history: List[Dict], vendor_message: str) -> Dict[str, Any]:
        """Generate mock reply"""
        vendor_name = issue_data.get('vendor_name', 'Vendor')
        sender_name = issue_data.get('sender_name', 'Procurement Team')
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


class EmailService:
    """Email service for sending and managing email communications"""
    
    def __init__(self):
        self.from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@procurement.buy2rent.eu')
    
    async def send_issue_email(self, issue, subject: str, body: str, to_email: str) -> bool:
        """Send email to vendor about issue"""
        try:
            # Store in communication log first (using sync_to_async for DB operations)
            from .models import AICommunicationLog
            from asgiref.sync import sync_to_async
            
            @sync_to_async
            def create_log_and_update_issue():
                log_entry = AICommunicationLog.objects.create(
                    issue=issue,
                    sender='AI',
                    message=body,
                    message_type='email',
                    subject=subject,
                    email_from=self.from_email,
                    email_to=to_email,
                    ai_generated=True,
                    status='sent',
                    email_thread_id=f"issue-{issue.id}"
                )
                
                # Update issue status
                issue.status = 'Pending Vendor Response'
                issue.ai_activated = True
                issue.save()
                
                return log_entry
            
            log_entry = await create_log_and_update_issue()
            
            # Send actual email (in production, would use async email service)
            await asyncio.to_thread(
                send_mail,
                subject=subject,
                message=body,
                from_email=self.from_email,
                recipient_list=[to_email],
                fail_silently=False,
            )
            
            return True
            
        except Exception as e:
            print(f"Error sending email: {e}")
            return False
    
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
        self.email_service = EmailService()
    
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
                subject_with_id = f"[Issue #{issue.id}] {email_result['subject']}"
                
                # Add Issue ID reference to body footer for tracking
                body_with_tracking = f"""{email_result['body']}

---
Reference: Issue #{issue.id}
Please keep this reference in your reply for tracking purposes."""
                
                await self.email_service.send_issue_email(
                    issue=issue,
                    subject=subject_with_id,
                    body=body_with_tracking,
                    to_email=vendor_email
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
        
        # Get vendor and sender names
        vendor_name = issue.vendor.name if issue.vendor else "Vendor"
        sender_name = "Procurement Team"
        
        # Get conversation history
        from .models import AICommunicationLog
        from asgiref.sync import sync_to_async
        
        @sync_to_async
        def get_history():
            return list(AICommunicationLog.objects.filter(
                issue=issue,
                message_type='email'
            ).order_by('timestamp').values('sender', 'message'))
        
        history = await get_history()
        
        # Prepare issue data for draft_reply
        issue_data = {
            'vendor_name': vendor_name,
            'sender_name': sender_name
        }
        
        # Generate reply using draft_reply method
        reply_result = await self.ai_service.draft_reply(issue_data, history, vendor_message)
        
        if reply_result.get('success'):
            confidence = reply_result.get('confidence', 0.8)
            auto_approve = getattr(settings, 'AI_EMAIL_AUTO_APPROVE', False)
            confidence_threshold = getattr(settings, 'AI_EMAIL_CONFIDENCE_THRESHOLD', 0.8)
            
            should_auto_send = auto_approve and confidence >= confidence_threshold
            
            if should_auto_send:
                # Auto-send the AI reply via email
                subject = f"Re: Issue #{issue.id}"
                body = f"{reply_result['reply']}\n\n---\nReference: Issue #{issue.id}\nPlease keep this reference in your reply."
                
                try:
                    email_message_id = await asyncio.to_thread(
                        self.email_service.send_issue_email,
                        issue,
                        subject,
                        body
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
                    subject=f"Re: Issue #{issue.id}",
                    email_from=getattr(settings, 'DEFAULT_FROM_EMAIL', 'procurement@buy2rent.eu'),
                    email_to=issue.vendor.email if issue.vendor else issue.vendor_contact,
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
        
        return {
            'success': False,
            'error': reply_result.get('error', 'Failed to generate reply')
        }
    
    async def analyze_vendor_response(self, issue, message: str) -> Dict[str, Any]:
        """Analyze vendor's response"""
        from asgiref.sync import sync_to_async
        
        issue_data = {
            'vendor_name': issue.vendor.name if issue.vendor else 'Vendor',
            'type': issue.type,
            'priority': issue.priority
        }
        
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
