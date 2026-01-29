"""
AI Email Management Dashboard Views - Professional Integration
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q, Avg
from django.db import models
from django.utils import timezone
from django.conf import settings
from datetime import timedelta
from drf_spectacular.utils import extend_schema, OpenApiResponse
from issues.models import Issue, AICommunicationLog
from issues.email_service import EmailService
import asyncio
import logging

logger = logging.getLogger(__name__)


class AIEmailDashboardView(APIView):
    """Professional AI Email Management Dashboard"""
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        tags=['Dashboard', 'AI Email'],
        summary='Get AI email management dashboard data',
        responses={
            200: OpenApiResponse(description='AI email dashboard data')
        }
    )
    def get(self, request):
        try:
            today = timezone.now().date()
            last_7_days = today - timedelta(days=7)
            
            # Pending Approvals with details
            pending_approvals = []
            pending_msgs = AICommunicationLog.objects.filter(
                status='pending_approval',
                message_type='email'
            ).select_related('issue', 'issue__vendor', 'issue__apartment').order_by('-timestamp')
            
            for msg in pending_msgs[:20]:  # Limit to 20 most recent
                pending_approvals.append({
                    'id': str(msg.id),
                    'issue_id': str(msg.issue.id),
                    'issue_type': msg.issue.type,
                    'vendor': msg.issue.vendor.name if msg.issue.vendor else 'Unknown',
                    'apartment': msg.issue.apartment.name if msg.issue.apartment else None,
                    'subject': msg.subject,
                    'to_email': msg.email_to,
                    'message_preview': msg.message[:200] + '...' if len(msg.message) > 200 else msg.message,
                    'ai_confidence': msg.ai_confidence,
                    'created_at': msg.timestamp.isoformat(),
                    'priority': msg.issue.priority,
                })
            
            # Email Threads
            active_threads = []
            issues_with_emails = Issue.objects.filter(
                ai_activated=True,
                ai_communication_log__message_type='email'
            ).distinct().order_by('-updated_at')[:10]
            
            for issue in issues_with_emails:
                emails = AICommunicationLog.objects.filter(
                    issue=issue,
                    message_type='email'
                ).order_by('-timestamp')
                
                last_email = emails.first()
                active_threads.append({
                    'issue_id': str(issue.id),
                    'issue_type': issue.type,
                    'vendor': issue.vendor.name if issue.vendor else 'Unknown',
                    'email_count': emails.count(),
                    'last_sender': last_email.sender if last_email else None,
                    'last_subject': last_email.subject if last_email else None,
                    'last_timestamp': last_email.timestamp.isoformat() if last_email else None,
                    'status': issue.status,
                    'has_pending': emails.filter(status='pending_approval').exists(),
                })
            
            # Statistics
            stats = {
                'total_ai_issues': Issue.objects.filter(ai_activated=True).count(),
                'total_emails': AICommunicationLog.objects.filter(message_type='email').count(),
                'pending_approvals': pending_msgs.count(),
                'emails_sent_today': AICommunicationLog.objects.filter(
                    status='sent',
                    timestamp__date=today
                ).count(),
                'vendor_responses_today': AICommunicationLog.objects.filter(
                    sender='Vendor',
                    timestamp__date=today
                ).count(),
                'ai_emails_last_7_days': AICommunicationLog.objects.filter(
                    sender='AI',
                    status='sent',
                    timestamp__date__gte=last_7_days
                ).count(),
                'avg_confidence': AICommunicationLog.objects.filter(
                    ai_generated=True
                ).aggregate(avg=Avg('ai_confidence'))['avg'] or 0,
            }
            
            # Auto-approval settings
            auto_approval_config = {
                'enabled': getattr(settings, 'AI_AUTO_MODE', False),
                'confidence_threshold': getattr(settings, 'AI_CONFIDENCE_THRESHOLD', 0.8),
                'auto_approved_today': AICommunicationLog.objects.filter(
                    ai_generated=True,
                    status='sent',
                    approved_by__isnull=True,  # Auto-approved ones have no approver
                    timestamp__date=today
                ).count(),
            }
            
            return Response({
                'pending_approvals': pending_approvals,
                'active_threads': active_threads,
                'statistics': stats,
                'auto_approval': auto_approval_config,
            })
        except Exception as e:
            return Response({
                'error': str(e),
                'pending_approvals': [],
                'active_threads': [],
                'statistics': {},
                'auto_approval': {},
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AIEmailApprovalView(APIView):
    """Bulk approval endpoint for AI emails"""
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        tags=['Dashboard', 'AI Email'],
        summary='Approve AI email messages',
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'message_ids': {
                        'type': 'array',
                        'items': {'type': 'string'},
                        'description': 'List of message IDs to approve'
                    },
                    'approve_all': {
                        'type': 'boolean',
                        'description': 'Approve all pending messages'
                    }
                }
            }
        },
        responses={
            200: OpenApiResponse(description='Approval results')
        }
    )
    def post(self, request):
        try:
            approve_all = request.data.get('approve_all', False)
            message_ids = request.data.get('message_ids', [])
            
            if approve_all:
                # Approve all pending messages
                messages = AICommunicationLog.objects.filter(
                    status='pending_approval',
                    message_type='email'
                )
            elif message_ids:
                # Approve specific messages
                messages = AICommunicationLog.objects.filter(
                    id__in=message_ids,
                    status='pending_approval'
                )
            else:
                return Response({
                    'error': 'No messages specified for approval'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            approved_count = 0
            failed_count = 0
            errors = []
            email_service = EmailService()
            
            for msg in messages:
                try:
                    # Use proper EmailService with HTML templates and tracking
                    email_service.send_approved_draft(msg, request.user)
                    approved_count += 1
                    logger.info(f"Approved and sent email {msg.id} for issue {msg.issue.id}")
                except Exception as e:
                    failed_count += 1
                    error_msg = f"Failed to send message {msg.id}: {str(e)}"
                    errors.append(error_msg)
                    logger.error(error_msg)
            
            response_data = {
                'approved': approved_count,
                'failed': failed_count,
                'message': f'Successfully approved {approved_count} messages'
            }
            
            if errors:
                response_data['errors'] = errors
            
            return Response(response_data)
        except Exception as e:
            logger.error(f"Email approval error: {str(e)}")
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AIEmailAutoApprovalConfigView(APIView):
    """Configure auto-approval settings"""
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        tags=['Dashboard', 'AI Email'],
        summary='Configure auto-approval settings',
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'enabled': {'type': 'boolean'},
                    'confidence_threshold': {'type': 'number', 'minimum': 0, 'maximum': 1},
                }
            }
        },
        responses={
            200: OpenApiResponse(description='Configuration updated')
        }
    )
    def post(self, request):
        try:
            # In production, save these to database or cache
            # For now, return current settings
            return Response({
                'enabled': getattr(settings, 'AI_AUTO_MODE', False),
                'confidence_threshold': getattr(settings, 'AI_CONFIDENCE_THRESHOLD', 0.8),
                'message': 'Auto-approval configuration retrieved'
            })
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
