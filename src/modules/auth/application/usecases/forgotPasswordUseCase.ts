// src/modules/auth/application/usecases/forgotPasswordUseCase.ts
import type { ForgotPasswordRequest } from '../../domain/AuthTypes';
import { authApi } from '../../infrastructure/authApi';

export async function forgotPasswordUseCase(
  payload: ForgotPasswordRequest,
): Promise<void> {
  await authApi.forgotPassword(payload);
}

