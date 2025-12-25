// src/modules/auth/application/usecases/verifyEmailUseCase.ts
import { authApi } from '../../infrastructure/authApi';

export async function verifyEmailUseCase(token: string): Promise<void> {
  if (!token.trim()) {
    throw new Error('Verification token is missing.');
  }

  await authApi.verifyEmail(token);
}
