import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { authService } from '../services/auth';
import { notificationService, isServiceAvailable } from '../services/notification';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_GATEWAY_URL || 'http://localhost:3000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000, // 30 seconds timeout
});

// Extend AxiosRequestConfig to include our custom properties
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _retryCount?: number;
}

/**
 * Request interceptor - adds Authorization header if token exists
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const currentUser = authService.getCurrentUser();
    const token = currentUser?.access_token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Token refresh state management
let isRefreshing = false;
const MAX_RETRY_COUNT = 2;

type FailedQueueItem = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let failedQueue: FailedQueueItem[] = [];

/**
 * Process all queued requests after token refresh
 */
function processQueue(error: unknown, token: string | null = null): void {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
}

type RefreshTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
};

let refreshTokenHandler: (() => Promise<RefreshTokenResponse>) | null = null;

/**
 * Set custom refresh token handler (used by AuthContext)
 * Handler should return tokens (access_token is required)
 */
export function setRefreshTokenHandler(fn: () => Promise<RefreshTokenResponse>): void {
  refreshTokenHandler = fn;
}

/**
 * Check if URL is an authentication endpoint that shouldn't trigger token refresh
 */
function isAuthEndpoint(url: string | undefined): boolean {
  if (!url) return false;
  const authEndpoints = ['/auth/login', '/auth/register', '/auth/refresh'];
  return authEndpoints.some(endpoint => url.includes(endpoint));
}

/**
 * Check if request has Authorization header (user is logged in)
 */
function hasAuthHeader(config: InternalAxiosRequestConfig | undefined): boolean {
  return !!config?.headers?.Authorization;
}

/**
 * Update localStorage with new tokens after successful refresh
 */
function updateStoredTokens(newTokens: { access_token: string; refresh_token?: string; expires_in?: number }): void {
  const currentUser = authService.getCurrentUser();
  if (currentUser) {
    const updatedUser = {
      ...currentUser,
      ...newTokens,
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    localStorage.setItem('tokenTimestamp', Date.now().toString());
  }
}

/**
 * Handle logout and redirect to login page
 */
function handleLogout(): void {
  authService.logout();
  // Use window.location instead of navigate to ensure full page reload
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

/**
 * Response interceptor - handles token refresh and error handling
 */
apiClient.interceptors.response.use(
  (response) => {
    // Check if service is unavailable in successful responses
    const unavailabilityMessage = isServiceAvailable(response);
    if (unavailabilityMessage) {
      notificationService.serviceStatus(unavailabilityMessage);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig | undefined;

    // If no original request or already retried, reject immediately
    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Check if service is unavailable
    const unavailabilityMessage = isServiceAvailable(error);
    if (unavailabilityMessage) {
      notificationService.serviceStatus(unavailabilityMessage);
      // Don't try to refresh token if service is unavailable
      return Promise.reject(error);
    }

    // Handle network errors (no response from server)
    if (!error.response) {
      // Network error or timeout
      if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
        notificationService.error('Network error. Please check your connection.', {
          title: 'Connection Error',
        });
      }
      return Promise.reject(error);
    }

    const { status } = error.response;

    // Only handle 401 (Unauthorized) for token refresh
    // 403 (Forbidden) usually means insufficient permissions, not expired token
    if (status === 401) {
      // Don't try to refresh token for auth endpoints (login, register, refresh)
      // These 401 errors are authentication failures, not expired tokens
      if (isAuthEndpoint(originalRequest.url)) {
        return Promise.reject(error);
      }

      // Don't refresh if there's no Authorization header (user is not logged in)
      if (!hasAuthHeader(originalRequest)) {
        return Promise.reject(error);
      }

      // Check retry count to prevent infinite loops
      const retryCount = originalRequest._retryCount || 0;
      if (retryCount >= MAX_RETRY_COUNT) {
        handleLogout();
        return Promise.reject(new Error('Maximum retry count exceeded'));
      }

      originalRequest._retry = true;
      originalRequest._retryCount = retryCount + 1;

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token: string) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // Start token refresh process
      isRefreshing = true;

      try {
        const currentUser = authService.getCurrentUser();
        const refresh_token = currentUser?.refresh_token;

        if (!refresh_token) {
          isRefreshing = false;
          processQueue(new Error('No refresh token available'), null);
          handleLogout();
          return Promise.reject(new Error('No refresh token available'));
        }

        // Use custom handler if available, otherwise use authService
        let newTokens: { access_token: string; refresh_token?: string; expires_in?: number };
        
        if (refreshTokenHandler) {
          // refreshTokenHandler returns AuthResponse (with user), extract tokens
          const refreshResponse = await refreshTokenHandler();
          newTokens = {
            access_token: refreshResponse.access_token,
            refresh_token: refreshResponse.refresh_token,
            expires_in: refreshResponse.expires_in,
          };
        } else {
          const refreshResponse = await authService.refreshTokenApi(refresh_token);
          newTokens = refreshResponse;
        }

        // Update localStorage with new tokens
        updateStoredTokens(newTokens);

        // Process queued requests with new token
        processQueue(null, newTokens.access_token);

        // Update original request with new token
        originalRequest.headers['Authorization'] = `Bearer ${newTokens.access_token}`;
        
        isRefreshing = false;

        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);

        // If refresh failed, logout user
        handleLogout();
        return Promise.reject(refreshError);
      }
    }

    // For 403 (Forbidden) - usually means insufficient permissions
    // Don't try to refresh token, just reject
    if (status === 403) {
      return Promise.reject(error);
    }

    // For all other errors, reject normally
    return Promise.reject(error);
  }
);

export default apiClient;
