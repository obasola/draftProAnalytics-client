// src/services/authApi.ts
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

const http: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
  withCredentials: false, // set to true if you move to HTTP-only cookies later
});

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
}

export interface RegisterRequest {
  userName: string;
  emailAddress: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ForgotPasswordRequest {
  emailAddress: string;
}

export const authApi = {
  async login(payload: LoginRequest): Promise<AuthResponse> {
    const { data } = await http.post<AuthResponse>('/login', payload);
    return data;
  },

  async refresh(personId: number): Promise<AuthResponse> {
    const { data } = await http.post<AuthResponse>('/refresh', { personId });
    return data;
  },

  async logout(personId: number): Promise<void> {
    await http.post('/logout', { personId });
  },

  async register(payload: RegisterRequest): Promise<void> {
    await http.post('/register', payload);
  },

  async forgotPassword(payload: ForgotPasswordRequest): Promise<void> {
    await http.post('/forgot-password', payload);
  },
};
