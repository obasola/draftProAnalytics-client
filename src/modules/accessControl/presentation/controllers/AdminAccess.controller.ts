import type { Request, Response } from "express";
import { z } from "zod";

import { ListAccessUsersUseCase } from "../../application/usecases/ListAccessUsers.usecase";
import { UpdateUserRolesUseCase } from "../../application/usecases/UpdateUserRoles.usecase";

const listUsersQuerySchema = z.object({
  search: z.string().trim().max(100).optional().default(""),
});

const pidParamSchema = z.object({
  pid: z.coerce.number().int().positive(),
});

const updateRolesBodySchema = z.object({
  roleIds: z.array(z.number().int().positive()).max(50),
});

export class AdminAccessController {
  public constructor(
    private readonly listUsersUc: ListAccessUsersUseCase,
    private readonly updateUserRolesUc: UpdateUserRolesUseCase,
  ) {}

  public listUsers = async (req: Request, res: Response): Promise<void> => {
    const { search } = listUsersQuerySchema.parse(req.query);

    const result = await this.listUsersUc.execute({ search });
    res.json(result);
  };

  public updateUserRoles = async (req: Request, res: Response): Promise<void> => {
    const { pid } = pidParamSchema.parse(req.params);
    const { roleIds } = updateRolesBodySchema.parse(req.body);

    const result = await this.updateUserRolesUc.execute({ pid, roleIds });
    res.json(result);
  };
}
