import { Router } from "express";
import type { RequestHandler } from "express";
import { container } from "tsyringe";

import { AdminAccessController } from "../controllers/AdminAccess.controller";
import { requireAuth } from "../../../auth/presentation/middleware/requireAuth";
import { requireRbacEditOrAdminRole4 } from "../security/requireRbacEditOrAdminRole4";

export function buildAdminAccessRouter(): Router {
  const router = Router();
  const controller = container.resolve(AdminAccessController);

  const guard: RequestHandler[] = [requireAuth, requireRbacEditOrAdminRole4];

  router.get("/users", ...guard, controller.listUsers);
  router.put("/users/:pid/roles", ...guard, controller.updateUserRoles);

  return router;
}
