import axios from 'axios';
import { authService } from '../services/auth';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_GATEWAY_URL || 'http://localhost:3000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  },
});

apiClient.interceptors.request.use((config) => {
  const currentUser = authService.getCurrentUser();
  const token = currentUser?.access_token;
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

let isRefreshing = false;
type FailedQueueItem = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};
let failedQueue: FailedQueueItem[] = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
}

let refreshTokenHandler: (() => Promise<{ access_token: string }>) | null = null;

export function setRefreshTokenHandler(fn: () => Promise<{ access_token: string }>) {
  refreshTokenHandler = fn;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log(`API Client Error:`, error);
    const originalRequest = error.config;
    if (!originalRequest || originalRequest._retry) {
      // Prevent infinite loop
      return Promise.reject(error);
    }
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      originalRequest._retry = true;
      if (isRefreshing) {
        // Queue requests while refreshing
        return new Promise<string>(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
        .then((token: string) => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return apiClient(originalRequest);
        })
        .catch(err => Promise.reject(err));
      }
      isRefreshing = true;
      const retryCount = originalRequest._retryCount || 0;
      try {
        console.log('Attempting to refresh token...');
        let newTokens;
        const currentUser = authService.getCurrentUser();
        const refresh_token = currentUser?.refresh_token;
        if (!refresh_token) {
          isRefreshing = false;
          processQueue('No refresh token', null);
          authService.logout();
          window.location.href = '/login';
          return Promise.reject(new Error('No refresh token available'));
        }
        if (refreshTokenHandler) {
          newTokens = await refreshTokenHandler();
        } else {
          newTokens = await authService.refreshTokenApi(refresh_token);
        }
        processQueue(null, newTokens.access_token);
        originalRequest.headers['Authorization'] = 'Bearer ' + newTokens.access_token;
        isRefreshing = false;
        originalRequest._retryCount = retryCount + 1;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        if (retryCount >= 1) {
          authService.logout();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        } else {
          originalRequest._retryCount = retryCount + 1;
          return apiClient(originalRequest);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
