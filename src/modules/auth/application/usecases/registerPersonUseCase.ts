// src/modules/auth/application/usecases/registerPersonUseCase.ts
import type { RegisterRequest, RegisterResponse } from '../../domain/AuthTypes';
import { authApi } from '../../infrastructure/authApi';

export async function registerPersonUseCase(
  payload: RegisterRequest,
): Promise<RegisterResponse> {
  return authApi.register(payload);
}

