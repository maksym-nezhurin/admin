import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth';
import { setRefreshTokenHandler } from '../api/apiClient';
import type { IUser, IRegisterForm, AuthContextType, AuthResponse } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [userInfo, setUserInfo] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [roleLevel, setRoleLevel] = useState<{ level: number; name: string } | null>(null);

  const verifyAndSetUser = useCallback(async (userResponse: AuthResponse) => {
    try {      
      const tokenVerification = await authService.verifyToken(userResponse.access_token);
      if (tokenVerification.valid && tokenVerification.user) {
        setUser(userResponse);
        console.log('tokenVerification', tokenVerification);
        setUserInfo(tokenVerification.user);
        const higherRole = tokenVerification.user?.roles?.reduce((prev, current) => {
          return prev.level > current.role.level ? prev : current.role;
        }, { level: 10, name: '' } as { level: number; name: string }) || { level: 10, name: '' };
        setRoleLevel(higherRole);
        return true;
      }
      // Reset roleLevel when invalid
      setRoleLevel(null);
      return false;
    } catch (error) {
      console.error('Token verification failed:', error);
      setRoleLevel(null);
      return false;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        const userResponse = authService.getCurrentUser();
        if (userResponse?.access_token) {          
          const isValid = await verifyAndSetUser(userResponse);
          if (!isValid) {
            authService.logout();
            setUser(null);
            setUserInfo(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [verifyAndSetUser]);

  const login = useCallback(async (username: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authService.login({ username, password });
      
      // Set user state immediately after successful login
      await verifyAndSetUser(response);
    } catch (err) {
      setError('Invalid username or password');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [verifyAndSetUser]);

  const register = useCallback(async (credentials: IRegisterForm) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authService.register(credentials);
      console.log('reg response', response);
      // setLogged(response.access_token ? true : false);
    } catch (err) {
      setError('Invalid username or password');
      // setLogged(false);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setUserInfo(null);
    setRoleLevel(null);
    setError(null)
  }, []);

  const fetchRoles = useCallback(async () => {
    // Не тягнемо ролі, якщо користувач не автентифікований
    if (!user?.access_token) {
      setRoles([]);
      return;
    }

    try {
      const allRoles = await authService.getAllRoles();
      setRoles(allRoles);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  }, [user?.access_token]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const refreshToken = useCallback(async () => {
    if (!user?.refresh_token) throw new Error('No refresh token');
    try {
      setLoading(true);
      const newTokens = await authService.refreshTokenApi(user.refresh_token);
      const updatedUser = { ...user, ...newTokens };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('tokenTimestamp', Date.now().toString());
      await verifyAndSetUser(updatedUser);
      return updatedUser;
    } catch (error) {
      logout();
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, logout, verifyAndSetUser]);

  // Proactive token refresh before expiration
  useEffect(() => {
    if (!user?.access_token || !user?.expires_in) return;

    const checkTokenExpiration = () => {
      const tokenTimestamp = localStorage.getItem('tokenTimestamp');
      if (!tokenTimestamp) return;

      const issuedAt = parseInt(tokenTimestamp);
      const expiresAt = issuedAt + (user.expires_in * 1000);
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;
      
      // Refresh 5 minutes before expiration
      const refreshThreshold = 5 * 60 * 1000; // 5 minutes
      
      if (timeUntilExpiry <= refreshThreshold && timeUntilExpiry > 0) {
        console.log('Token expiring soon, proactively refreshing...');
        refreshToken().catch(error => {
          console.error('Proactive refresh failed:', error);
        });
      }
    };

    const interval = setInterval(checkTokenExpiration, 180000); // Check every 3 minutes
    return () => clearInterval(interval);
  }, [user, refreshToken]);

  useEffect(() => {
    setRefreshTokenHandler(refreshToken);
  }, [refreshToken]);

  const value = React.useMemo(() => ({
    user,
    userInfo,
    loading,
    error,
    login,
    register,
    logout,
    roleLevel,
    roles,
    isAuthenticated: !!user,
    refreshToken,
    setUserInfo,
  }), [user, userInfo, loading, error, roleLevel, roles, login, logout, register, refreshToken]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};