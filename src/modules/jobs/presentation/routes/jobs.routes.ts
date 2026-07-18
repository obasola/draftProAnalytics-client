// src/modules/jobs/presentation/routes/jobs.routes.ts
import type { RouteRecordRaw } from 'vue-router'

export const jobsRoutes: readonly RouteRecordRaw[] = [
  {
    path: 'jobs',
    name: 'Jobs',
    component: () => import('@/modules/jobs/presentation/pages/DpaNflJobsQueuePage.vue'),
    meta: {
      requiresAuth: true,
      perm: { domain: 'JOBS', action: 'VIEW' },
      title: 'Job Queue',
    },
  },
  {
    path: 'jobs/nfl-imports',
    name: 'ImportNflData',
    component: () => import('@/modules/jobs/presentation/pages/DpaNflJobsPage.vue'),
    meta: {
      requiresAuth: true,
      perm: { domain: 'JOBS', action: 'RUN' },
      title: 'Import NFL Data',
    },
  },
  {
    path: 'jobs/nfl-imports/schedule',
    redirect: '/jobs/nfl-imports',
  },
  {
    path: 'jobs/nfl-imports/scores',
    redirect: '/jobs/nfl-imports',
  },
  {
    path: 'jobs/nfl-imports/draft',
    name: 'ImportEspnDraftData',
    component: () => import('@/modules/jobs/presentation/views/EspnDraftImportPage.vue'),
    meta: {
      requiresAuth: true,
      perm: { domain: 'JOBS', action: 'RUN' },
      title: 'Import ESPN Draft Data',
    },
  },
  {
    path: 'jobs/nfl-imports/team-roster',
    name: 'ImportTeamRoster',
    component: () => import('@/modules/jobs/presentation/views/EspnTeamRosterImportPage.vue'),
    meta: {
      requiresAuth: true,
      perm: { domain: 'JOBS', action: 'RUN' },
      title: 'Import Team Roster',
    },
  },
  {
    path: 'jobs/:id',
    name: 'JobDetail',
    component: () => import('@/components/jobs/JobDetail.vue'),
    meta: {
      requiresAuth: true,
      perm: { domain: 'JOBS', action: 'VIEW' },
      title: 'Job Detail',
    },
  },
]
