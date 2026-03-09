// src/modules/auth/application/usecases/loginWithAppleUseCase.ts
import type { LoginResponse } from '../../domain/AuthTypes';
import { authApi } from '../../infrastructure/authApi';

export async function loginWithAppleUseCase(credential: string): Promise<LoginResponse> {
  return authApi.loginWithApple(credential);
}
