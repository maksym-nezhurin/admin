import apiClient from '../api/apiClient';
import type { ISession, IUser } from '../types/auth';
import type { AuthResponse, LoginCredentials, RegisterResponse, IRegisterForm } from '../types/auth'; 
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
      localStorage.setItem('tokenTimestamp', Date.now().toString());
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

  async verifyToken(token: string): Promise<{ valid: boolean; user: IUser | null }> {
    try {
      const res = await apiClient.get('v1/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      return { valid: true, user: res.data.user as IUser };
    } catch (error) {
      console.error('Token verification failed:', error);
      return {
        valid: false,
        user: null,
      };
    }
  },

  async getUserSessions(userId: string): Promise<any> {
    try {
      const res = await apiClient.get<{ sessions: ISession[] }>(`${ROUTES.AUTH}/sessions/${userId}`);
      return res.data;
    } catch (error) {
      console.error('Failed to fetch user sessions:', error);
      throw error;
    }
  },

  logout() {
    console.log('Logging out and clear!');
    
    localStorage.removeItem('user');
    localStorage.removeItem('tokenTimestamp');
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

  /**
   * Get all users (super admin only)
   */
  async getAllUsers(): Promise<any[]> {
    const response = await apiClient.get(`${ROUTES.AUTH}/users`);
    return response.data;
  },

  /**
   * Assign roles to user
   */
  async assignRolesToUser(userId: string, roles: string[]): Promise<any> {
    // Backend expects body: { roles: string[] } where each value is role name (enum)
    const response = await apiClient.post(`${ROUTES.AUTH}/users/${userId}/roles`, { roles });
    return response.data;
  },

  /**
   * Remove role from user
   */
  async removeRoleFromUser(userId: string, roleId: string): Promise<any> {
    const response = await apiClient.delete(`${ROUTES.AUTH}/users/${userId}/roles/${roleId}`);
    return response.data;
  },

  /**
   * Delete user
   */
  async deleteUser(userId: string, soft: boolean = true): Promise<any> {
    const response = await apiClient.delete(`${ROUTES.AUTH}/users/${userId}`, { 
      params: { soft } 
    });
    return response.data;
  },

  /**
   * Get all roles
   */
  async getAllRoles(): Promise<any[]> {
    const response = await apiClient.get(`${ROUTES.AUTH}/roles`);
    return response.data;
  },

  /**
   * Get user permissions
   */
  async getUserPermissions(userId: string, countryCode?: string): Promise<any> {
    const params = countryCode ? { countryCode } : {};
    const response = await apiClient.get(`${ROUTES.AUTH}/users/${userId}/permissions`, { params });
    return response.data;
  },

  /**
   * Check specific permission
   */
  async hasPermission(userId: string, action: string, resource: string, countryCode?: string): Promise<{ hasPermission: boolean }> {
    const params = { action, resource, ...(countryCode && { countryCode }) };
    const response = await apiClient.get(`${ROUTES.AUTH}/users/${userId}/permissions/check`, { params });
    return response.data;
  },

  /**
   * Get user highest role
   */
  async getUserHighestRole(userId: string): Promise<any> {
    const response = await apiClient.get(`${ROUTES.AUTH}/users/${userId}/highest-role`);
    return response.data;
  },

  /**
   * Update current user profile
   */
  async updateUserProfile(payload: {
    firstName?: string;
    lastName?: string;
    countryCode?: string;
    preferredCountries?: string[];
  }): Promise<IUser> {
    const res = await apiClient.patch('v1/auth/me', payload);
    // Backend returns the updated user object
    return res.data as IUser;
  },

  /**
   * Revoke specific session
   */
  async revokeSession(userId: string, sessionId: string): Promise<any> {
    const response = await apiClient.delete(`${ROUTES.AUTH}/sessions/${userId}/${sessionId}`);
    return response.data;
  },

  /**
   * Revoke all sessions except current
   */
  async revokeAllSessions(userId: string, exceptCurrent?: string): Promise<any> {
    const params = exceptCurrent ? { exceptCurrent } : {};
    const response = await apiClient.delete(`${ROUTES.AUTH}/sessions/${userId}/all`, { params });
    return response.data;
  },

  /**
   * Delete specific refresh token (force logout)
   */
  async deleteRefreshToken(tokenId: string): Promise<any> {
    try {
      console.log('🗑️ Deleting refresh token with ID:', tokenId);
      const url = `${ROUTES.AUTH}/tokens/${tokenId}`;
      console.log('🌐 Making DELETE request to URL:', url);
      
      const response = await apiClient.delete(url);
      console.log('✅ Delete response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to delete refresh token:', error);
      const err: any = error;
      console.error('❌ Error details:', err?.response?.data);
      throw error;
    }
  },

  /**
   * Delete all refresh tokens for user (force logout)
   */
  async deleteAllUserRefreshTokens(userId: string): Promise<any> {
    const response = await apiClient.delete(`${ROUTES.AUTH}/tokens/user/${userId}`);
    return response.data;
  },

  /**
   * Force logout user with reason
   */
  async forceLogoutUser(userId: string, reason?: string): Promise<any> {
    const response = await apiClient.post(`${ROUTES.AUTH}/users/${userId}/force-logout`, { reason });
    return response.data;
  },
};