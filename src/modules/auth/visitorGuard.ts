import { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import { useAuthStore } from "./application/authStore";

export function requireAdminOrDev(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const auth = useAuthStore();

  if (auth.role === 2 || auth.role === 3) {
    next();
  } else {
    next("/dashboard"); // visitors redirected
  }
}
