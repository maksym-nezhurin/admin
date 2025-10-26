import apiClient from '../api/apiClient';
import type { ISession } from '../types/auth';
import type { AuthResponse, IUserInfo, LoginCredentials, RegisterResponse, IRegisterForm } from '../types/auth'; 
import { ROUTES } from './constant';

/**
 * Отримати API токен
 * @param credentials - Об'єкт з username та password
 * @returns {Promise<AuthResponse>}
 */

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const tokenResponse = await apiClient.post<Omit<AuthResponse, 'user'>>(`/${ROUTES.AUTH}/login`, credentials);
    
    if (tokenResponse.data.access_token) {
      const fullResponse: AuthResponse = {
        ...tokenResponse.data,
      };

      localStorage.setItem('user', JSON.stringify(fullResponse));
      return fullResponse;
    }
    
    throw new Error('No access token received');
  },

  async register(credentials: IRegisterForm): Promise<RegisterResponse> {
    const res = await apiClient.post('v1/auth/register', credentials);
    
    return {
      ...res.data,
    }
  },

  async verifyToken(token: string): Promise<IUserInfo> {
    try {
      const res = await apiClient.get('v1/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      return res.data;
    } catch (error) {
      console.error('Token verification failed:', error);
      return {
        valid: false,
        user: null,
      };
    }
  },

  async getUserSessions(userId: string): Promise<ISession[]> {
    try {
      const res = await apiClient.get<{ sessions: ISession[] }>(`${ROUTES.AUTH}/sessions/${userId}`);
      return res.data.sessions || [];
    } catch (error) {
      console.error('Failed to fetch user sessions:', error);
      throw error;
    }
  },

  logout() {
    console.log('Logging out and clear!');
    
    localStorage.removeItem('user');
  },

  getCurrentUser(): AuthResponse | null {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
  },

  /**
   * Оновлення токена (тільки API-запит, без роботи з localStorage)
   */
  async refreshTokenApi(refresh_token: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(`${ROUTES.AUTH}/refresh`, { refresh_token });
    if (response.data.access_token) {
      return response.data;
    }
    throw new Error('Failed to refresh token');
  },
};