// draftproanalytics-client/src/router/authGuard.ts
import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import { useAuthStore } from "@/modules/auth/application/authStore";

export function requireAuth(
  _to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
): void {
  const auth = useAuthStore();

  if (!auth.isAuthenticated) {
    next("/login");
    return;
  }

  next();
}
