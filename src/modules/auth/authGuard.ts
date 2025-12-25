//src/router/authGuard.ts
import { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import { useAuthStore } from "./application/authStore";

export function requireAuth(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const auth = useAuthStore();

  if (!auth.isAuthenticated) {
    next("/login");
  } else {
    next();
  }
}
