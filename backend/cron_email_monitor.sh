#!/bin/bash
# Add this to crontab with: crontab -e
# * * * * * /root/buy2rent/backend/cron_email_monitor.sh

cd /root/buy2rent/backend
source myenv/bin/activate
python manage.py monitor_vendor_emails --once
