// draftproanalytics-client/src/modules/accessControl/presentation/routes/adminAccess.routes.ts
import type { RouteRecordRaw } from "vue-router";

import UserAdminView from "@/views/admin/UserAdminView.vue";
import { requireAuth } from "@/modules/auth/authGuard";

export const adminAccessRoutes: RouteRecordRaw[] = [
  {
    path: "/admin/users",
    name: "UserAdmin",
    component: UserAdminView,
    beforeEnter: requireAuth,
    meta: {
      requiresAuth: true,
      perm: { domain: "ADMIN_USERS", action: "VIEW" },
      title: "User Administration",
    },
  },
];
