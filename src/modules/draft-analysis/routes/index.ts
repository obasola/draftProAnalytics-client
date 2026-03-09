// src/modules/draft-analysis/routes/index.ts
import { RouteRecordRaw } from 'vue-router';

export const draftAnalysisRoutes: RouteRecordRaw[] = [
  {
    path: '/draft-analysis',
    name: 'DraftAnalysis',
    component: () => import('../views/DraftAnalysisView.vue'),
    meta: {
      title: 'Draft Analysis',
      requiresAuth: true
    }
  },
  {
    path: '/draft-analysis/:teamId',
    name: 'DraftAnalysisTeam',
    component: () => import('../views/DraftAnalysisView.vue'),
    meta: {
      title: 'Draft Analysis',
      requiresAuth: true
    }
  }
];