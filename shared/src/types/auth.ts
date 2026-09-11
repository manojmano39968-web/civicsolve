export type UserRole = 'NEEDER' | 'PROVIDER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  expiresIn: number; // in seconds, typically 900 (15 min)
}

export interface AuthSession {
  user: User;
  tokens: AuthTokens;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: 'NEEDER' | 'PROVIDER';
}
