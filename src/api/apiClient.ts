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

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default apiClient;
