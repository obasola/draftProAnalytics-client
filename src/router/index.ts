// src/router/index.ts
/* DO NOT import these at module level:
 import { onMounted } from 'vue'
 import { useThemeStore } from '@/stores/theme.store'
 import { useRoute } from 'vue-router'
*/
import Home from '@/views/Home.vue'
import PlayerDetail from '@/views/PlayerDetail.vue'
import TeamDetail from '@/views/TeamDetail.vue'
import PlayerAwardDetail from '@/views/PlayerAwardDetail.vue'
import PlayerTeamDetail from '@/views/PlayerTeamDetail.vue'
import CombineScoreDetail from '@/views/CombineScoreDetail.vue'
import DraftPickDetail from '@/views/DraftPickDetail.vue'
import ProspectDetail from '@/views/ProspectDetail.vue'
import GameDetail from '@/views/GameDetail.vue'
import DraftBoard from '@/views/DraftboardView.vue'

import JobDetail from '../views/jobs/JobDetail.vue'
import JobList from '@/views/jobs/JobList.vue'
import ScheduleDetail from '@/views/GameScheduleView.vue'
import TeamSelectionView from '@/views/TeamSelectionView.vue'
import { draftPickRoutes } from './draftPickRoutes'
import AppLayout from '@/components/ui/AppLayout.vue'
import { requireAuth } from './authGuard'
import { requireAdminOrDev } from './visitorGuard'

const JobsPage = () => import('@/views/JobsPage.vue')
// src/router/index.ts
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import { useAuthStore } from "@/stores/authStore";

// Core views
import ForgotPasswordView from '@/views/auth/ForgotPasswordView.vue'
import ResetPasswordView from '@/views/auth/ResetPasswordView.vue'
import DashboardView from '@/views/DashboardView.vue'
// Auth views
import LoginView from "@/views/auth/LoginView.vue";
import RegisterView from "@/views/auth/RegisterView.vue";
import VerifyEmailView from "@/views/auth/VerifyEmailView.vue";


// Admin views
import UserAdminView from "@/views/admin/UserAdminView.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/dashboard",
      component: AppLayout,
      children: [
        {
          path: '/',
          name: 'Home',
          component: Home,
          beforeEnter: requireAuth
        },
        {
          path: '/players/:id?',
          name: 'PlayerDetail',
          component: PlayerDetail,
          beforeEnter: requireAdminOrDev
        },
        {
          path: '/teams/:id?',
          name: 'TeamDetail',
          component: TeamDetail,
          beforeEnter: requireAdminOrDev
        },
        {
          path: '/standings',
          name: 'StandingsView',
          component: () => import('@/views/StandingsView.vue'),
          beforeEnter: requireAuth
        },
        {
          path: '/player-awards/:id?',
          name: 'PlayerAwardDetail',
          component: PlayerAwardDetail,
          beforeEnter: requireAuth
        },
        {
          path: '/player-teams/:id?',
          name: 'PlayerTeamDetail',
          component: PlayerTeamDetail,
          beforeEnter: requireAdminOrDev
        },
        {
          path: '/combine-scores/:id?',
          name: 'CombineScoreDetail',
          component: CombineScoreDetail,
          beforeEnter: requireAdminOrDev
        },
        {
          path: '/draft-simulator',
          name: 'DraftBoard',
          component: DraftBoard,
          beforeEnter: requireAuth
        },
        ...draftPickRoutes,
        {
          path: '/admin/import-draft',
          name: 'DraftImport',
          component: () => import('@/views/DraftImportView.vue'),
          beforeEnter: requireAdminOrDev,
          meta: {
            title: 'Import Draft Picks',
            requiresAuth: true,
            requiresAdmin: true,
          },
        },
        {
          path: '/admin/draft-pick-scraper',
          name: 'DraftPickScraper',
          component: () => import('@/views/admin/DraftPickScraperView.vue'),
          beforeEnter: requireAuth,
          meta: {
            requiresAuth: true,
            adminOnly: true,
            title: 'Draft Pick Scraper',
            icon: 'pi-cloud-download',
          },
        },
        {
          path: '/jobs',
          name: 'Jobs',
          component: () => import('@/views/jobs/JobsView.vue'),
          beforeEnter: requireAuth,
          meta: {
            title: 'Jobs',
            requiresAuth: true, // Adjust based on your auth requirements
          },
        },
        {
          path: '/jobs/:id',
          name: 'JobDetail',
          component: () => import('@/views/jobs/JobDetailView.vue'),
          beforeEnter: requireAuth,
          meta: {
            title: 'Job Detail',
            requiresAuth: true,
          },
        },
        {
          path: '/prospects/:id?',
          name: 'ProspectDetail',
          component: ProspectDetail,
          beforeEnter: requireAdminOrDev
        },
        {
          path: '/schedules',
          name: 'schedules',
          component: ScheduleDetail,
          beforeEnter: requireAuth,
          meta: {
            title: 'NFL Schedule',
            description: 'View and edit NFL game schedules',
          },
        },
        {
          path: '/show-upcoming-games',
          name: 'show-upcoming-games',
          component: () => import('@/views/ShowUpcomingGamesView.vue'),
          beforeEnter: requireAuth,
        },

        {
          path: '/player-awards/:id?',
          name: 'PlayerAwardDetail',
          component: PlayerAwardDetail,
        },
        // Add this route to your routes array
        {
          path: '/games/:id?',
          name: 'GameDetail',
          component: GameDetail,
          beforeEnter: requireAuth,
          meta: {
            title: 'Games',
            requiresAuth: true, // if you have authentication
          },
        },

        // Alternative: Use lazy loading (recommended)
        {
          path: '/games/:id?',
          name: 'GameDetail',
          component: () => import('@/views/GameDetail.vue'),
          meta: {
            title: 'Games',
            requiresAuth: true, // if you have authentication
          },
        },
        {
          path: '/jobs',
          name: 'jobs',
          component: JobsPage,
          beforeEnter: requireAuth,
        },

        /*
    {
      path: '/team-needs/:id?',
      name: 'TeamNeedDetail',
      component: TeamNeedDetail,
      beforeEnter: requireAdminOrDev
    },
    {
      path: '/post-season-results/:id?',
      name: 'PostSeasonResultDetail',
      component: PostSeasonResultDetail,
      beforeEnter: requireAdminOrDev
    },
    */
  {
    path: "/dashboard",
    name: "Dashboard",
    component: DashboardView,
  },

  // ─────────────────────────
  // AUTH ROUTES
  // ─────────────────────────
  {
    path: "/login",
    name: "Login",
    component: LoginView,
    meta: {
      public: true,
      onlyWhenLoggedOut: true,
    },
  },
  {
    path: "/register",
    name: "Register",
    component: RegisterView,
    meta: {
      public: true,
      onlyWhenLoggedOut: true,
    },
  },
  {
    path: "/verify-email/:token",
    name: "VerifyEmail",
    component: VerifyEmailView,
    meta: {
      public: true,
    },
  },
  {
    path: "/forgot-password",
    name: "ForgotPassword",
    component: ForgotPasswordView,
    meta: {
      public: true,
      onlyWhenLoggedOut: true,
    },
  },
  {
    path: "/reset-password/:token",
    name: "ResetPassword",
    component: ResetPasswordView,
    meta: {
      public: true,
      onlyWhenLoggedOut: true,
    },
  },

  // ─────────────────────────
  // ADMIN ROUTES (example)
  // ─────────────────────────
  {
    path: "/admin/users",
    name: "UserAdmin",
    component: UserAdminView,
    meta: {
      requiresAuth: true,
      minRole: 2, // 1=Visitor, 2=Admin, 3=Developer
    },
  },
      ],
    },
  // ...keep your existing routes for Teams, Schedule, Draft, etc...
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// ─────────────────────────
// Global Nav Guard
// ─────────────────────────
router.beforeEach((to, from, next) => {
  const auth = useAuthStore();

  const requiresAuth = Boolean(to.meta.requiresAuth);
  const onlyWhenLoggedOut = Boolean(to.meta.onlyWhenLoggedOut);
  const isLoggedIn = auth.isAuthenticated;

  // auth-only routes
  if (requiresAuth && !isLoggedIn) {
    next({
      name: "Login",
      query: { redirect: to.fullPath },
    });
    return;
  }

  // redirect logged-in users away from login/register/forgot/reset
  if (isLoggedIn && onlyWhenLoggedOut) {
    const redirect = (to.query.redirect as string | undefined) ?? "/dashboard";
    next(redirect);
    return;
  }

  // optional: role check for admin pages
  if (requiresAuth && typeof to.meta.minRole === "number") {
    const minRole = to.meta.minRole as number;
    const userRole = auth.role ?? 1;

    if (userRole < minRole) {
      // not authorized → send to dashboard (or a 403 page)
      next("/dashboard");
      return;
    }
  }

  next();
});

export default router;
