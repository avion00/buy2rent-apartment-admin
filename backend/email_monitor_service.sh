#!/bin/bash
# Email monitor service script

cd /root/buy2rent/backend
source myenv/bin/activate
python manage.py monitor_vendor_emails
