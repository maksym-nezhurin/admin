import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../api/auth';
import type { IUser } from '../types/general';

interface AuthContextType {
  user: AuthResponse | null;
  userInfo: IUser | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

interface AuthResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  token_type: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [userInfo, setUserInfo] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [logged, setLogged] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const verifyAndSetUser = useCallback(async (userResponse: AuthResponse) => {
    try {      
      const { valid, user } = await authService.verifyToken(userResponse.access_token);
      if (valid) {
        setUser(userResponse);      // токени
        setUserInfo(user);          // інформація про користувача
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
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
  }, [logged]);

  const login = useCallback(async (username: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authService.login({ username, password });
      setLogged(response.access_token ? true : false);
    } catch (err) {
      setError('Invalid username or password');
      setLogged(false);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setUserInfo(null);
    setError(null)
  }, []);

  const value = React.useMemo(() => ({
    user,
    userInfo,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user
  }), [user, userInfo, loading, error, login, logout]);

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