"""
Utility API Views
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .ai_text_enhancer import get_text_enhancer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enhance_text(request):
    """
    Enhance text using AI
    
    POST /api/utils/enhance-text/
    Body: {
        "text": "text to enhance",
        "type": "improve" | "shorten" | "professional" | "friendly"
    }
    """
    text = request.data.get('text', '')
    enhancement_type = request.data.get('type', 'improve')
    
    if not text or not text.strip():
        return Response(
            {'error': 'Text is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    valid_types = ['improve', 'shorten', 'professional', 'friendly', 'translate']
    if enhancement_type not in valid_types:
        return Response(
            {'error': f'Invalid enhancement type. Must be one of: {", ".join(valid_types)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        enhancer = get_text_enhancer()
        enhanced_text = enhancer.enhance_text(text, enhancement_type)
        
        return Response({
            'original': text,
            'enhanced': enhanced_text,
            'type': enhancement_type
        })
        
    except ValueError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    except Exception as e:
        return Response(
            {'error': f'Failed to enhance text: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
