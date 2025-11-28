// Token Manager for proactive token refresh
class TokenManager {
  private refreshInterval: NodeJS.Timeout | null = null;
  private readonly REFRESH_BUFFER_TIME = 5 * 60 * 1000; // 5 minutes before expiry

  constructor() {
    // Start monitoring when tokens are available
    this.startTokenMonitoring();
  }

  private startTokenMonitoring() {
    // Check every minute if token needs refresh
    this.refreshInterval = setInterval(() => {
      this.checkAndRefreshToken();
    }, 60 * 1000);
  }

  private async checkAndRefreshToken() {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');

    if (!accessToken || !refreshToken) {
      return;
    }

    try {
      // Decode JWT to check expiration (simple base64 decode)
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeUntilExpiry = expirationTime - currentTime;

      // If token expires within the buffer time, refresh it
      if (timeUntilExpiry <= this.REFRESH_BUFFER_TIME && timeUntilExpiry > 0) {
        console.log('🔄 Proactively refreshing token before expiry');
        await this.refreshAccessToken();
      }
    } catch (error) {
      console.error('Error checking token expiration:', error);
    }
  }

  private async refreshAccessToken(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch('http://localhost:8000/auth/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      
      // Update refresh token if rotation is enabled
      if (data.refresh) {
        localStorage.setItem('refresh_token', data.refresh);
      }

      console.log('✅ Token refreshed successfully');
      
      // Dispatch event to notify other parts of the app
      window.dispatchEvent(new CustomEvent('auth:token-refreshed', {
        detail: { access: data.access }
      }));
    } catch (error) {
      console.error('Failed to refresh token:', error);
      
      // Clear tokens and notify app
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.dispatchEvent(new CustomEvent('auth:token-expired'));
    }
  }

  public startMonitoring() {
    if (!this.refreshInterval) {
      this.startTokenMonitoring();
    }
  }

  public stopMonitoring() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  public async forceRefresh(): Promise<void> {
    await this.refreshAccessToken();
  }

  // Get time until token expires (in milliseconds)
  public getTimeUntilExpiry(): number | null {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) return null;

    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      return expirationTime - Date.now();
    } catch (error) {
      return null;
    }
  }

  // Check if token is expired
  public isTokenExpired(): boolean {
    const timeUntilExpiry = this.getTimeUntilExpiry();
    return timeUntilExpiry !== null && timeUntilExpiry <= 0;
  }

  // Check if token will expire soon
  public willExpireSoon(): boolean {
    const timeUntilExpiry = this.getTimeUntilExpiry();
    return timeUntilExpiry !== null && timeUntilExpiry <= this.REFRESH_BUFFER_TIME;
  }
}

// Create and export singleton instance
export const tokenManager = new TokenManager();
export default tokenManager;
