
import type { AccessContext } from "../../domain/access.types";
import type { IAdminAccessRepository } from "@/modules/accessControl/domain/repositories/IAdminAccessRepository";

export interface GetMyAccessContextInput {
  personId: number;
  activeRoleId?: number | null;
}

export class GetMyAccessContextUseCase {
  public constructor(private readonly repo: IAdminAccessRepository) {}

  public async execute(input: GetMyAccessContextInput): Promise<AccessContext> {
    const roleIds = await this.repo.getRoleIdsForPerson(input.personId);

    // If your token/session already supplies activeRoleId, honor it.
    // Otherwise default to first assigned role (or null).
    const activeRoleId = input.activeRoleId ?? (roleIds.length > 0 ? roleIds[0] : null);

    const permissions = await this.repo.getPermissionsForRoleIds(roleIds);

    return {
      personId: input.personId,
      roleIds,
      activeRoleId,
      permissions,
    };
  }
}
