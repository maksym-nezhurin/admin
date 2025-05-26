import apiClient from '../api/apiClient';
import type { ISession } from '../types/auth';
import type { AuthResponse, IUserInfo, LoginCredentials, RegisterResponse, IRegisterForm } from '../types/auth'; 

/**
 * Отримати API токен
 * @param credentials - Об'єкт з username та password
 * @returns {Promise<AuthResponse>}
 */

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const tokenResponse = await apiClient.post<Omit<AuthResponse, 'user'>>('/auth/login', credentials);
    
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
    const res = await apiClient.post('/auth/register', credentials);
    
    return {
      ...res.data,
    }
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

  async getUserSessions(userId: string): Promise<ISession[]> {
    try {
      const res = await apiClient.get<{ sessions: ISession[] }>(`/auth/sessions/${userId}`);
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

  async refreshToken(): Promise<AuthResponse> {
    const currentUser = this.getCurrentUser();
    if (!currentUser?.refresh_token) {
      throw new Error('No refresh token available');
    }
    const response = await apiClient.post<AuthResponse>('/auth/refresh', {
      refresh_token: currentUser.refresh_token,
    });
    if (response.data.access_token) {
      const newTokens: AuthResponse = {
        ...currentUser,
        ...response.data,
      };
      localStorage.setItem('user', JSON.stringify(newTokens));
      return newTokens;
    }
    throw new Error('Failed to refresh token');
  },
};