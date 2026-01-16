// src/modules/accessControl/domain/access.types.ts

export type ActionCode = "VIEW" | "EDIT" | "CREATE" | "DELETE" | "RUN";

export type DomainCode =
  | "DASHBOARD"
  | "GAMES"
  | "PLAYERS"
  | "TEAMS"
  | "SCHEDULES"
  | "STANDINGS"
  | "PLAYOFFS"
  | "DRAFT_ORDER"
  | "DRAFT_TOOLS"
  | "TEAM_NEEDS"
  | "JOBS"
  | "SCRAPERS"
  | "SCOUTING"
  | "PLAYER_MAINT"
  | "ADMIN_USERS"
  | "RBAC";

export type AssignedRole = { rid: number; roleName: string };

/**
 * Server returns: Record<domain, actions[]>
 * Keep key type flexible (string) because new domains can be registered over time.
 */
export type PermissionMap = Record<string, readonly ActionCode[]>;

export type AccessMeResponse = {
  personId: number;
  userName: string;

  activeRid: number;
  activeRoleName: string;

  assignedRoles: AssignedRole[];
  permissions: PermissionMap;
};

/**
 * Back-compat exports (in case older code imports these)
 */
export type PermissionTuple = { domain: string; action: string };
export type AccessContext = AccessMeResponse;
