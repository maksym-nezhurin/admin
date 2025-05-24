import apiClient from './apiClient';
import type { IUser } from '../types/general';

export interface AuthResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  token_type: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

export interface IUserInfo {
  valid: boolean;
  sub?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  email?: string;
  email_verified?: boolean;
  user: IUser | null;
}

/**
 * Отримати API токен
 * @param credentials - Об'єкт з username та password
 * @returns {Promise<AuthResponse>}
 */

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const tokenResponse = await apiClient.post<Omit<AuthResponse, 'user'>>('/auth', credentials);
    
    if (tokenResponse.data.access_token) {
      const fullResponse: AuthResponse = {
        ...tokenResponse.data,
      };

      localStorage.setItem('user', JSON.stringify(fullResponse));
      return fullResponse;
    }
    
    throw new Error('No access token received');
  },

  async verifyToken(token: string): Promise<IUserInfo> {
    try {
      const res = await apiClient.get('/verify', {
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

  logout() {
    console.log('Logging out and clear!');
    
    localStorage.removeItem('user');
  },

  getCurrentUser(): AuthResponse | null {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
  }
};