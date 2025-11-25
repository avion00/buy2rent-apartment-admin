import re
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.contrib.auth import authenticate
from .models import User, LoginAttempt


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Secure user registration serializer with strong validation
    """
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={'input_type': 'password'},
        help_text="Password must be at least 8 characters long with uppercase, lowercase, number and special character"
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 
            'phone', 'password', 'password_confirm'
        ]
        read_only_fields = ['id']
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
            'username': {'required': True},
        }
    
    def validate_email(self, value):
        """Validate email format and uniqueness"""
        if not value:
            raise serializers.ValidationError("Email address is required.")
        
        # Check email format
        from django.core.validators import validate_email
        from django.core.exceptions import ValidationError
        try:
            validate_email(value)
        except ValidationError:
            raise serializers.ValidationError("Please enter a valid email address.")
        
        # Check uniqueness
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "An account with this email address already exists. Please use a different email or try logging in."
            )
        return value.lower()
    
    def validate_username(self, value):
        """Validate username format and uniqueness"""
        if not value:
            raise serializers.ValidationError("Username is required.")
        
        if len(value) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters long.")
        
        if len(value) > 30:
            raise serializers.ValidationError("Username cannot exceed 30 characters.")
        
        # Check for valid characters
        import re
        if not re.match(r'^[a-zA-Z0-9_]+$', value):
            raise serializers.ValidationError(
                "Username can only contain letters, numbers, and underscores."
            )
        
        # Check uniqueness
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "This username is already taken. Please choose a different username."
            )
        return value.lower()
    
    def validate_first_name(self, value):
        """Validate first name"""
        if not value or not value.strip():
            raise serializers.ValidationError("First name is required.")
        
        if len(value.strip()) < 2:
            raise serializers.ValidationError("First name must be at least 2 characters long.")
        
        return value.strip().title()
    
    def validate_last_name(self, value):
        """Validate last name"""
        if not value or not value.strip():
            raise serializers.ValidationError("Last name is required.")
        
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Last name must be at least 2 characters long.")
        
        return value.strip().title()
    
    def validate_phone(self, value):
        """Validate phone number format"""
        if value:
            # Remove spaces and common separators
            cleaned_phone = re.sub(r'[\s\-\(\)]', '', value)
            
            # Check if it's a valid phone number format
            if not re.match(r'^\+?[1-9]\d{1,14}$', cleaned_phone):
                raise serializers.ValidationError(
                    "Please enter a valid phone number (e.g., +1234567890 or 1234567890)."
                )
        
        return value
    
    def validate_password(self, value):
        """Validate password strength"""
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        
        # Additional custom validation
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError("Password must contain at least one lowercase letter.")
        if not re.search(r'\d', value):
            raise serializers.ValidationError("Password must contain at least one number.")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise serializers.ValidationError("Password must contain at least one special character.")
        
        return value
    
    def validate(self, attrs):
        """Validate password confirmation"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': "Password confirmation doesn't match."
            })
        return attrs
    
    def create(self, validated_data):
        """Create user with secure defaults"""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        user = User.objects.create_user(
            password=password,
            is_active=True,  # Set to False if email verification required
            **validated_data
        )
        
        return user


class UserLoginSerializer(serializers.Serializer):
    """
    Secure login serializer with account lockout protection
    """
    email = serializers.EmailField()
    password = serializers.CharField(style={'input_type': 'password'})
    
    def validate(self, attrs):
        email = attrs.get('email', '').lower()
        password = attrs.get('password')
        request = self.context.get('request')
        
        if not email or not password:
            raise serializers.ValidationError("Email and password are required.")
        
        # Get client IP and user agent for security logging
        ip_address = self.get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        try:
            user = User.objects.get(email=email)
            
            # Check if account is locked
            if user.is_account_locked():
                self.log_login_attempt(email, ip_address, user_agent, False, "Account locked")
                raise serializers.ValidationError("Account is temporarily locked due to multiple failed login attempts.")
            
            # Check if account is active
            if not user.is_active:
                self.log_login_attempt(email, ip_address, user_agent, False, "Account inactive")
                raise serializers.ValidationError("Account is inactive.")
            
            # Authenticate user
            user = authenticate(request=request, username=email, password=password)
            if user:
                # Reset failed login attempts on successful login
                user.reset_failed_login()
                user.last_login_ip = ip_address
                user.save(update_fields=['last_login_ip'])
                
                self.log_login_attempt(email, ip_address, user_agent, True, "")
                attrs['user'] = user
                return attrs
            else:
                # Increment failed login attempts
                try:
                    user = User.objects.get(email=email)
                    user.increment_failed_login()
                except User.DoesNotExist:
                    pass
                
                self.log_login_attempt(email, ip_address, user_agent, False, "Invalid credentials")
                raise serializers.ValidationError("Invalid email or password.")
                
        except User.DoesNotExist:
            self.log_login_attempt(email, ip_address, user_agent, False, "User not found")
            raise serializers.ValidationError("Invalid email or password.")
    
    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def log_login_attempt(self, email, ip_address, user_agent, success, failure_reason):
        """Log login attempt for security monitoring"""
        LoginAttempt.objects.create(
            email=email,
            ip_address=ip_address,
            user_agent=user_agent,
            success=success,
            failure_reason=failure_reason
        )


class UserProfileSerializer(serializers.ModelSerializer):
    """
    User profile serializer with security-conscious field exposure
    """
    full_name = serializers.CharField(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 
            'full_name', 'phone', 'avatar', 'is_email_verified',
            'last_login', 'date_joined', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'email', 'is_email_verified', 'last_login', 
            'date_joined', 'created_at', 'updated_at'
        ]


class ChangePasswordSerializer(serializers.Serializer):
    """
    Secure password change serializer
    """
    current_password = serializers.CharField(style={'input_type': 'password'})
    new_password = serializers.CharField(
        min_length=8,
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(style={'input_type': 'password'})
    
    def validate_current_password(self, value):
        """Validate current password"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value
    
    def validate_new_password(self, value):
        """Validate new password strength"""
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        
        # Additional custom validation
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError("Password must contain at least one lowercase letter.")
        if not re.search(r'\d', value):
            raise serializers.ValidationError("Password must contain at least one number.")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise serializers.ValidationError("Password must contain at least one special character.")
        
        return value
    
    def validate(self, attrs):
        """Validate password confirmation and prevent reuse"""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': "Password confirmation doesn't match."
            })
        
        # Prevent password reuse
        user = self.context['request'].user
        if user.check_password(attrs['new_password']):
            raise serializers.ValidationError({
                'new_password': "New password cannot be the same as current password."
            })
        
        return attrs
    
    def save(self):
        """Save new password"""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.last_password_change = timezone.now()
        user.force_password_change = False
        user.save(update_fields=['password', 'last_password_change', 'force_password_change'])
        return user


class UserSessionSerializer(serializers.ModelSerializer):
    """
    User session serializer for session management
    """
    class Meta:
        model = User
        fields = ['id', 'ip_address', 'user_agent', 'created_at', 'last_activity', 'is_active']
        read_only_fields = ['id', 'created_at', 'last_activity']
