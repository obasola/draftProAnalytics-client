// src/modules/auth/domain/AuthTypes.ts
export interface LoginRequest {
  userName: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  personId?: number;
  userName?: string;
}

export interface RegisterRequest {
  userName: string;
  emailAddress: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface RegisterResponse {
  pid: number;
  emailVerificationToken: string;
}

export interface ForgotPasswordRequest {
  emailAddress: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface RefreshRequest {
  personId: number;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface LogoutRequest {
  personId: number;
}

export interface JwtPayload {
  sub: number;
  userName: string;
  exp: number;
  iat: number;
}
