import type { NextFunction, Request, Response } from "express";

type CanFn = (domain: string, action: string) => boolean;

interface AuthUser {
  pid: number;
  roleIds?: number[];
}

interface AccessLocals {
  can?: CanFn; // if your app populates res.locals.can(...)
}

type AuthedRequest = Request & { user?: AuthUser };

export function requireRbacEditOrAdminRole4(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
): void {
  const locals = res.locals as AccessLocals;

  if (typeof locals.can === "function" && locals.can("RBAC", "EDIT")) {
    next();
    return;
  }

  const roleIds = req.user?.roleIds ?? [];
  if (roleIds.includes(4)) {
    next();
    return;
  }

  res.status(403).json({ message: "Forbidden" });
}
