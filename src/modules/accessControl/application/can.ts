// src/modules/accessControl/application/can.ts
import { computed } from "vue";
import { useAuthStore } from "@/modules/auth/application/authStore";
import type { ActionCode, DomainCode, PermissionMap } from "../domain/access.types";

const VISITOR_VIEW_ALLOW: readonly DomainCode[] = [
  "DASHBOARD",
  "GAMES",
  "PLAYERS",
  "TEAMS",
  "SCHEDULES",
  "STANDINGS",
  "PLAYOFFS",
  "DRAFT_ORDER",
];

function isPermissionMapReady(x: unknown): x is PermissionMap {
  if (typeof x !== "object" || x === null) return false;
  const obj = x as Record<string, unknown>;
  const values = Object.values(obj);
  if (values.length === 0) return false;
  return values.some((v) => Array.isArray(v) && v.every((a) => typeof a === "string"));
}

export function can(domain: DomainCode, action: ActionCode): boolean {
  const auth = useAuthStore();

  if (!auth.isAuthenticated) return false;

  if (isPermissionMapReady(auth.permissions)) {
    const actions = auth.permissions[domain];
    return Array.isArray(actions) ? actions.includes(action) : false;
  }

  // fallback until /access/me loads (keeps UX stable)
  const rid = auth.activeRid ?? auth.role ?? 1;
  const isPowerUser = rid === 2 || rid === 3 || rid === 4;

  if (isPowerUser) return true;

  return action === "VIEW" && VISITOR_VIEW_ALLOW.includes(domain);
}

export function useCan() {
  // handy for templates (reactive auth store)
  return computed(() => can);
}
