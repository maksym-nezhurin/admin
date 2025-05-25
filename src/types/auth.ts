export interface IUser {
  id: string;
  sub: string;
  name: string;
  firstName: string;
  username: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  email_verified?: boolean;
}

export interface AuthResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  token_type: string;
}

export interface IRegisterForm {
  lastName: string;
  firstName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface AuthContextType {
  user: AuthResponse | null;
  userInfo: IUser | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (credentials: IRegisterForm) => Promise<void>;
  isAuthenticated?: boolean;
}

export interface AuthResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  token_type: string;
}

export interface LoginCredentials {
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

export interface RegisterResponse {
  user: IUser;
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  token_type: string;
}

export interface ISession {
  id: string;
  username: string;
  ipAddress: string;
  lastAccess: string;
}