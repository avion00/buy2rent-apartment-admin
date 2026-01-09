#!/usr/bin/env python
"""
Script to clean up vendor messages - remove quoted text
Usage: python clean_vendor_messages.py
"""
import os
import sys
import django
import re

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from issues.models import AICommunicationLog

def extract_new_message(body: str) -> str:
    """Extract only the new message, removing quoted text and signatures"""
    if not body:
        return body
    
    # Normalize line endings
    body = body.replace('\r\n', '\n').replace('\r', '\n')
    
    # Split into lines
    lines = body.split('\n')
    new_message_lines = []
    
    for line in lines:
        stripped = line.strip()
        
        # Stop at Gmail-style reply marker "On ... wrote:"
        if re.match(r'^On .+wrote:\s*$', stripped, re.IGNORECASE):
            break
        
        # Stop at "From:" header
        if re.match(r'^From:\s*.+', stripped, re.IGNORECASE):
            break
        
        # Skip quoted lines (start with >)
        if stripped.startswith('>'):
            continue
        
        # Stop at common signature separators
        if stripped in ['--', '---', '___', '_______________']:
            break
        
        # Stop at "Sent from" (mobile signatures)
        if stripped.startswith('Sent from ') or stripped.startswith('Get Outlook for'):
            break
        
        # Add non-empty lines or preserve single blank lines
        if stripped or (new_message_lines and new_message_lines[-1].strip()):
            new_message_lines.append(line)
    
    # Join and clean up
    new_message = '\n'.join(new_message_lines).strip()
    
    # Remove excessive blank lines (more than 2 consecutive)
    new_message = re.sub(r'\n\n\n+', '\n\n', new_message)
    
    return new_message if new_message else body

def clean_vendor_messages():
    """Clean all vendor messages to remove quoted text"""
    
    # Get all vendor messages
    vendor_logs = AICommunicationLog.objects.filter(
        sender='Vendor',
        message_type='email'
    ).order_by('timestamp')
    
    print(f"Found {vendor_logs.count()} vendor message(s) to clean")
    
    cleaned_count = 0
    
    for log in vendor_logs:
        original = log.message
        cleaned = extract_new_message(original)
        
        if cleaned != original:
            print(f"\n{'='*60}")
            print(f"Log ID: {log.id}")
            print(f"Issue: {log.issue.id}")
            print(f"Timestamp: {log.timestamp}")
            print(f"\nOriginal ({len(original)} chars):")
            print(original[:200] + "..." if len(original) > 200 else original)
            print(f"\nCleaned ({len(cleaned)} chars):")
            print(cleaned)
            
            # Update the message
            log.message = cleaned
            log.save()
            
            print(f"✅ Updated")
            cleaned_count += 1
        else:
            print(f"ℹ️  Log {log.id}: Already clean")
    
    print(f"\n{'='*60}")
    print(f"Summary:")
    print(f"  ✅ Cleaned: {cleaned_count}")
    print(f"  📝 Total: {vendor_logs.count()}")
    
    return cleaned_count

if __name__ == '__main__':
    print("="*60)
    print("  Cleaning Vendor Messages")
    print("="*60)
    
    cleaned = clean_vendor_messages()
    
    if cleaned > 0:
        print(f"\n🎉 Successfully cleaned {cleaned} vendor message(s)!")
    else:
        print("\nℹ️  No messages needed cleaning.")
    
    sys.exit(0)
