import { TeamNeedsApi } from "../../infrastructure/TeamNeedsApi";

export class DeleteTeamNeedUseCase {
  public constructor(private readonly api: TeamNeedsApi) {}

  public async execute(teamId: number, position: string): Promise<void> {
    await this.api.deleteTeamNeed(teamId, position);
  }
}

