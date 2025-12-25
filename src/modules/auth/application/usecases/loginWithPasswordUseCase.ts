// src/modules/auth/application/usecases/loginWithPasswordUseCase.ts
import type { LoginRequest, LoginResponse } from '../../domain/AuthTypes';
import { authApi } from '../../infrastructure/authApi';

export async function loginWithPasswordUseCase(
  payload: LoginRequest,
): Promise<LoginResponse> {
  return authApi.login(payload);
}

