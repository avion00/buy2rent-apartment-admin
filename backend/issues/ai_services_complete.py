"""
AI Email Services for Issue Management - Complete Implementation
Integrates with Issue model to provide AI-powered vendor communication
"""
import asyncio
from typing import Dict, Any, List
from abc import ABC, abstractmethod
from django.conf import settings
import json
from openai import OpenAI
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
        self.model = getattr(settings, 'OPENAI_MODEL', 'gpt-3.5-turbo')
    
    async def generate_issue_email(self, issue_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate professional issue report email with Issue UUID reference"""
        
        issue_id = issue_data.get('issue_id', 'N/A')
        vendor_name = issue_data.get('vendor_name', 'Vendor')
        
        prompt = f"""
        Generate a professional email to report an issue to a vendor.
        
        CRITICAL: The email MUST include "Issue #{issue_id}" reference.
        
        Issue Details:
        - Issue ID: {issue_id}
        - Vendor: {vendor_name}
        - Issue Type: {issue_data.get('type')}
        - Priority: {issue_data.get('priority')}
        - Product: {issue_data.get('product_name')}
        - Order Reference: {issue_data.get('order_reference', 'N/A')}
        - Description: {issue_data.get('description')}
        - Impact: {issue_data.get('impact', 'N/A')}
        
        Requirements:
        1. Professional and courteous tone
        2. Clear about the issue and impact
        3. Request for resolution with timeline based on priority
        4. Politely request missing evidence if needed (photos, invoice, tracking)
        
        Return ONLY valid JSON with these fields:
        - "subject": A clear subject line
        - "body": The full email body
        - "opening_message": A DETAILED, comprehensive message body that includes:
          * A professional introduction mentioning the issue ID and order reference
          * A bullet-point list of ALL specific issues/problems identified from the description
          * The business impact of these issues
          * A clear resolution request (refund, replacement, etc.)
          * A request for confirmation of next steps and timeline
          This should be the FULL email body content (multiple paragraphs), NOT just 1-2 sentences.
          Do NOT include "Dear..." greeting or signature - those are added separately.
        - "closing_message": A polite closing paragraph (2-3 sentences) thanking them for attention and requesting swift response
        """
        
        try:
            response = await asyncio.to_thread(
                self.client.chat.completions.create,
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a professional procurement specialist. Always return valid JSON with 'subject', 'body', 'opening_message', and 'closing_message' fields. Be deterministic and safe."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            
            content = response.choices[0].message.content
            result = json.loads(content)
            
            # Build detailed fallback opening_message if AI didn't provide one
            body_text = result.get('body', '')
            opening_msg = result.get('opening_message', '')
            
            if not opening_msg and body_text:
                # Use body as opening_message if opening_message is empty
                opening_msg = body_text
            elif not opening_msg:
                # Generate detailed fallback
                opening_msg = self._generate_detailed_opening(issue_data)
            
            return {
                'success': True,
                'subject': result.get('subject', f"Quality Issue Report - {issue_data.get('type')}"),
                'body': body_text,
                'opening_message': opening_msg,
                'closing_message': result.get('closing_message', 'We appreciate your urgent attention and a swift response to this matter. If you require any additional evidence, please let us know.'),
                'confidence': 0.95
            }
        except Exception as e:
            fallback_opening = self._generate_detailed_opening(issue_data)
            return {
                'success': False,
                'error': str(e),
                'subject': f"Quality Issue Report - {issue_data.get('type')}",
                'body': self._generate_fallback_email(issue_data),
                'opening_message': fallback_opening,
                'closing_message': 'We appreciate your urgent attention and a swift response to this matter. If you require any additional evidence, please let us know.'
            }
    
    async def analyze_vendor_reply(self, issue_data: Dict[str, Any], vendor_email_text: str) -> Dict[str, Any]:
        """Analyze vendor response for sentiment, intent, and next actions"""
        
        prompt = f"""
        Analyze this vendor email response to an issue report.
        
        Issue Context:
        - Type: {issue_data.get('type')}
        - Product: {issue_data.get('product_name')}
        - Priority: {issue_data.get('priority')}
        
        Vendor Response:
        {vendor_email_text}
        
        Provide analysis as JSON with:
        - sentiment: "positive", "neutral", or "negative"
        - intent: "accepting_responsibility", "proposing_solution", "requesting_info", "disputing", or "other"
        - commitments: array of specific commitments made by vendor
        - escalation: boolean - true if issue should be escalated
        - suggested_next_action: brief description of recommended next step
        - confidence: float 0-1
        
        Return ONLY valid JSON.
        """
        
        try:
            response = await asyncio.to_thread(
                self.client.chat.completions.create,
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an AI analyzing vendor communications. Return analysis as valid JSON. Be objective and deterministic."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            
            content = response.choices[0].message.content
            analysis = json.loads(content)
            
            return {
                'sentiment': analysis.get('sentiment', 'neutral'),
                'intent': analysis.get('intent', 'other'),
                'commitments': analysis.get('commitments', []),
                'escalation': analysis.get('escalation', False),
                'suggested_next_action': analysis.get('suggested_next_action', 'Review and respond'),
                'confidence': analysis.get('confidence', 0.8)
            }
        except Exception as e:
            return {
                'sentiment': 'neutral',
                'intent': 'other',
                'commitments': [],
                'escalation': False,
                'suggested_next_action': 'Manual review required',
                'confidence': 0.0,
                'error': str(e)
            }
    
    async def draft_reply(self, issue_data: Dict[str, Any], conversation_history: List[Dict], vendor_message: str) -> Dict[str, Any]:
        """Generate contextual reply to vendor message"""
        
        issue_id = issue_data.get('issue_id', 'N/A')
        vendor_name = issue_data.get('vendor_name', 'Vendor')
        
        # Build conversation context
        context = f"""
        Issue #{issue_id}
        Product: {issue_data.get('product_name')}
        Type: {issue_data.get('type')}
        
        Recent conversation:
        """
        
        for msg in conversation_history[-5:]:
            sender = msg.get('sender', 'Unknown')
            message = msg.get('message', '')[:200]
            context += f"\n{sender}: {message}"
        
        context += f"\n\nLatest vendor message:\n{vendor_message}"
        
        prompt = f"""
        Draft a professional reply to the vendor's latest message.
        
        {context}
        
        Requirements:
        1. Address vendor as "{vendor_name}"
        2. Be professional and solution-oriented
        3. Reference Issue #{issue_id}
        4. Request any missing information politely
        5. Sign off as "Procurement Team - Buy2Rent"
        
        Return ONLY valid JSON with 'subject' and 'body' fields.
        """
        
        try:
            response = await asyncio.to_thread(
                self.client.chat.completions.create,
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a professional procurement specialist. Draft helpful, firm replies. Return valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            
            content = response.choices[0].message.content
            result = json.loads(content)
            
            return {
                'success': True,
                'subject': result.get('subject', 'Response to Your Message'),
                'body': result.get('body', ''),
                'confidence': 0.9
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'subject': 'Response to Your Message',
                'body': "Thank you for your response. We will review and get back to you shortly."
            }
    
    async def generate_conversation_summary(self, conversation_history: List[Dict]) -> Dict[str, Any]:
        """Generate summary of conversation and suggest next action"""
        
        if not conversation_history:
            return {
                'summary': 'No conversation history yet.',
                'next_action': 'Awaiting vendor response.',
                'confidence': 1.0
            }
        
        # Build conversation text
        conversation_text = ""
        for msg in conversation_history:
            sender = msg.get('sender', 'Unknown')
            timestamp = msg.get('timestamp', 'N/A')
            message = msg.get('message', '')
            conversation_text += f"\n[{timestamp}] {sender}:\n{message}\n"
        
        prompt = f"""
        Summarize this issue conversation and suggest next action.
        
        Conversation:
        {conversation_text}
        
        Provide JSON with:
        - summary: brief summary of conversation (2-3 sentences)
        - next_action: specific recommended next step
        - confidence: float 0-1
        
        Return ONLY valid JSON.
        """
        
        try:
            response = await asyncio.to_thread(
                self.client.chat.completions.create,
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an AI summarizing procurement conversations. Be concise. Return valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            
            content = response.choices[0].message.content
            result = json.loads(content)
            
            return {
                'summary': result.get('summary', 'Conversation in progress.'),
                'next_action': result.get('next_action', 'Continue monitoring.'),
                'confidence': result.get('confidence', 0.8)
            }
        except Exception as e:
            return {
                'summary': f'Conversation with {len(conversation_history)} messages.',
                'next_action': 'Manual review recommended.',
                'confidence': 0.0,
                'error': str(e)
            }
    
    def _generate_fallback_email(self, issue_data: Dict[str, Any]) -> str:
        """Generate fallback email if AI fails"""
        issue_id = issue_data.get('issue_id', 'N/A')
        return f"""Dear {issue_data.get('vendor_name', 'Vendor')},

We are writing to report an issue with a recent order.

Issue Reference: #{issue_id}
Issue Type: {issue_data.get('type')}
Product: {issue_data.get('product_name')}
Priority: {issue_data.get('priority')}

Description:
{issue_data.get('description')}

We would appreciate your prompt attention to this matter and a proposed resolution.

Please keep the Issue Reference #{issue_id} in your reply for tracking purposes.

Best regards,
Procurement Team - Buy2Rent
"""
    
    def _generate_detailed_opening(self, issue_data: Dict[str, Any]) -> str:
        """Generate detailed opening message for email template"""
        issue_id = issue_data.get('issue_id', 'N/A')
        priority = issue_data.get('priority', 'Medium')
        product_name = issue_data.get('product_name', 'the product')
        order_ref = issue_data.get('order_reference', 'N/A')
        description = issue_data.get('description', '')
        impact = issue_data.get('impact', '')
        issue_type = issue_data.get('type', 'quality issue')
        
        opening = f"""I am writing to formally report a {priority.lower()} priority issue (Issue #{issue_id}) concerning our recent order with reference {order_ref} for {product_name}.

Upon receipt, we identified the following issues with the products delivered:
{description}

{f"These problems have severely impacted our operations: {impact}" if impact else "These issues require your immediate attention."}

We kindly request the following actions:
1. Immediate investigation and resolution of this matter.
2. Confirmation of next steps and timeline for resolution.
3. If applicable, please arrange for replacement or refund as appropriate.

Please confirm the next steps and provide a timeline for resolution given the {priority.lower()} priority of this issue. If you require any additional evidence, such as photographs of the damaged products, copies of the invoice, or tracking information, kindly let us know so we can provide these promptly."""
        
        return opening


class MockAIService(AIServiceInterface):
    """Mock AI service for testing when OPENAI_API_KEY is not configured"""
    
    async def generate_issue_email(self, issue_data: Dict[str, Any]) -> Dict[str, Any]:
        issue_id = issue_data.get('issue_id', 'N/A')
        priority = issue_data.get('priority', 'Medium')
        product_name = issue_data.get('product_name', 'the product')
        order_ref = issue_data.get('order_reference', 'N/A')
        description = issue_data.get('description', '')
        impact = issue_data.get('impact', '')
        
        opening_message = f"""I am writing to formally report a {priority.lower()} priority issue (Issue #{issue_id}) concerning our recent order with reference {order_ref} for {product_name}.

Upon receipt, we identified the following issues with the products delivered:
{description}

{f"These problems have severely impacted our operations: {impact}" if impact else "These issues require your immediate attention."}

We kindly request the following actions:
1. Immediate investigation and resolution of this matter.
2. Confirmation of next steps and timeline for resolution.
3. If applicable, please arrange for replacement or refund as appropriate.

Please confirm the next steps and provide a timeline for resolution given the {priority.lower()} priority of this issue."""
        
        return {
            'success': True,
            'subject': f"[MOCK] Quality Issue Report - {issue_data.get('type')}",
            'body': f"""Dear {issue_data.get('vendor_name', 'Vendor')},

[MOCK MODE - AI Service Not Configured]

Issue Reference: #{issue_id}
Type: {issue_data.get('type')}
Product: {product_name}
Priority: {priority}

Description: {description}

Please respond with your proposed resolution.

Best regards,
Procurement Team - Buy2Rent (MOCK MODE)
""",
            'opening_message': opening_message,
            'closing_message': 'We appreciate your urgent attention and a swift response to this matter. If you require any additional evidence, please let us know.',
            'confidence': 1.0
        }
    
    async def analyze_vendor_reply(self, issue_data: Dict[str, Any], vendor_email_text: str) -> Dict[str, Any]:
        return {
            'sentiment': 'positive',
            'intent': 'proposing_solution',
            'commitments': ['Will investigate', 'Provide update within 24 hours'],
            'escalation': False,
            'suggested_next_action': 'Wait for vendor update',
            'confidence': 1.0
        }
    
    async def draft_reply(self, issue_data: Dict[str, Any], conversation_history: List[Dict], vendor_message: str) -> Dict[str, Any]:
        order_ref = issue_data.get('order_reference', 'N/A')
        return {
            'success': True,
            'subject': f"Urgent: Response Required - Order #{order_ref}" if order_ref != 'N/A' else "Urgent: Response to Your Message - Immediate Action Required",
            'body': f"""Dear {issue_data.get('vendor_name', 'Vendor')},

[MOCK REPLY] Thank you for your response regarding Order #{order_ref}.

We acknowledge your message and will process accordingly.

Best regards,
Procurement Team - Buy2Rent (MOCK MODE)
""",
            'confidence': 1.0
        }
    
    async def generate_conversation_summary(self, conversation_history: List[Dict]) -> Dict[str, Any]:
        return {
            'summary': f'[MOCK] Conversation contains {len(conversation_history)} messages. Issue being tracked.',
            'next_action': 'Continue monitoring vendor response.',
            'confidence': 1.0
        }


# Singleton instance - auto-selects Mock or OpenAI based on configuration
def get_ai_service():
    """Factory function to get appropriate AI service"""
    use_mock = getattr(settings, 'USE_MOCK_AI', True)
    if use_mock or not getattr(settings, 'OPENAI_API_KEY', None):
        return MockAIService()
    return OpenAIService()


ai_service = get_ai_service()
