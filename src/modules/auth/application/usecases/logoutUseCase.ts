// src/modules/auth/application/usecases/logoutUseCase.ts
import type { LogoutRequest } from '../../domain/AuthTypes';
import { authApi } from '../../infrastructure/authApi';

export async function logoutUseCase(payload: LogoutRequest): Promise<void> {
  await authApi.logout(payload);
}

