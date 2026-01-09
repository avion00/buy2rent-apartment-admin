"""
Django management command to monitor vendor email responses
Usage:
    python manage.py monitor_vendor_emails_complete --once
    python manage.py monitor_vendor_emails_complete --interval 60
"""
from django.core.management.base import BaseCommand
from django.conf import settings
from issues.imap_service_complete import imap_service
import time
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Monitor email inbox for vendor responses to issues'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--once',
            action='store_true',
            help='Run once instead of continuous monitoring',
        )
        parser.add_argument(
            '--interval',
            type=int,
            default=300,
            help='Check interval in seconds (default: 300 = 5 minutes)',
        )
        parser.add_argument(
            '--test',
            action='store_true',
            help='Test IMAP connection only',
        )
    
    def handle(self, *args, **options):
        # Configure logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(self.style.SUCCESS(' Vendor Email Monitor'))
        self.stdout.write(self.style.SUCCESS('=' * 60))
        
        # Display configuration
        self.stdout.write(f"\nIMAP Configuration:")
        self.stdout.write(f"  Host: {settings.IMAP_HOST}")
        self.stdout.write(f"  Port: {settings.IMAP_PORT}")
        self.stdout.write(f"  User: {settings.EMAIL_HOST_USER}")
        self.stdout.write(f"  SSL: {settings.IMAP_USE_SSL}")
        self.stdout.write(f"  Inbox: {settings.IMAP_INBOX_FOLDER}")
        
        # Test mode
        if options['test']:
            self.stdout.write("\nTesting IMAP connection...")
            if imap_service.test_connection():
                self.stdout.write(self.style.SUCCESS("✓ IMAP connection successful!"))
            else:
                self.stdout.write(self.style.ERROR("✗ IMAP connection failed!"))
            return
        
        # Run once or continuous
        if options['once']:
            self.stdout.write("\nRunning single check...")
            self.check_emails()
        else:
            interval = options['interval']
            self.stdout.write(f"\nMonitoring emails every {interval} seconds...")
            self.stdout.write("Press Ctrl+C to stop\n")
            
            try:
                while True:
                    self.check_emails()
                    time.sleep(interval)
            except KeyboardInterrupt:
                self.stdout.write("\n\nStopping email monitor...")
                self.stdout.write(self.style.SUCCESS("Email monitor stopped"))
    
    def check_emails(self):
        """Check for new vendor emails"""
        self.stdout.write(f"\n[{time.strftime('%Y-%m-%d %H:%M:%S')}] Checking for vendor emails...")
        
        try:
            emails = imap_service.fetch_new_emails()
            
            if emails:
                self.stdout.write(self.style.SUCCESS(f"✓ Processed {len(emails)} vendor email(s):"))
                for email_data in emails:
                    self.stdout.write(f"  - From: {email_data['from']}")
                    self.stdout.write(f"    Subject: {email_data['subject']}")
                    self.stdout.write(f"    Date: {email_data['date']}")
            else:
                self.stdout.write("  No new vendor emails found")
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"✗ Error: {e}"))
            logger.error(f"Error checking emails: {e}", exc_info=True)
