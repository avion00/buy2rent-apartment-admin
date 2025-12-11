"""
Middleware to capture the current user for activity logging
"""
from .signals import set_current_user, clear_current_user


class ActivityUserMiddleware:
    """
    Middleware that sets the current user for activity logging.
    This allows signals to know which user performed an action.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Set the current user before processing the request
        if hasattr(request, 'user') and request.user.is_authenticated:
            set_current_user(request.user)
        else:
            clear_current_user()
        
        response = self.get_response(request)
        
        # Clear the user after the request is processed
        clear_current_user()
        
        return response
