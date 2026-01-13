import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '@/modules/auth/application/authStore';

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function isPrivilegedRid(rid: number): boolean {
  // public=1, dev=2, qa=3, admin=4
  return rid === 2 || rid === 3 || rid === 4;
}

/**
 * Allows:
 * - /players and /teams (list) for any authenticated user (including Visitor)
 * Blocks:
 * - /players/:id, /teams/:id (edit/detail) unless Dev/QA/Admin
 */
export function requireAdminOrDev(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
): void {
  const auth = useAuthStore();

  if (!auth.isAuthenticated) {
    next('/login');
    return;
  }

  const rid = auth.activeRid ?? auth.role ?? 1;

  const idParam = to.params.id;
  const hasId =
    isNonEmptyString(idParam) ||
    (Array.isArray(idParam) && idParam.some(isNonEmptyString));

  // list view => always allowed (authenticated)
  if (!hasId) {
    next();
    return;
  }

  // edit/detail view => privileged only
  if (isPrivilegedRid(rid)) {
    next();
    return;
  }

  next('/dashboard');
}
