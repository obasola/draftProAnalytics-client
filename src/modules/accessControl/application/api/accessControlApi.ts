import { api } from "@/services/api";
import type { AccessMeResponse } from "../../domain/access.types";

export interface AssumeRoleResponse extends AccessMeResponse {
  accessToken: string;
  accessExpiresInSec?: number;
}

export async function getMyAccessContext(accessToken: string): Promise<AccessMeResponse> {
  const res = await api.get<AccessMeResponse>("/access/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return res.data;
}

export async function assumeRole(
  accessToken: string,
  toRid: number,
): Promise<AssumeRoleResponse> {
  const res = await api.post<AssumeRoleResponse>(
    "/access/assume-role",
    { toRid },
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  return res.data;
}