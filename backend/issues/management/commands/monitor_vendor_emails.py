"""
Django management command to monitor vendor email responses.
Run with: python manage.py monitor_vendor_emails
"""

from django.core.management.base import BaseCommand
from django.conf import settings
from issues.email_monitor import email_monitor
import time
import logging
import os
import fcntl

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Monitor email inbox for vendor responses'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--once',
            action='store_true',
            help='Run once instead of continuous monitoring',
        )
        parser.add_argument(
            '--interval',
            type=int,
            default=60,
            help='Check interval in seconds (default: 60)',
        )
        parser.add_argument(
            '--max-errors',
            type=int,
            default=5,
            help='Maximum consecutive errors before stopping (default: 5)',
        )
    
    def handle(self, *args, **options):
        once = options['once']
        interval = options['interval']
        max_errors = options['max_errors']
        error_count = 0

        lock_path = os.environ.get('EMAIL_MONITOR_LOCK_FILE', '/tmp/buy2rent_email_monitor.lock')
        lock_fp = None
        try:
            try:
                lock_fp = open(lock_path, 'w')
                fcntl.flock(lock_fp.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
            except BlockingIOError:
                self.stdout.write(self.style.WARNING(
                    f'Email monitor already running (lock: {lock_path}). Exiting.'
                ))
                return
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Failed to acquire email monitor lock: {e}'))
                raise

            self.stdout.write(self.style.SUCCESS('Starting email monitor...'))

            if once:
                self.stdout.write('Checking for vendor emails...')
                try:
                    import logging
                    logging.basicConfig(level=logging.INFO)
                    email_monitor.monitor_inbox()
                    self.stdout.write(self.style.SUCCESS('Email check complete'))
                except Exception as e:
                    logger.error(f"Error during email monitoring: {e}", exc_info=True)
                    self.stdout.write(self.style.ERROR(f'Error: {e}'))
                    raise
                return

            self.stdout.write(f'Monitoring emails every {interval} seconds...')
            self.stdout.write('Press Ctrl+C to stop')

            while True:
                try:
                    email_monitor.monitor_inbox()
                    error_count = 0
                    time.sleep(interval)
                except KeyboardInterrupt:
                    self.stdout.write(self.style.WARNING('\nStopping email monitor...'))
                    break
                except Exception as e:
                    error_count += 1
                    logger.error(f"Error during email monitoring: {e}", exc_info=True)
                    self.stdout.write(self.style.ERROR(f'Error: {e}'))

                    if error_count >= max_errors:
                        self.stdout.write(self.style.ERROR(
                            f'Too many errors ({error_count}). Stopping monitor...'
                        ))
                        break

                    time.sleep(interval)
        finally:
            if lock_fp:
                try:
                    fcntl.flock(lock_fp.fileno(), fcntl.LOCK_UN)
                except Exception:
                    pass
                try:
                    lock_fp.close()
                except Exception:
                    pass