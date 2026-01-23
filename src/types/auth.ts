export interface IRoleLevel {
  level: number;
  description: string;
  id: string;
  name: string;
}

export interface IUser {
  sub?: string;
  id: string;
  firstName: string;
  username: string;
  lastName: string;
  email: string;
  phone?: string;  
  emailVerified?: boolean;
  isActive: boolean,
  isCompanyRepresentative: boolean,
  company: string,
  roles?: Array<{ role: IRoleLevel }>;
  nativeCountry?: string;
  preferredCountries?: string[];
  countryCode?: string;
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
  roleLevel: { level: number; name: string } | null;
  roles: IRoleLevel[];
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (credentials: IRegisterForm) => Promise<void>;
  refreshToken?: () => Promise<AuthResponse | null>;
  isAuthenticated?: boolean;
  setUserInfo: (user: IUser | null) => void;
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
  email: string;
  ipAddress: string;
  lastAccess: string;
  expiresAt: string;
  createdAt: string;
  isCurrent: boolean;
}