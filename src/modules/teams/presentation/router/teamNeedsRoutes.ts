import type { RouteRecordRaw } from "vue-router";
import { requireAdminOrDev } from "@/modules/auth/visitorGuard";

// Lazy load to keep bundle lean
const TeamNeedsView = () => import("@/modules/teams/presentation/views/TeamNeedsView.vue");

export const teamNeedsRoutes: RouteRecordRaw[] = [
  {
    path: "teams/:teamId/needs",
    name: "TeamNeeds",
    component: TeamNeedsView,
    beforeEnter: requireAdminOrDev,
    meta: {
      title: "Team Needs",
      requiresAuth: true
    }
  }
];
