// src/modules/auth/application/usecases/resetPasswordUseCase.ts
import type { ResetPasswordRequest } from '../../domain/AuthTypes';
import { authApi } from '../../infrastructure/authApi';

export async function resetPasswordUseCase(
  payload: ResetPasswordRequest,
): Promise<void> {
  await authApi.resetPassword(payload);
}
