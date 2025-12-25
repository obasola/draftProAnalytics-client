import { TeamNeedsApi, UpsertTeamNeedRequest } from "../../infrastructure/TeamNeedsApi";
import { TeamNeedDto } from "../../domain/dtos/TeamNeedDtos";

export class UpsertTeamNeedUseCase {
  public constructor(private readonly api: TeamNeedsApi) {}

  public async execute(teamId: number, req: UpsertTeamNeedRequest): Promise<TeamNeedDto> {
    return this.api.upsertTeamNeed(teamId, req);
  }
}

