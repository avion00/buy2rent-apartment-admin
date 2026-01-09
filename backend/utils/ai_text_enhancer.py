"""
AI Text Enhancement Utility
Provides text enhancement capabilities using OpenAI API
"""
import os
from openai import OpenAI
from django.conf import settings


class AITextEnhancer:
    """Utility class for enhancing text using OpenAI"""
    
    def __init__(self):
        api_key = getattr(settings, 'OPENAI_API_KEY', None)
        if not api_key:
            raise ValueError("OPENAI_API_KEY not configured in settings")
        self.client = OpenAI(api_key=api_key)
        self.model = "gpt-3.5-turbo"
    
    def enhance_text(self, text: str, enhancement_type: str = "improve") -> str:
        """
        Enhance text using OpenAI
        
        Args:
            text: The text to enhance
            enhancement_type: Type of enhancement (improve, shorten, professional, friendly, translate)
            
        Returns:
            Enhanced text
        """
        if not text or not text.strip():
            return text
        
        prompts = {
            "improve": "Improve and correct the following text. Fix grammar, spelling, and make it clearer while keeping the same meaning and tone. Return only the improved text without explanations:",
            "shorten": "Make the following text more concise while keeping all important information. Return only the shortened text without explanations:",
            "professional": "Rewrite the following text in a professional business tone. Keep the same information but make it more formal. Return only the rewritten text without explanations:",
            "friendly": "Rewrite the following text in a friendly, warm tone while keeping it professional. Return only the rewritten text without explanations:",
            "translate": "Translate the following text to English. If it's already in English, just return it as is. Return only the translated text without explanations:",
        }
        
        prompt = prompts.get(enhancement_type, prompts["improve"])
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that enhances text. Always return only the enhanced text without any explanations or additional commentary."},
                    {"role": "user", "content": f"{prompt}\n\n{text}"}
                ],
                temperature=0.7,
                max_tokens=500
            )
            
            enhanced_text = response.choices[0].message.content.strip()
            # Remove quotes if the AI wrapped the response in them
            if enhanced_text.startswith('"') and enhanced_text.endswith('"'):
                enhanced_text = enhanced_text[1:-1]
            if enhanced_text.startswith("'") and enhanced_text.endswith("'"):
                enhanced_text = enhanced_text[1:-1]
                
            return enhanced_text
            
        except Exception as e:
            raise Exception(f"Failed to enhance text: {str(e)}")


# Singleton instance
_enhancer_instance = None

def get_text_enhancer():
    """Get or create the AI text enhancer instance"""
    global _enhancer_instance
    if _enhancer_instance is None:
        _enhancer_instance = AITextEnhancer()
    return _enhancer_instance
