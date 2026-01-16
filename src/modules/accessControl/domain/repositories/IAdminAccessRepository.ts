import type { AdminRoleDto, AdminUserDto } from "../../application/dtos/AdminAccess.dto";
import { PermissionTuple } from "../access.types";

export interface IAdminAccessRepository {
  searchUsers(search: string): Promise<AdminUserDto[]>;
  listRoles(): Promise<AdminRoleDto[]>;
  setUserRoles(pid: number, roleIds: number[]): Promise<void>;
  getUserByPid(pid: number): Promise<AdminUserDto>;
  getRoleIdByName(roleNameLower: string): Promise<number | null>;
  getRoleIdsForPerson(personId: number): Promise<number[]>;
  getPermissionsForRoleIds(roleIds: number[]): Promise<PermissionTuple[]>;

  grantRoleToPerson(personId: number, roleId: number, grantedByPersonId: number): Promise<void>;
  revokeRoleFromPerson(personId: number, roleId: number): Promise<void>;

  canAssumeRole(fromRoleId: number, toRoleId: number): Promise<boolean>;
}
