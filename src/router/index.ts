// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/modules/auth/application/authStore'

// guards
import { requireAuth } from '@/modules/auth/authGuard'
import { requireAdminOrDev } from '@/modules/auth/visitorGuard'

// router shell layout
import MainLayout from '@/layouts/MainLayout.vue'

// legacy/core views
import Home from '@/views/Home.vue'
import DashboardView from '@/views/DashboardView.vue'
import PlayerDetail from '@/views/PlayerDetail.vue'
import TeamDetail from '@/views/TeamDetail.vue'
import PlayerAwardDetail from '@/views/PlayerAwardDetail.vue'
import PlayerTeamDetail from '@/views/PlayerTeamDetail.vue'
import CombineScoreDetail from '@/views/CombineScoreDetail.vue'
import ProspectDetail from '@/views/ProspectDetail.vue'
import GameDetail from '@/views/GameDetail.vue'
import DraftBoard from '@/views/DraftboardView.vue'
import ScheduleDetail from '@/views/GameScheduleView.vue'

// auth module views
import LoginView from '@/modules/auth/presentation/views/LoginView.vue'
import RegisterView from '@/modules/auth/presentation/views/RegisterView.vue'
import VerifyEmailView from '@/modules/auth/presentation/views/VerifyEmailView.vue'

// other views
import UserAdminView from '@/views/admin/UserAdminView.vue'
import { draftOrderRoutes } from '@/modules/draftOrder/presentation/router/draftOrderRoutes'

// route bundles
import { draftPickRoutes } from './draftPickRoutes'
import { playoffsRoutes } from '../modules/playoffs/presentation/routes/playoffsRoute'
import { teamNeedsRoutes } from '@/modules/teams/presentation/router/teamNeedsRoutes'

const routes: RouteRecordRaw[] = [
  // ─────────────────────────
  // PUBLIC / AUTH (standalone)
  // ─────────────────────────
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { public: true, onlyWhenLoggedOut: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView,
    meta: { public: true, onlyWhenLoggedOut: true },
  },
  {
    path: '/verify-email/:token',
    name: 'VerifyEmail',
    component: VerifyEmailView,
    meta: { public: true },
  },

  // ─────────────────────────
  // APP (shell layout w/ left nav)
  // ─────────────────────────
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', redirect: '/dashboard' },

      {
        path: 'dashboard',
        name: 'Dashboard',
        component: DashboardView,
        meta: { requiresAuth: true },
      },

      // Mock Draft Simulator (single source of truth paths)
      {
        path: 'draft-simulator',
        name: 'DraftLobby',
        component: () =>
          import('@/modules/draftSimulator/presentation/views/DraftLobbyViewPrev.vue'),
        beforeEnter: requireAuth,
        meta: { requiresAuth: true },
      },
      {
        path: 'draft-simulator/:id',
        name: 'DraftRoom',
        component: () => import('@/modules/draftSimulator/presentation/views/DraftRoomView.vue'),
        beforeEnter: requireAuth,
        meta: { requiresAuth: true },
      },

      // keep Home if still used
      {
        path: 'home',
        name: 'Home',
        component: Home,
        beforeEnter: requireAuth,
        meta: { requiresAuth: true },
      },

      {
        path: 'players/:id?',
        name: 'PlayerDetail',
        component: PlayerDetail,
        beforeEnter: requireAdminOrDev,
        meta: { requiresAuth: true },
      },
      {
        path: 'teams/:id?',
        name: 'TeamDetail',
        component: TeamDetail,
        beforeEnter: requireAdminOrDev,
        meta: { requiresAuth: true },
      },

      // ✅ module routes
      ...teamNeedsRoutes,

      {
        path: 'standings',
        name: 'StandingsView',
        component: () => import('@/views/StandingsView.vue'),
        beforeEnter: requireAuth,
        meta: { requiresAuth: true, title: 'Standings' },
      },
      {
        path: 'player-awards/:id?',
        name: 'PlayerAwardDetail',
        component: PlayerAwardDetail,
        beforeEnter: requireAuth,
        meta: { requiresAuth: true },
      },
      {
        path: 'player-teams/:id?',
        name: 'PlayerTeamDetail',
        component: PlayerTeamDetail,
        beforeEnter: requireAdminOrDev,
        meta: { requiresAuth: true },
      },
      {
        path: 'combine-scores/:id?',
        name: 'CombineScoreDetail',
        component: CombineScoreDetail,
        beforeEnter: requireAdminOrDev,
        meta: { requiresAuth: true },
      },

      // ✅ rename old DraftBoard route so it doesn't collide with /draft-simulator
      {
        path: 'draft-board',
        name: 'DraftBoard',
        component: DraftBoard,
        beforeEnter: requireAuth,
        meta: { requiresAuth: true },
      },

      ...draftPickRoutes,
      ...draftOrderRoutes,
      {
        path: 'draft-order',
        name: 'DraftOrderSnapshots',
        component: () =>
          import('@/modules/draftOrder/presentation/views/DraftOrderSnapshotsView.vue'),
        beforeEnter: requireAuth,
        meta: { requiresAuth: true, title: 'Draft Order' },
      },
      {
        path: 'draft-order/snapshots/:id',
        name: 'DraftOrderSnapshotDetail',
        component: () =>
          import('@/modules/draftOrder/presentation/views/DraftOrderSnapshotDetailView.vue'),
        beforeEnter: requireAuth,
        meta: { requiresAuth: true, title: 'Draft Order Snapshot' },
      },
      {
        path: 'admin/import-draft',
        name: 'DraftImport',
        component: () => import('@/views/DraftImportView.vue'),
        beforeEnter: requireAdminOrDev,
        meta: { title: 'Import Draft Picks', requiresAuth: true, minRole: 2 },
      },
      {
        path: 'admin/draft-pick-scraper',
        name: 'DraftPickScraper',
        component: () => import('@/views/admin/DraftPickScraperView.vue'),
        beforeEnter: requireAdminOrDev,
        meta: {
          requiresAuth: true,
          minRole: 2,
          title: 'Draft Pick Scraper',
          icon: 'pi-cloud-download',
        },
      },

      {
        path: 'jobs',
        name: 'Jobs',
        component: () => import('@/views/jobs/JobsView.vue'),
        beforeEnter: requireAuth,
        meta: { title: 'Jobs', requiresAuth: true },
      },
      {
        path: 'jobs/:id',
        name: 'JobDetail',
        component: () => import('@/views/jobs/JobDetailView.vue'),
        beforeEnter: requireAuth,
        meta: { title: 'Job Detail', requiresAuth: true },
      },

      {
        path: 'prospects/:id?',
        name: 'ProspectDetail',
        component: ProspectDetail,
        beforeEnter: requireAdminOrDev,
        meta: { requiresAuth: true },
      },
      {
        path: 'schedules',
        name: 'schedules',
        component: ScheduleDetail,
        beforeEnter: requireAuth,
        meta: { requiresAuth: true, title: 'NFL Schedule' },
      },
      {
        path: 'show-upcoming-games',
        name: 'show-upcoming-games',
        component: () => import('@/views/ShowUpcomingGamesView.vue'),
        beforeEnter: requireAuth,
        meta: { requiresAuth: true },
      },
      ...playoffsRoutes,
      {
        path: 'games/:id?',
        name: 'GameDetail',
        component: GameDetail,
        beforeEnter: requireAuth,
        meta: { requiresAuth: true, title: 'Games' },
      },

      {
        path: 'admin/users',
        name: 'UserAdmin',
        component: UserAdminView,
        beforeEnter: requireAdminOrDev,
        meta: { requiresAuth: true, minRole: 2 },
      },
    ],
  },

  // fallback
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// ─────────────────────────
// Global Nav Guard
// ─────────────────────────
router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()

  const requiresAuth = Boolean(to.meta.requiresAuth)
  const onlyWhenLoggedOut = Boolean(to.meta.onlyWhenLoggedOut)
  const isLoggedIn = auth.isAuthenticated

  if (requiresAuth && !isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  if (isLoggedIn && onlyWhenLoggedOut) {
    const redirect = (to.query.redirect as string | undefined) ?? '/dashboard'
    next(redirect)
    return
  }

  if (requiresAuth && typeof to.meta.minRole === 'number') {
    const minRole = to.meta.minRole as number
    const userRole = auth.role ?? 1
    if (userRole < minRole) {
      next('/dashboard')
      return
    }
  }

  next()
})

export default router
