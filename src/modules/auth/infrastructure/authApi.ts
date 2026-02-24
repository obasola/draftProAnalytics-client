// src/modules/auth/infrastructure/authApi.ts
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  RefreshRequest,
  RefreshResponse,
  LogoutRequest,
} from '../domain/AuthTypes';
import { api } from '@/services/api'; // your shared axios instance

export const authApi = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const res = await api.post<LoginResponse>('/auth/login', payload);
    return res.data;
  },

  async loginWithGoogle(credential: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/auth/google', { credential });
    return data;
  },

  async loginWithApple(credential: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/auth/apple', { credential });
    return data;
  },

  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    const res = await api.post<RegisterResponse>('/auth/register', payload);
    return res.data;
  },

  async verifyEmail(token: string): Promise<void> {
    await api.get(`/auth/verify-email/${token}`);
  },

  async refresh(payload: RefreshRequest): Promise<RefreshResponse> {
    const res = await api.post<RefreshResponse>('/auth/refresh', {
      personId: payload.personId,
    });
    return res.data;
  },

  async logout(payload: LogoutRequest): Promise<void> {
    await api.post('/auth/logout', { personId: payload.personId });
  },

  async forgotPassword(payload: ForgotPasswordRequest): Promise<void> {
    await api.post('/auth/forgot-password', { email: payload.emailAddress });
  },

  async resetPassword(payload: ResetPasswordRequest): Promise<void> {
    await api.post('/auth/reset-password', {
      token: payload.token,
      newPassword: payload.newPassword,
    });
  },
};
