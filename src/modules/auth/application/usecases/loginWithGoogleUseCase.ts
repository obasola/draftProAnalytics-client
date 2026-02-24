// src/modules/auth/application/usecases/loginWithGoogleUseCase.ts
import type { LoginResponse } from '../../domain/AuthTypes';
import { authApi } from '../../infrastructure/authApi';

export async function loginWithGoogleUseCase(credential: string): Promise<LoginResponse> {
  return authApi.loginWithGoogle(credential);
}
