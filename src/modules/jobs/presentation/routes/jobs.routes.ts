// src/modules/jobs/presentation/routes/jobs.routes.ts
import type { RouteRecordRaw } from 'vue-router';

export const jobsRoutes: readonly RouteRecordRaw[] = [
  {
    path: 'jobs',
    name: 'Jobs',
    component: () => import('@/modules/jobs/presentation/pages/DpaNflJobsPage.vue'),
    meta: {
      requiresAuth: true,
      perm: { domain: 'JOBS', action: 'VIEW' },
      title: 'Job Queue',
    },
  },

  {
    path: 'jobs/nfl-imports/schedule',
    name: 'ImportSeasonSchedule',
    component: () => import('@/modules/jobs/presentation/pages/DpaNflJobsPage.vue'),
    props: {
      mode: 'season-schedule',
    },
    meta: {
      requiresAuth: true,
      perm: { domain: 'JOBS', action: 'RUN' },
      title: 'Import Season Schedule',
    },
  },

  {
    path: 'jobs/nfl-imports/scores',
    name: 'ImportWeeklyScores',
    component: () => import('@/modules/jobs/presentation/pages/DpaNflJobsPage.vue'),
    props: {
      mode: 'weekly-scores',
    },
    meta: {
      requiresAuth: true,
      perm: { domain: 'JOBS', action: 'RUN' },
      title: 'Import Weekly Scores',
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
];