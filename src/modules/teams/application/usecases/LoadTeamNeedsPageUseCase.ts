import { TeamNeedsApi } from "../../infrastructure/TeamNeedsApi";
import { TeamNeedsPageDto } from "../../domain/dtos/TeamNeedDtos";

export class LoadTeamNeedsPageUseCase {
  public constructor(private readonly api: TeamNeedsApi) {}

  public async execute(teamId: number, evaluationYear?: number, draftYear?: number | null): Promise<TeamNeedsPageDto> {
    return this.api.getNeedsPage(teamId, evaluationYear, draftYear);
  }
}

