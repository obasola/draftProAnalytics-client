// src/modules/teamNeedsAnalysis/router/routes.ts

import type { RouteRecordRaw } from 'vue-router';

export const teamNeedsAnalysisRoutes: RouteRecordRaw[] = [
  {
    path: '/team-needs',
    name: 'team-needs',
    redirect: { name: 'team-needs-dashboard' },
    children: [
      {
        path: 'dashboard',
        name: 'team-needs-dashboard',
        component: () => import('../views/TeamNeedsDashboard.vue'),
        meta: {
          title: 'Team Draft Needs',
          requiresAuth: true,
        },
      },
      {
        path: ':teamId',
        name: 'team-needs-detail',
        component: () => import('../views/TeamNeedsDetail.vue'),
        meta: {
          title: 'Team Needs Detail',
          requiresAuth: true,
        },
      },
    ],
  },
];