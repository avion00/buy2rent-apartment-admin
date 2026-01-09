"""
Management command to manually add vendor email responses
Since IMAP is not configured, this allows manual entry of vendor replies
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from issues.models import Issue, AICommunicationLog
from issues.ai_services import ai_manager
import asyncio


class Command(BaseCommand):
    help = 'Add a vendor email response to an issue'

    def add_arguments(self, parser):
        parser.add_argument('issue_id', type=str, help='Issue ID')
        parser.add_argument('--from', dest='from_email', type=str, required=True, help='Vendor email address')
        parser.add_argument('--subject', type=str, required=True, help='Email subject')
        parser.add_argument('--message', type=str, required=True, help='Email message body')
        parser.add_argument('--analyze', action='store_true', help='Analyze and generate AI reply')

    def handle(self, *args, **options):
        try:
            issue = Issue.objects.get(id=options['issue_id'])
        except Issue.DoesNotExist:
            self.stdout.write(self.style.ERROR(f"Issue {options['issue_id']} not found"))
            return

        # Create vendor response log
        vendor_log = AICommunicationLog.objects.create(
            issue=issue,
            sender='Vendor',
            message=options['message'],
            message_type='email',
            subject=options['subject'],
            email_from=options['from_email'],
            email_to='procurement@buy2rent.eu',
            status='received',
            email_thread_id=f"issue-{issue.id}",
            timestamp=timezone.now()
        )

        self.stdout.write(self.style.SUCCESS(f"✓ Vendor response added to issue {issue.id}"))
        self.stdout.write(f"  From: {options['from_email']}")
        self.stdout.write(f"  Subject: {options['subject']}")

        if options['analyze']:
            self.stdout.write("\nAnalyzing vendor response and generating AI reply...")
            
            # Run async AI analysis
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            try:
                # Analyze response
                analysis = loop.run_until_complete(
                    ai_manager.analyze_vendor_response(issue, options['message'])
                )
                
                self.stdout.write(self.style.SUCCESS("\n✓ Analysis complete:"))
                self.stdout.write(f"  Sentiment: {analysis.get('sentiment')}")
                self.stdout.write(f"  Intent: {analysis.get('intent')}")
                self.stdout.write(f"  Action: {analysis.get('suggested_action')}")
                
                # Generate AI reply
                reply_result = loop.run_until_complete(
                    ai_manager.generate_reply_for_approval(issue, options['message'])
                )
                
                if reply_result.get('success'):
                    self.stdout.write(self.style.SUCCESS("\n✓ AI Reply generated:"))
                    self.stdout.write(f"  Message ID: {reply_result.get('message_id')}")
                    self.stdout.write(f"  Status: Pending Approval")
                    self.stdout.write(f"\nReply preview:")
                    self.stdout.write("-" * 50)
                    self.stdout.write(reply_result.get('reply', '')[:500])
                    self.stdout.write("-" * 50)
                    self.stdout.write(f"\nView in admin: /api/ai-communication-logs/{reply_result.get('message_id')}/")
                else:
                    self.stdout.write(self.style.ERROR(f"Failed to generate reply: {reply_result.get('error')}"))
                    
            finally:
                loop.close()
        else:
            self.stdout.write("\nUse --analyze flag to generate AI reply")
