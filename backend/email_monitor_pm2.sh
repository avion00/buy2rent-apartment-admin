#!/bin/bash
cd /root/buy2rent/backend
source myenv/bin/activate

# Load IMAP_CHECK_INTERVAL from .env, default to 30 seconds
INTERVAL=$(grep IMAP_CHECK_INTERVAL .env | cut -d '=' -f2)
INTERVAL=${INTERVAL:-30}

python manage.py monitor_vendor_emails_complete --interval $INTERVAL
