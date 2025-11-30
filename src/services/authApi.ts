import { api } from "./api";
import axios, { AxiosInstance } from 'axios';


export interface LoginRequest {
  userName: string;
  password: string;
}

export interface RegisterRequest {
  userName: string;
  emailAddress: string;
  firstName: string;
  lastName: string;
  password: string;
}
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export const authApi = {
  async login(payload: LoginRequest) {
    const res = await api.post("/auth/login", payload);
    return res.data; // contains { accessToken }
  },

  async register(payload: RegisterRequest) {
    const res = await api.post("/auth/register", payload);
    return res.data; // contains { pid, emailVerificationToken }
  },

  async verifyEmail(token: string) {
    const res = await api.get(`/auth/verify-email/${token}`);
    return res.data;
  },

  async logout(personId: number) {
    await api.post("/auth/logout", { personId });
  },

  async refresh(personId: number) {
    const res = await api.post("/auth/refresh", { personId });
    return res.data; // { accessToken }
  },

  async forgotPassword(email: string) {
    const res = await api.post("/auth/forgot-password", { email });
    return res.data;
  },

  async resetPassword(token: string, newPassword: string) {
    const res = await api.post("/auth/reset-password", { token, newPassword });
    return res.data;
  }
};

