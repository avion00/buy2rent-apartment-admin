from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Prefetch
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.conf import settings
import asyncio
from config.swagger_utils import add_viewset_tags
from .models import Issue, IssueItem, IssuePhoto, AICommunicationLog
from .serializers import IssueSerializer, IssuePhotoSerializer, AICommunicationLogSerializer
from .ai_services_complete import ai_service
from .ai_services import ai_manager
from .email_service import email_service
import logging

logger = logging.getLogger(__name__)


@add_viewset_tags('Issues', 'Issue')
class IssueViewSet(viewsets.ModelViewSet):
    queryset = Issue.objects.select_related(
        'apartment', 'product', 'vendor', 'order', 'order_item', 'order_item__product'
    ).prefetch_related(
        'photos', 
        'ai_communication_log',
        Prefetch(
            'items',
            queryset=IssueItem.objects.select_related('order_item', 'order_item__product', 'product')
        )
    ).all()
    serializer_class = IssueSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['apartment', 'product', 'vendor', 'order', 'order_item', 'status', 'priority', 'ai_activated']
    search_fields = ['type', 'description', 'product__product', 'vendor__name', 'product_name']
    ordering_fields = ['reported_on', 'expected_resolution', 'created_at']
    ordering = ['-created_at']
    
    def perform_create(self, serializer):
        """Override to auto-send AI email on issue creation"""
        import threading
        
        issue = serializer.save()
        
        # Auto-send AI email if enabled and vendor exists
        auto_activate = getattr(settings, 'AI_EMAIL_AUTO_ACTIVATE', True)
        if auto_activate and issue.vendor and issue.auto_notify_vendor:
            # Send email in background thread to avoid blocking the response
            def send_email_background(issue_id):
                try:
                    # Re-fetch issue in new thread context
                    from .models import Issue
                    issue_obj = Issue.objects.select_related('vendor', 'order').get(id=issue_id)
                    
                    # Generate AI email
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)
                    
                    issue_data = {
                        'issue_id': str(issue_obj.id),
                        'vendor_name': issue_obj.vendor.name,
                        'type': issue_obj.type,
                        'priority': issue_obj.priority,
                        'product_name': issue_obj.get_product_name(),
                        'description': issue_obj.description,
                        'impact': issue_obj.impact,
                        'order_reference': f"Order #{issue_obj.order.po_number}" if issue_obj.order else None
                    }
                    
                    result = loop.run_until_complete(
                        ai_service.generate_issue_email(issue_data)
                    )
                    loop.close()
                    
                    if result.get('success'):
                        # Simple, clean subject: Order #PO, Product, Priority
                        priority_label = issue_obj.priority or 'Medium'
                        product_name = issue_obj.get_product_name()
                        
                        if issue_obj.order and issue_obj.order.po_number:
                            subject = f"Order #{issue_obj.order.po_number}, {product_name}, {priority_label} Priority"
                        else:
                            subject = f"{product_name}, {priority_label} Priority"
                        
                        body = result['body']
                        
                        # Send email with HTML template (initial report)
                        email_service.send_issue_email(
                            issue=issue_obj,
                            subject=subject,
                            body=body,
                            is_initial_report=True,
                            ai_data=result
                        )
                        logger.info(f"Auto-sent AI email for issue {issue_obj.id}")
                    else:
                        logger.error(f"Failed to generate AI email for issue {issue_obj.id}: {result.get('error')}")
                        
                except Exception as e:
                    logger.error(f"Failed to auto-send email for issue {issue_id}: {e}")
            
            # Start background thread for email sending
            email_thread = threading.Thread(target=send_email_background, args=(issue.id,), daemon=True)
            email_thread.start()
            logger.info(f"Issue {issue.id} created, email sending started in background")
    
    @action(detail=True, methods=['post'])
    def activate_ai_email(self, request, pk=None):
        """Activate AI email communication for this issue"""
        from asgiref.sync import async_to_sync
        
        try:
            issue = self.get_object()
            
            # Check if vendor exists
            if not issue.vendor:
                return Response({
                    'success': False,
                    'message': 'No vendor assigned to this issue'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if already activated
            if issue.ai_activated:
                return Response({
                    'success': False,
                    'message': 'AI email already activated for this issue'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Run async function in sync context using async_to_sync
            result = async_to_sync(ai_manager.start_issue_conversation)(issue)
            
            if result['success']:
                return Response({
                    'success': True,
                    'message': 'AI email communication activated',
                    'email_subject': result.get('email_subject')
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'success': False,
                    'message': result.get('message', 'Failed to activate AI'),
                    'error': result.get('error')
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Error activating AI email: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'])
    def email_thread(self, request, pk=None):
        """Get email conversation thread for this issue"""
        issue = self.get_object()
        
        # Get all email communications
        emails = AICommunicationLog.objects.filter(
            issue=issue,
            message_type='email'
        ).order_by('timestamp')
        
        serializer = AICommunicationLogSerializer(emails, many=True)
        return Response({
            'issue_id': str(issue.id),
            'thread_id': f"issue-{issue.id}",
            'messages': serializer.data,
            'ai_activated': issue.ai_activated,
            'current_status': issue.status
        })
    
    @action(detail=True, methods=['post'])
    def generate_ai_reply(self, request, pk=None):
        """Generate AI reply for vendor message"""
        issue = self.get_object()
        vendor_message = request.data.get('vendor_message', '')
        
        if not vendor_message:
            return Response({
                'error': 'Vendor message is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Run async function
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            result = loop.run_until_complete(
                ai_manager.generate_reply_for_approval(issue, vendor_message)
            )
            
            return Response(result)
        finally:
            loop.close()
    
    @action(detail=True, methods=['post'])
    def add_vendor_response(self, request, pk=None):
        """Add a vendor email response and optionally generate AI reply"""
        issue = self.get_object()
        
        # Validate required fields
        message = request.data.get('message', '')
        # Simple default subject
        default_subject = 'Issue Update'
        if issue.order and issue.order.po_number:
            default_subject = f'Order #{issue.order.po_number} - Issue Update'
        subject = request.data.get('subject', default_subject)
        from_email = request.data.get('from_email', issue.vendor.email if issue.vendor else '')
        
        if not message:
            return Response(
                {'error': 'Message content required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create vendor response log
        vendor_log = AICommunicationLog.objects.create(
            issue=issue,
            sender='Vendor',
            message=message,
            message_type='email',
            subject=subject,
            email_from=from_email,
            email_to='procurement@buy2rent.eu',
            status='received',
            email_thread_id=f"issue-{issue.id}",
            timestamp=timezone.now()
        )
        
        # Run async AI analysis and reply generation
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            # Analyze response
            analysis = loop.run_until_complete(
                ai_manager.analyze_vendor_response(issue, message)
            )
            
            # Generate AI reply
            reply_result = loop.run_until_complete(
                ai_manager.generate_reply_for_approval(issue, message)
            )
            
            return Response({
                'vendor_response_id': str(vendor_log.id),
                'analysis': analysis,
                'ai_reply': reply_result,
                'message': 'Vendor response added and AI reply generated'
            })
        finally:
            loop.close()
    
    @action(detail=True, methods=['post'])
    def send_manual_message(self, request, pk=None):
        """Send a manual message to vendor without AI processing"""
        issue = self.get_object()
        # Simple default subject
        default_subject = 'Order Update'
        if issue.order and issue.order.po_number:
            default_subject = f'Order #{issue.order.po_number} - Update'
        subject = request.data.get('subject', default_subject)
        message = request.data.get('message', '')
        to_email = request.data.get('to_email', issue.vendor.email if issue.vendor else '')
        
        if not message:
            return Response({'success': False, 'message': 'Message content is required'}, status=400)
        
        if not to_email:
            return Response({'success': False, 'message': 'Vendor email is required'}, status=400)
        
        try:
            # Send email using email service with HTML template
            email_message_id = email_service.send_manual_message(
                issue=issue,
                subject=subject,
                body=message,
                user=request.user
            )
            
            return Response({
                'success': True,
                'message': 'Manual message sent successfully',
                'email_message_id': email_message_id
            })
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Failed to send message: {str(e)}'
            }, status=500)
    
    @action(detail=True, methods=['get'], url_path='conversation')
    def conversation(self, request, pk=None):
        """Get full conversation thread for this issue"""
        issue = self.get_object()
        
        # Get all communication logs ordered by timestamp
        logs = AICommunicationLog.objects.filter(
            issue=issue
        ).order_by('timestamp')
        
        serializer = AICommunicationLogSerializer(logs, many=True)
        
        return Response({
            'issue_id': str(issue.id),
            'conversation': serializer.data,
            'total_messages': logs.count(),
            'ai_activated': issue.ai_activated,
            'status': issue.status
        })
    
    @action(detail=True, methods=['get'], url_path='summary')
    def summary(self, request, pk=None):
        """Get AI-generated conversation summary and next action"""
        issue = self.get_object()
        
        return Response({
            'issue_id': str(issue.id),
            'last_summary': issue.last_summary,
            'next_action': issue.next_action,
            'last_summary_at': issue.last_summary_at,
            'status': issue.status,
            'vendor_last_replied_at': issue.vendor_last_replied_at,
            'first_sent_at': issue.first_sent_at,
            'followup_count': issue.followup_count,
            'sla_response_hours': issue.sla_response_hours
        })
    
    @action(detail=True, methods=['post'])
    def analyze_vendor_response(self, request, pk=None):
        """Analyze a vendor's response to determine sentiment and next steps"""
        issue = self.get_object()
        message = request.data.get('message', '')
        
        if not message:
            return Response(
                {'error': 'Message content required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Run async analysis
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            issue_data = {
                'issue_id': str(issue.id),
                'vendor_name': issue.vendor.name if issue.vendor else 'Vendor',
                'type': issue.type,
                'priority': issue.priority,
                'product_name': issue.get_product_name()
            }
            
            analysis = loop.run_until_complete(
                ai_service.analyze_vendor_reply(issue_data, message)
            )
            return Response(analysis)
        finally:
            loop.close()
    
    @action(detail=False, methods=['post'], url_path='bulk-email')
    def bulk_email(self, request):
        """Send bulk emails to vendors for multiple issues"""
        issue_ids = request.data.get('issue_ids', [])
        subject = request.data.get('subject', '')
        message = request.data.get('message', '')
        include_issue_details = request.data.get('include_issue_details', True)
        include_photos = request.data.get('include_photos', False)
        
        # Validate input
        if not issue_ids:
            return Response({
                'success': False,
                'message': 'No issues selected'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not subject or not message:
            return Response({
                'success': False,
                'message': 'Subject and message are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Send bulk emails using email service
            results = email_service.send_bulk_emails(
                issue_ids=issue_ids,
                subject=subject,
                body=message,
                user=request.user,
                include_issue_details=include_issue_details,
                include_photos=include_photos
            )
            
            return Response({
                'success': True,
                'message': f'Successfully sent {results["sent"]} emails to vendors',
                'results': results
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Bulk email error: {str(e)}")
            return Response({
                'success': False,
                'message': f'Failed to send bulk emails: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@add_viewset_tags('Issues', 'Issue Photo')
class IssuePhotoViewSet(viewsets.ModelViewSet):
    queryset = IssuePhoto.objects.select_related('issue').all()
    serializer_class = IssuePhotoSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['issue']
    ordering = ['-uploaded_at']


@add_viewset_tags('Issues', 'AI Communication Log')
class AICommunicationLogViewSet(viewsets.ModelViewSet):
    queryset = AICommunicationLog.objects.select_related('issue', 'approved_by').all()
    serializer_class = AICommunicationLogSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['issue', 'sender', 'message_type', 'status', 'ai_generated']
    search_fields = ['message', 'subject']
    ordering = ['timestamp']
    
    @action(detail=False, methods=['get'])
    def pending_approvals(self, request):
        """Get all messages pending approval"""
        pending = self.queryset.filter(
            status='pending_approval',
            message_type='email'
        ).order_by('-timestamp')
        
        serializer = self.get_serializer(pending, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve and send an AI-generated message"""
        message = self.get_object()
        
        if message.status != 'pending_approval':
            return Response({
                'error': 'Message is not pending approval'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            email_service.send_approved_draft(message, request.user)
            return Response({
                'success': True,
                'message': 'Email approved and sent'
            })
        except Exception as e:
            message.status = 'failed'
            message.save()
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def edit_and_send(self, request, pk=None):
        """Edit and send an AI-generated message"""
        message = self.get_object()
        
        new_content = request.data.get('message')
        new_subject = request.data.get('subject', message.subject)
        
        if not new_content:
            return Response({
                'error': 'Message content is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        if message.status != 'pending_approval':
            return Response({
                'error': 'Message is not pending approval'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update message
        message.message = new_content
        message.subject = new_subject
        message.manual_override = True
        message.save()

        try:
            email_service.send_approved_draft(message, request.user)
            return Response({
                'success': True,
                'message': 'Email edited and sent'
            })
        except Exception as e:
            message.status = 'failed'
            message.save()
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
