# Automatic JWT Token Refresh Implementation

## Problem Solved
Users were being automatically logged out after 2-3 hours because the JWT access token expired and the frontend didn't automatically refresh it. This implementation provides seamless token refresh without user intervention.

## Solution Overview

### 1. Extended Token Lifetimes
- **Access Token**: Extended from 1 hour to **4 hours**
- **Refresh Token**: Extended from 7 days to **30 days**
- **Token Rotation**: Enabled for enhanced security

### 2. HTTP Client with Automatic Refresh (`httpClient.ts`)
- Intercepts all API calls
- Automatically detects 401 (Unauthorized) responses
- Refreshes access token using refresh token
- Retries failed requests with new token
- Queues multiple simultaneous requests during refresh
- Handles refresh token expiration gracefully

### 3. Proactive Token Management (`tokenManager.ts`)
- Monitors token expiration in background
- Proactively refreshes tokens **5 minutes before expiry**
- Prevents users from experiencing authentication failures
- Provides token status utilities

### 4. Updated Authentication Context
- Integrated with HTTP client and token manager
- Handles token refresh events
- Starts/stops monitoring based on user session
- Maintains user state during token refresh

### 5. Updated API Services
- All API calls now use the HTTP client
- Automatic token refresh for all backend requests
- No manual token handling required

## Key Features

### Automatic Token Refresh
- **Reactive**: Refreshes token when API returns 401
- **Proactive**: Refreshes token 5 minutes before expiry
- **Seamless**: Users never experience authentication interruptions

### Enhanced Security
- Token rotation enabled (new refresh token on each refresh)
- Automatic token blacklisting after rotation
- Secure token storage and cleanup

### Error Handling
- Graceful handling of refresh token expiration
- Automatic logout when refresh fails
- Event-driven architecture for token state changes

### Developer Experience
- Simple API - just use `httpClient` for all requests
- Token status component for debugging
- Comprehensive logging for troubleshooting

## Usage

### For API Calls
```typescript
import { httpClient } from '../utils/httpClient';

// All requests automatically handle token refresh
const response = await httpClient.get('/api/data/');
const data = await response.json();
```

### For Token Status (Development)
```typescript
import TokenStatus from '../components/TokenStatus';

// Add to your app during development to monitor token status
<TokenStatus />
```

### Manual Token Refresh
```typescript
import { tokenManager } from '../utils/tokenManager';

// Force refresh if needed
await tokenManager.forceRefresh();

// Check token status
const timeLeft = tokenManager.getTimeUntilExpiry();
const isExpired = tokenManager.isTokenExpired();
```

## Configuration

### Backend Settings (settings.py)
```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=4),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}
```

### Frontend Configuration
- HTTP Client base URL: `http://localhost:8000`
- Refresh buffer time: 5 minutes before expiry
- Token monitoring interval: Every 1 minute

## Events

The system dispatches custom events for integration:

- `auth:token-expired`: When refresh token expires
- `auth:token-refreshed`: When token is successfully refreshed

## Benefits

1. **User Experience**: No unexpected logouts during active sessions
2. **Security**: Regular token rotation and automatic cleanup
3. **Reliability**: Handles network issues and concurrent requests
4. **Maintainability**: Centralized token management
5. **Scalability**: Works with any number of API calls

## Testing

To test the implementation:

1. Login to the application
2. Use the TokenStatus component to monitor token expiration
3. Wait for automatic refresh (5 minutes before expiry)
4. Verify that API calls continue to work seamlessly
5. Test force refresh functionality

## Migration Notes

- All existing API calls will automatically benefit from token refresh
- No changes required to existing components using API services
- Token refresh is backward compatible with existing authentication flow

## Troubleshooting

### Common Issues

1. **Token not refreshing**: Check browser console for errors
2. **Infinite refresh loops**: Verify refresh token endpoint is working
3. **User logged out unexpectedly**: Check refresh token expiration

### Debug Information

Enable debug logging by checking browser console for:
- `🔄 Proactively refreshing token before expiry`
- `✅ Token refreshed successfully`
- `🔄 Token expired, logging out user`

## Security Considerations

- Tokens are stored in localStorage (consider httpOnly cookies for production)
- Refresh tokens are rotated on each refresh
- Old tokens are blacklisted automatically
- Token monitoring runs in background but stops on logout

This implementation ensures users can work uninterrupted for extended periods while maintaining security best practices.
