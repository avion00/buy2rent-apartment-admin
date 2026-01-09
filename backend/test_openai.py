#!/usr/bin/env python
"""
Test OpenAI API connection
"""
import os
import sys
import django

# Setup Django environment
sys.path.insert(0, '/root/buy2rent/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
os.environ['OPENAI_API_KEY'] = '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'
django.setup()

from django.conf import settings
import openai
from openai import OpenAI

def test_openai():
    print("Testing OpenAI Configuration...")
    print(f"API Key present: {'Yes' if settings.OPENAI_API_KEY else 'No'}")
    print(f"Model: {settings.OPENAI_MODEL}")
    print(f"USE_MOCK_AI: {settings.USE_MOCK_AI}")
    
    if not settings.OPENAI_API_KEY:
        print("ERROR: No API key found!")
        return
    
    try:
        # Test with new OpenAI client
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",  # Use cheaper model for testing
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Say 'OpenAI connection successful' in 5 words or less"}
            ],
            max_tokens=20
        )
        
        print(f"\n✓ OpenAI API Response: {response.choices[0].message.content}")
        
    except Exception as e:
        print(f"\n✗ OpenAI API Error: {e}")
        print("\nPossible issues:")
        print("1. Invalid API key")
        print("2. API key expired or revoked")
        print("3. Rate limit exceeded")
        print("4. Network connectivity issues")

if __name__ == "__main__":
    test_openai()
