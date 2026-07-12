import type {
  AccessMeResponse,
  ActionCode,
  AssignedRole,
  DomainCode,
  PermissionMap,
} from "../../domain/access.types";
import type { IAdminAccessRepository } from "@/modules/accessControl/domain/repositories/IAdminAccessRepository";

export interface GetMyAccessContextInput {
  personId: number;
  userName?: string;
  activeRid?: number | null;
}

type RawPermissionTuple = {
  domain: string;
  action: string;
};

type RawRole = {
  rid: number;
  roleName: string;
};

const VALID_ACTIONS = new Set<string>(["VIEW", "CREATE", "EDIT", "DELETE", "RUN"]);
const VALID_DOMAINS = new Set<string>([
  "DASHBOARD",
  "GAMES",
  "PLAYERS",
  "TEAMS",
  "SCHEDULES",
  "STANDINGS",
  "PLAYOFFS",
  "DRAFT_ORDER",
  "DRAFT_TOOLS",
  "TEAM_NEEDS",
  "JOBS",
  "SCRAPERS",
  "ADMIN_USERS",
  "SCOUTING",
  "PLAYER_MAINT",
]);

export class GetMyAccessContextUseCase {
  public constructor(private readonly repo: IAdminAccessRepository) {}

  public async execute(input: GetMyAccessContextInput): Promise<AccessMeResponse> {
    const assignedRoles = await this.getAssignedRoles(input.personId);

    const activeRid =
      input.activeRid ??
      (assignedRoles.length > 0 ? assignedRoles[0].rid : 1);

    const activeRoleName =
      assignedRoles.find(role => role.rid === activeRid)?.roleName ?? "public";

    const permissionTuples = await this.repo.getPermissionsForRoleIds([activeRid]);
    const permissions = this.toPermissionMap(permissionTuples);

    return {
      personId: input.personId,
      userName: input.userName ?? "",
      activeRid,
      activeRoleName,
      assignedRoles,
      permissions,
    };
  }

  private async getAssignedRoles(personId: number): Promise<AssignedRole[]> {
    /*
      Preferred repository method if you have it:
        repo.getAssignedRolesForPerson(personId)

      Fallback:
        repo.getRoleIdsForPerson(personId)
        repo.getRoleById(rid)

      Since your older repository contract exposes role ids, this fallback keeps the
      use case compatible without returning the old roleIds response shape.
    */
    const repoWithAssignedRoles = this.repo as IAdminAccessRepository & {
      getAssignedRolesForPerson?: (personId: number) => Promise<RawRole[]>;
      getRoleById?: (rid: number) => Promise<RawRole | null>;
    };

    if (typeof repoWithAssignedRoles.getAssignedRolesForPerson === "function") {
      const roles = await repoWithAssignedRoles.getAssignedRolesForPerson(personId);

      return roles.map(role => ({
        rid: role.rid,
        roleName: role.roleName,
      }));
    }

    const roleIds = await this.repo.getRoleIdsForPerson(personId);

    if (typeof repoWithAssignedRoles.getRoleById === "function") {
      const roles = await Promise.all(
        roleIds.map(roleId => repoWithAssignedRoles.getRoleById!(roleId))
      );

      return roles
        .filter((role): role is RawRole => role !== null)
        .map(role => ({
          rid: role.rid,
          roleName: role.roleName,
        }));
    }

    /*
      Last-resort fallback. This prevents compile failure but should be replaced
      by a real repository method that returns role names.
    */
    return roleIds.map(roleId => ({
      rid: roleId,
      roleName: this.defaultRoleName(roleId),
    }));
  }

  private toPermissionMap(permissionTuples: RawPermissionTuple[]): PermissionMap {
    const map = {} as PermissionMap;

    for (const permission of permissionTuples) {
      if (!this.isDomainCode(permission.domain)) continue;
      if (!this.isActionCode(permission.action)) continue;

      const existingActions = map[permission.domain] ?? [];

      if (!existingActions.includes(permission.action)) {
        map[permission.domain] = [...existingActions, permission.action];
      }
    }

    return map;
  }

  private isDomainCode(value: string): value is DomainCode {
    return VALID_DOMAINS.has(value);
  }

  private isActionCode(value: string): value is ActionCode {
    return VALID_ACTIONS.has(value);
  }

  private defaultRoleName(rid: number): string {
    switch (rid) {
      case 1:
        return "public";
      case 2:
        return "dev";
      case 3:
        return "qa";
      case 4:
        return "admin";
      default:
        return `role-${rid}`;
    }
  }
}