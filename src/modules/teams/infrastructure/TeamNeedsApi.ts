import axios, { AxiosInstance } from "axios";
import { TeamNeedDto, TeamNeedsPageDto } from "../domain/dtos/TeamNeedDtos";

export interface UpsertTeamNeedRequest {
  position: string;
  priority: number;
  draftYear: number | null;
}

export class TeamNeedsApi {
  public constructor(private readonly http: AxiosInstance) {}

  public async getNeedsPage(teamId: number, evaluationYear?: number, draftYear?: number | null): Promise<TeamNeedsPageDto> {
    const params: Record<string, string> = {};
    if (typeof evaluationYear === "number") params.evaluationYear = String(evaluationYear);
    if (typeof draftYear === "number") params.draftYear = String(draftYear);

    const resp = await this.http.get<TeamNeedsPageDto>(`/api/teams/${teamId}/needs-page`, { params });
    return resp.data;
  }

  public async upsertTeamNeed(teamId: number, req: UpsertTeamNeedRequest): Promise<TeamNeedDto> {
    const resp = await this.http.put<TeamNeedDto>(`/api/teams/${teamId}/team-needs`, req);
    return resp.data;
  }

  public async deleteTeamNeed(teamId: number, position: string): Promise<void> {
    await this.http.delete(`/api/teams/${teamId}/team-needs/${encodeURIComponent(position)}`);
  }
}

// Typical usage: new TeamNeedsApi(axios.create({ baseURL: import.meta.env.VITE_API_URL }))
export function buildTeamNeedsApi(): TeamNeedsApi {
  return new TeamNeedsApi(axios);
}

