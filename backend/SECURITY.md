# 🔐 Security Documentation - Buy2Rent API

## Overview

This API implements enterprise-grade security features including JWT authentication, UUID-based user IDs, account lockout protection, and comprehensive security logging.

## 🔑 Authentication System

### JWT Bearer Token Authentication
- **Token Type**: Bearer tokens using JWT (JSON Web Tokens)
- **Algorithm**: HS256 with secure signing key
- **Access Token Lifetime**: 1 hour
- **Refresh Token Lifetime**: 7 days
- **Token Rotation**: Enabled (new refresh token on each refresh)
- **Blacklisting**: Tokens are blacklisted on logout/password change

### User Model Security
- **Primary Key**: UUID (not sequential integers)
- **Email**: Unique identifier for authentication
- **Password**: Strong validation with complexity requirements
- **Account Lockout**: 5 failed attempts = 30-minute lockout
- **Session Tracking**: All user sessions are logged and manageable

## 🛡️ Security Features

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter  
- At least 1 number
- At least 1 special character (!@#$%^&*(),.?":{}|<>)
- Cannot reuse current password
- Django's built-in password validators

### Account Protection
- **Failed Login Tracking**: All attempts logged with IP and user agent
- **Account Lockout**: Automatic lockout after 5 failed attempts
- **Lockout Duration**: 30 minutes (configurable)
- **IP Tracking**: Last login IP address stored
- **Session Management**: Multiple session tracking and termination

### Security Headers
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (HTTPS only)
- Secure cookie settings

## 📡 API Endpoints

### Authentication Endpoints

#### POST /auth/login/
Login with email and password, returns JWT tokens.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "username": "user123",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

#### POST /auth/refresh/
Refresh access token using refresh token.

**Request:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### POST /auth/register/
Register new user account.

**Request:**
```json
{
  "email": "newuser@example.com",
  "username": "newuser",
  "first_name": "Jane",
  "last_name": "Smith",
  "password": "SecurePassword123!",
  "password_confirm": "SecurePassword123!"
}
```

#### POST /auth/logout/
Logout and blacklist refresh token.

**Request:**
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### GET /auth/profile/
Get current user profile (requires authentication).

#### PUT /auth/profile/
Update user profile (requires authentication).

#### POST /auth/change-password/
Change user password (requires authentication).

**Request:**
```json
{
  "current_password": "OldPassword123!",
  "new_password": "NewPassword456!",
  "new_password_confirm": "NewPassword456!"
}
```

#### GET /auth/sessions/
Get all active user sessions.

#### DELETE /auth/sessions/{session_id}/
Terminate specific user session.

## 🔒 Using Authentication

### Header Format
All authenticated requests must include the JWT token in the Authorization header:

```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### Frontend Integration Example

```javascript
// Login
const loginResponse = await fetch('/auth/login/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePassword123!'
  })
});

const { access_token, refresh_token } = await loginResponse.json();

// Store tokens securely
localStorage.setItem('access_token', access_token);
localStorage.setItem('refresh_token', refresh_token);

// Make authenticated requests
const apiResponse = await fetch('/api/clients/', {
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json',
  }
});

// Handle token refresh
if (apiResponse.status === 401) {
  const refreshResponse = await fetch('/auth/refresh/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      refresh: refresh_token
    })
  });
  
  if (refreshResponse.ok) {
    const { access } = await refreshResponse.json();
    localStorage.setItem('access_token', access);
    // Retry original request with new token
  } else {
    // Redirect to login
  }
}
```

## 🛡️ Security Best Practices

### For Developers

1. **Token Storage**: Store JWT tokens securely (httpOnly cookies preferred over localStorage)
2. **Token Refresh**: Implement automatic token refresh logic
3. **Logout**: Always call logout endpoint to blacklist tokens
4. **HTTPS**: Use HTTPS in production
5. **Environment Variables**: Store sensitive settings in environment variables

### For Production

1. **SECRET_KEY**: Use a strong, unique secret key
2. **DATABASE**: Use PostgreSQL with SSL
3. **CORS**: Configure CORS_ALLOWED_ORIGINS for your domain only
4. **Rate Limiting**: Implement rate limiting (consider django-ratelimit)
5. **Monitoring**: Monitor failed login attempts and suspicious activity

## 📊 Security Monitoring

### Admin Interface
Access `/admin/` to monitor:
- **User Accounts**: View account status, failed attempts, lockouts
- **Login Attempts**: All login attempts with IP addresses and outcomes
- **User Sessions**: Active sessions and session management
- **Security Events**: Failed logins, account lockouts, password changes

### Database Tables
- `auth_user`: Custom user model with UUID primary keys
- `user_sessions`: Active user sessions tracking
- `login_attempts`: All login attempts for security monitoring

## 🚨 Security Incidents

### Account Lockout
If an account is locked:
1. Check login attempts in admin panel
2. Verify legitimate user vs. attack
3. Unlock account manually if needed
4. Investigate IP addresses for patterns

### Suspicious Activity
Monitor for:
- Multiple failed logins from same IP
- Login attempts outside business hours
- Unusual geographic locations
- Rapid successive login attempts

### Token Compromise
If tokens are compromised:
1. Change user password (invalidates all tokens)
2. Terminate all user sessions
3. Check login attempts for unauthorized access
4. Update security measures if needed

## 🔧 Configuration

### Environment Variables
```bash
# Security
SECRET_KEY=your-super-secure-secret-key-here
DEBUG=False

# JWT Settings (optional, defaults provided)
JWT_ACCESS_TOKEN_LIFETIME=3600  # 1 hour in seconds
JWT_REFRESH_TOKEN_LIFETIME=604800  # 7 days in seconds

# Database (production)
DATABASE_URL=postgresql://user:pass@host:port/dbname

# CORS (production)
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

### Security Settings Override
```python
# In production settings
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
```

## 🧪 Testing Security

### Swagger UI Testing
1. Go to `/api/docs/`
2. Click "Authorize" button
3. Login via `/auth/login/` endpoint
4. Copy the `access_token` from response
5. Enter `Bearer <access_token>` in authorization
6. Test protected endpoints

### Manual Testing
```bash
# Test login
curl -X POST http://localhost:8000/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@buy2rent.com","password":"SecureAdmin123!"}'

# Test protected endpoint
curl -X GET http://localhost:8000/api/clients/ \
  -H "Authorization: Bearer <your-token-here>"

# Test token refresh
curl -X POST http://localhost:8000/auth/refresh/ \
  -H "Content-Type: application/json" \
  -d '{"refresh":"<your-refresh-token>"}'
```

## 📋 Security Checklist

- [ ] JWT tokens implemented with Bearer authentication
- [ ] UUID primary keys for all users
- [ ] Strong password validation enforced
- [ ] Account lockout after failed attempts
- [ ] All login attempts logged
- [ ] Session management implemented
- [ ] Security headers configured
- [ ] HTTPS enforced in production
- [ ] CORS properly configured
- [ ] Admin monitoring interface available
- [ ] Token blacklisting on logout
- [ ] Password change invalidates sessions
- [ ] Environment variables for sensitive data
- [ ] Database migrations completed
- [ ] Swagger UI authentication working

This security implementation provides enterprise-grade protection for your Buy2Rent apartment management API.
