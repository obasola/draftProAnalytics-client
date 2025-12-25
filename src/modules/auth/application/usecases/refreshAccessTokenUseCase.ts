// src/modules/auth/application/usecases/refreshAccessTokenUseCase.ts
import type { RefreshRequest, RefreshResponse } from '../../domain/AuthTypes';
import { authApi } from '../../infrastructure/authApi';

export async function refreshAccessTokenUseCase(
  payload: RefreshRequest,
): Promise<RefreshResponse> {
  return authApi.refresh(payload);
}

