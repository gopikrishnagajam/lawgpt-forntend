import api from '../lib/axios';
import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  SessionContext,
  User,
} from '../types/api.types';

export const authService = {
  // Login
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  // Signup
  signup: async (data: SignupRequest): Promise<SignupResponse> => {
    const response = await api.post<SignupResponse>('/auth/signup', data);
    return response.data;
  },

  // Refresh token
  refreshToken: async (data: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    const response = await api.post<RefreshTokenResponse>('/auth/refresh', data);
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  // Get session status
  getSession: async (): Promise<SessionContext> => {
    const response = await api.get<SessionContext>('/auth/session');
    return response.data;
  },

  // Get user profile
  getMe: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  // Revoke refresh token
  revokeToken: async (refreshToken: string): Promise<void> => {
    await api.post('/auth/token/revoke', { refreshToken });
  },
};
