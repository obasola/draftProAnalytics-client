import type { PrismaClient } from "@prisma/client";
import { inject, injectable } from "tsyringe";

import type { IAdminAccessRepository } from "../../../domain/repositories/IAdminAccessRepository";
import type { AdminRoleDto, AdminUserDto } from "../../../application/dtos/AdminAccess.dto";

@injectable()
export class PrismaAdminAccessRepository implements IAdminAccessRepository {
  public constructor(@inject("PrismaClient") private readonly prisma: PrismaClient) {}

  public async listRoles(): Promise<AdminRoleDto[]> {
    // Assumes Prisma model name: Roles, fields: rid, roleName
    const roles = await this.prisma.roles.findMany({
      select: { rid: true, roleName: true },
      orderBy: { roleName: "asc" },
    });

    return roles;
  }

  public async searchUsers(search: string): Promise<AdminUserDto[]> {
    const s = search.trim();
    const where =
      s.length === 0
        ? undefined
        : {
            OR: [
              { userName: { contains: s } },
              { emailAddress: { contains: s } },
              { firstName: { contains: s } },
              { lastName: { contains: s } },
            ],
          };

    const people = await this.prisma.person.findMany({
      where,
      select: {
        pid: true,
        userName: true,
        emailAddress: true,
        firstName: true,
        lastName: true,
        active: true,
        personRole: {
          select: {
            roles: { select: { rid: true, roleName: true } },
          },
        },
      },
      orderBy: { pid: "asc" },
      take: 200,
    });

    return people.map((p) => {
      const roles = p.personRole.map((pr) => pr.roles);
      const fullName = `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim();

      return {
        pid: p.pid,
        userName: p.userName,
        emailAddress: p.emailAddress,
        fullName,
        isActive: Boolean(p.active),
        roles,
      };
    });
  }

  public async getUserByPid(pid: number): Promise<AdminUserDto> {
    const p = await this.prisma.person.findUnique({
      where: { pid },
      select: {
        pid: true,
        userName: true,
        emailAddress: true,
        firstName: true,
        lastName: true,
        active: true,
        personRole: {
          select: {
            roles: { select: { rid: true, roleName: true } },
          },
        },
      },
    });

    if (!p) throw new Error(`Person not found: ${pid}`);

    const roles = p.personRole.map((pr) => pr.roles);
    const fullName = `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim();

    return {
      pid: p.pid,
      userName: p.userName,
      emailAddress: p.emailAddress,
      fullName,
      isActive: Boolean(p.active),
      roles,
    };
  }

  public async setUserRoles(pid: number, roleIds: number[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.personRole.deleteMany({ where: { pid } });

      if (roleIds.length > 0) {
        await tx.personRole.createMany({
          data: roleIds.map((rid) => ({ pid, rid })),
          skipDuplicates: true,
        });
      }
    });
  }
}
