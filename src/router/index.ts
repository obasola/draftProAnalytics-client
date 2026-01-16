// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { useAuthStore } from "@/modules/auth/application/authStore";

// guards
import { requireAuth } from "@/modules/auth/authGuard";

// router shell layout
import MainLayout from "@/layouts/MainLayout.vue";

// legacy/core views
import Home from "@/views/Home.vue";
import DashboardView from "@/views/DashboardView.vue";
import PlayerDetail from "@/views/PlayerDetail.vue";
import TeamDetail from "@/views/TeamDetail.vue";
import PlayerAwardDetail from "@/views/PlayerAwardDetail.vue";
import PlayerTeamDetail from "@/views/PlayerTeamDetail.vue";
import CombineScoreDetail from "@/views/CombineScoreDetail.vue";
import ProspectDetail from "@/views/ProspectDetail.vue";
import GameDetail from "@/views/GameDetail.vue";
import DraftBoard from "@/views/DraftboardView.vue";
import ScheduleDetail from "@/views/GameScheduleView.vue";
import ForbiddenView from "@/views/ForbiddenView.vue";

// auth module views
import LoginView from "@/modules/auth/presentation/views/LoginView.vue";
import RegisterView from "@/modules/auth/presentation/views/RegisterView.vue";
import VerifyEmailView from "@/modules/auth/presentation/views/VerifyEmailView.vue";

// other views
import UserAdminView from "@/views/admin/UserAdminView.vue";
import { draftOrderRoutes } from "@/modules/draftOrder/presentation/router/draftOrderRoutes";

import { can } from "@/modules/accessControl/application/can";
import type { ActionCode, DomainCode } from "@/modules/accessControl/domain/access.types";

// route bundles
import { draftPickRoutes } from "./draftPickRoutes";
import { playoffsRoutes } from "../modules/playoffs/presentation/routes/playoffsRoute";
import { teamNeedsRoutes } from "@/modules/teams/presentation/router/teamNeedsRoutes";
import { adminAccessRoutes } from "@/modules/accessControl/presentation/routes/adminAccess.routes";

type RoutePermission = { domain: DomainCode; action: ActionCode };

declare module "vue-router" {
  interface RouteMeta {
    public?: boolean;
    onlyWhenLoggedOut?: boolean;
    requiresAuth?: boolean;
    perm?: RoutePermission;
    title?: string;
    icon?: string;
  }
}

/**
 * Spread route bundles (teamNeedsRoutes, playoffsRoutes, draftPickRoutes) may not have meta.perm.
 * This ensures users can't deep-link to hidden/maintenance pages.
 */
function inferPermFromPath(path: string): RoutePermission | null {
  if (path === "/dashboard") return { domain: "DASHBOARD", action: "VIEW" };

  if (path.startsWith("/games")) return { domain: "GAMES", action: "VIEW" };
  if (path.startsWith("/players")) return { domain: "PLAYERS", action: "VIEW" };
  if (path.startsWith("/teams")) return { domain: "TEAMS", action: "VIEW" };

  if (path.startsWith("/schedules") || path.startsWith("/show-upcoming-games")) {
    return { domain: "SCHEDULES", action: "VIEW" };
  }

  if (path.startsWith("/standings")) return { domain: "STANDINGS", action: "VIEW" };
  if (path.startsWith("/playoffs")) return { domain: "PLAYOFFS", action: "VIEW" };

  if (path.startsWith("/draft-order")) return { domain: "DRAFT_ORDER", action: "VIEW" };

  // Everything else draft-related (draft picks, simulator, board)
  if (path.startsWith("/draft")) return { domain: "DRAFT_TOOLS", action: "VIEW" };

  if (path.startsWith("/team-needs")) return { domain: "TEAM_NEEDS", action: "VIEW" };
  if (path.startsWith("/jobs")) return { domain: "JOBS", action: "VIEW" };

  if (path.startsWith("/admin/draft-pick-scraper")) return { domain: "SCRAPERS", action: "VIEW" };
  if (path.startsWith("/admin/users")) return { domain: "ADMIN_USERS", action: "VIEW" };

  if (path.startsWith("/prospects") || path.startsWith("/combine-scores")) {
    return { domain: "SCOUTING", action: "VIEW" };
  }

  if (path.startsWith("/player-awards") || path.startsWith("/player-teams")) {
    return { domain: "PLAYER_MAINT", action: "VIEW" };
  }

  // NOTE: do NOT infer permissions for /forbidden (avoid loops)
  if (path.startsWith("/forbidden")) return null;

  if (path.startsWith("/admin")) return { domain: "ADMIN_USERS", action: "VIEW" }; // conservative
  return null;
}

const routes: RouteRecordRaw[] = [
  // ─────────────────────────
  // PUBLIC / AUTH (standalone)
  // ─────────────────────────
  {
    path: "/login",
    name: "Login",
    component: LoginView,
    meta: { public: true, onlyWhenLoggedOut: true },
  },
  {
    path: "/register",
    name: "Register",
    component: RegisterView,
    meta: { public: true, onlyWhenLoggedOut: true },
  },
  {
    path: "/verify-email/:token",
    name: "VerifyEmail",
    component: VerifyEmailView,
    meta: { public: true },
  },

  // ─────────────────────────
  // APP (shell layout w/ left nav)
  // ─────────────────────────
  {
    path: "/",
    component: MainLayout,
    children: [
      { path: "", redirect: "/dashboard" },

      // stable target for denies (never loops)
      {
        path: "forbidden",
        name: "Forbidden",
        component: ForbiddenView,
        beforeEnter: requireAuth,
        meta: { requiresAuth: true, title: "Forbidden" },
      },

      {
        path: "dashboard",
        name: "Dashboard",
        component: DashboardView,
        meta: { requiresAuth: true, perm: { domain: "DASHBOARD", action: "VIEW" } },
      },

      // Draft Simulator
      {
        path: "draft-simulator",
        name: "DraftLobby",
        component: () => import("@/modules/draftSimulator/presentation/views/DraftLobbyViewPrev.vue"),
        beforeEnter: requireAuth,
        meta: { requiresAuth: true, perm: { domain: "DRAFT_TOOLS", action: "VIEW" } },
      },
      {
        path: "draft-simulator/:id",
        name: "DraftRoom",
        component: () => import("@/modules/draftSimulator/presentation/views/DraftRoomView.vue"),
        beforeEnter: requireAuth,
        meta: { requiresAuth: true, perm: { domain: "DRAFT_TOOLS", action: "VIEW" } },
      },

      {
        path: "home",
        name: "Home",
        component: Home,
        beforeEnter: requireAuth,
        meta: { requiresAuth: true, perm: { domain: "DASHBOARD", action: "VIEW" } },
      },

      // Players
      {
        path: "players",
        name: "Players",
        component: PlayerDetail,
        beforeEnter: requireAuth,
        meta: { requiresAuth: true },
      },
      {
        path: "players/:id",
        name: "PlayerEdit",
        component: PlayerDetail,
        beforeEnter: requireAuth,
        meta: { requiresAuth: true, perm: { domain: "PLAYERS", action: "EDIT" } },
      },

      // Teams
      {
        path: "teams",
        name: "Teams",
        component: TeamDetail,
        beforeEnter: requireAuth,
        meta: { requiresAuth: true },
      },
      {
        path: "teams/:id",
        name: "TeamEdit",
        component: TeamDetail,
        beforeEnter: requireAuth,
        meta: { requiresAuth: true, perm: { domain: "TEAMS", action: "EDIT" } },
      },

      {
        path: "standings",
        name: "StandingsView",
        component: () => import("@/views/StandingsView.vue"),
        beforeEnter: requireAuth,
        meta: { requiresAuth: true, perm: { domain: "STANDINGS", action: "VIEW" }, title: "Standings" },
      },
      {
        path: "schedules",
        name: "schedules",
        component: ScheduleDetail,
        beforeEnter: requireAuth,
        meta: { requiresAuth: true, perm: { domain: "SCHEDULES", action: "VIEW" }, title: "NFL Schedule" },
      },
      {
        path: "show-upcoming-games",
        name: "show-upcoming-games",
        component: () => import("@/views/ShowUpcomingGamesView.vue"),
        beforeEnter: requireAuth,
        meta: { requiresAuth: true, perm: { domain: "SCHEDULES", action: "VIEW" } },
      },
      {
        path: "games/:id?",
        name: "GameDetail",
        component: GameDetail,
        beforeEnter: requireAuth,
        meta: { requiresAuth: true, perm: { domain: "GAMES", action: "VIEW" }, title: "Games" },
      },

      // Power users
      {
        path: "player-awards/:id?",
        name: "PlayerAwardDetail",
        component: PlayerAwardDetail,
        beforeEnter: requireAuth,
        meta: { requiresAuth: true, perm: { domain: "PLAYER_MAINT", action: "VIEW" } },
      },
      {
        path: "player-teams/:id?",
        name: "PlayerTeamDetail",
        component: PlayerTeamDetail,
        beforeEnter: requireAuth,
        meta: { requiresAuth: true, perm: { domain: "PLAYER_MAINT", action: "VIEW" } },
      },
      {
        path: "combine-scores/:id?",
        name: "CombineScoreDetail",
        component: CombineScoreDetail,
        beforeEnter: requireAuth,
        meta: { requiresAuth: true, perm: { domain: "SCOUTING", action: "VIEW" } },
      },
      {
        path: "prospects/:id?",
        name: "ProspectDetail",
        component: ProspectDetail,
        beforeEnter: requireAuth,
        meta: { requiresAuth: true, perm: { domain: "SCOUTING", action: "VIEW" } },
      },

      {
        path: "draft-board",
        name: "DraftBoard",
        component: DraftBoard,
        beforeEnter: requireAuth,
        meta: { requiresAuth: true, perm: { domain: "DRAFT_TOOLS", action: "VIEW" } },
      },

      // Bundled routes (guard will infer if meta.perm absent)
      ...teamNeedsRoutes,
      ...draftPickRoutes,
      ...draftOrderRoutes,
      ...playoffsRoutes,
      // inside children: [...]
      ...adminAccessRoutes,
      // Draft order explicit routes
      {
        path: "draft-order",
        name: "DraftOrderSnapshots",
        component: () => import("@/modules/draftOrder/presentation/views/DraftOrderSnapshotsView.vue"),
        beforeEnter: requireAuth,
        meta: { requiresAuth: true, perm: { domain: "DRAFT_ORDER", action: "VIEW" }, title: "Draft Order" },
      },
      {
        path: "draft-order/snapshots/:id",
        name: "DraftOrderSnapshotDetail",
        component: () => import("@/modules/draftOrder/presentation/views/DraftOrderSnapshotDetailView.vue"),
        beforeEnter: requireAuth,
        meta: { requiresAuth: true, perm: { domain: "DRAFT_ORDER", action: "VIEW" }, title: "Draft Order Snapshot" },
      },

      // Admin
      {
        path: "admin/import-draft",
        name: "DraftImport",
        component: () => import("@/views/DraftImportView.vue"),
        beforeEnter: requireAuth,
        meta: { requiresAuth: true, perm: { domain: "DRAFT_TOOLS", action: "VIEW" }, title: "Import Draft Picks" },
      },
      {
        path: "admin/draft-pick-scraper",
        name: "DraftPickScraper",
        component: () => import("@/views/admin/DraftPickScraperView.vue"),
        beforeEnter: requireAuth,
        meta: { requiresAuth: true, perm: { domain: "SCRAPERS", action: "VIEW" }, title: "Draft Pick Scraper", icon: "pi-cloud-download" },
      },

      {
        path: "jobs",
        name: "Jobs",
        component: () => import("@/views/jobs/JobsView.vue"),
        beforeEnter: requireAuth,
        meta: { requiresAuth: true, perm: { domain: "JOBS", action: "VIEW" }, title: "Jobs" },
      },
      {
        path: "jobs/:id",
        name: "JobDetail",
        component: () => import("@/views/jobs/JobDetailView.vue"),
        beforeEnter: requireAuth,
        meta: { requiresAuth: true, perm: { domain: "JOBS", action: "VIEW" }, title: "Job Detail" },
      },

      {
        path: "admin/users",
        name: "UserAdmin",
        component: UserAdminView,
        beforeEnter: requireAuth,
        meta: { requiresAuth: true, perm: { domain: "ADMIN_USERS", action: "VIEW" } },
      },
    ],
  },

  // fallback
  { path: "/:pathMatch(.*)*", redirect: "/dashboard" },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// ─────────────────────────
// Global Nav Guard (RBAC)
// ─────────────────────────
router.beforeEach(async (to) => {
  const auth = useAuthStore();

  const requiresAuth = Boolean(to.meta.requiresAuth);
  const onlyWhenLoggedOut = Boolean(to.meta.onlyWhenLoggedOut);

  // Requires auth -> go login (but don't loop)
  if (requiresAuth && !auth.isAuthenticated) {
    if (to.name === "Login") return true;
    return { name: "Login", query: { redirect: to.fullPath } };
  }

  // Logged in -> block login/register routes (loop safe)
  if (auth.isAuthenticated && onlyWhenLoggedOut) {
    const redirect = (to.query.redirect as string | undefined) ?? "/dashboard";
    if (redirect === to.fullPath) return true;
    return redirect;
  }

  // If logged in, ensure /access/me has loaded at least once
  if (auth.isAuthenticated) {
    await auth.ensureAccessContext();
  }

  // Permission checks (deny -> /forbidden, NEVER /dashboard)
  if (requiresAuth) {
    const perm: RoutePermission | null = to.meta.perm ?? inferPermFromPath(to.path);
    if (perm && !can(perm.domain, perm.action)) {
      if (to.path === "/forbidden") return true;
      return { path: "/forbidden", query: { from: to.fullPath } };
    }
  }

  return true;
});

export default router;
