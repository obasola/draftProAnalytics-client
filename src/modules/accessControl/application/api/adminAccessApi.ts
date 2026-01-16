import { api } from "@/services/api";

export interface AdminRoleDto {
  rid: number;
  roleName: string;
}

export interface AdminUserDto {
  pid: number;
  userName: string;
  emailAddress: string;
  fullName: string;
  isActive: boolean;
  roles: AdminRoleDto[];
}

export interface ListUsersResponseDto {
  users: AdminUserDto[];
  roles: AdminRoleDto[];
}

export const adminAccessApi = {
  async listUsers(search: string): Promise<ListUsersResponseDto> {
    const res = await api.get<ListUsersResponseDto>("/admin/access/users", {
      params: { search },
    });
    return res.data;
  },

  async updateUserRoles(pid: number, roleIds: number[]): Promise<AdminUserDto> {
    const res = await api.put<AdminUserDto>(`/admin/access/users/${pid}/roles`, { roleIds });
    return res.data;
  },
};
