"""
Management command to fetch and process vendor email replies via IMAP
"""
from django.core.management.base import BaseCommand
from django.conf import settings
from issues.imap_service import imap_service
import time
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Fetch and process vendor email replies via IMAP'

    def add_arguments(self, parser):
        parser.add_argument(
            '--continuous',
            action='store_true',
            help='Run continuously, checking for new emails periodically'
        )
        parser.add_argument(
            '--interval',
            type=int,
            default=60,
            help='Check interval in seconds (default: 60)'
        )
        parser.add_argument(
            '--test',
            action='store_true',
            help='Test IMAP connection only'
        )

    def handle(self, *args, **options):
        # Configure logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(self.style.SUCCESS(' IMAP Email Fetcher'))
        self.stdout.write(self.style.SUCCESS('=' * 60))
        
        # Display configuration
        self.stdout.write(f"\nIMAP Configuration:")
        self.stdout.write(f"  Host: {settings.IMAP_HOST}")
        self.stdout.write(f"  Port: {settings.IMAP_PORT}")
        self.stdout.write(f"  User: {settings.IMAP_USER}")
        self.stdout.write(f"  SSL: {settings.IMAP_USE_SSL}")
        
        # Test mode
        if options['test']:
            self.stdout.write("\nTesting IMAP connection...")
            if imap_service.test_connection():
                self.stdout.write(self.style.SUCCESS("✓ IMAP connection successful!"))
            else:
                self.stdout.write(self.style.ERROR("✗ IMAP connection failed!"))
            return
        
        # Connect to IMAP
        if not imap_service.connect():
            self.stdout.write(self.style.ERROR("Failed to connect to IMAP server"))
            return
        
        self.stdout.write(self.style.SUCCESS("\n✓ Connected to IMAP server"))
        
        try:
            if options['continuous']:
                self.stdout.write(f"\nRunning continuously (checking every {options['interval']} seconds)")
                self.stdout.write("Press Ctrl+C to stop\n")
                
                while True:
                    self.fetch_and_process()
                    time.sleep(options['interval'])
            else:
                self.fetch_and_process()
        
        except KeyboardInterrupt:
            self.stdout.write("\n\nStopping email fetcher...")
        finally:
            imap_service.disconnect()
            self.stdout.write(self.style.SUCCESS("Disconnected from IMAP server"))
    
    def fetch_and_process(self):
        """Fetch and process new emails"""
        self.stdout.write(f"\n[{time.strftime('%Y-%m-%d %H:%M:%S')}] Checking for new emails...")
        
        emails = imap_service.fetch_new_emails()
        
        if emails:
            self.stdout.write(self.style.SUCCESS(f"✓ Processed {len(emails)} new email(s):"))
            for email_data in emails:
                self.stdout.write(f"  - From: {email_data['from']}")
                self.stdout.write(f"    Subject: {email_data['subject']}")
                self.stdout.write(f"    Date: {email_data['date']}")
        else:
            self.stdout.write("  No new vendor emails found")
