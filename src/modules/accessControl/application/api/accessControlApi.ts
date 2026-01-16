import axios from "axios";
import type { AccessMeResponse } from "../../../../../../draftProAnalytics-server/src/modules/accessControl/domain/access.types";

function apiBaseUrl(): string {
  return (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";
}

export async function getMyAccessContext(accessToken: string): Promise<AccessMeResponse> {
  const res = await axios.get<AccessMeResponse>(`${apiBaseUrl()}/access/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    withCredentials: true,
  });
  return res.data;
}

export async function assumeRole(accessToken: string, toRid: number): Promise<AccessMeResponse> {
  const res = await axios.post<AccessMeResponse>(
    `${apiBaseUrl()}/access/assume-role`,
    { toRid },
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true,
    }
  );
  return res.data;
}
