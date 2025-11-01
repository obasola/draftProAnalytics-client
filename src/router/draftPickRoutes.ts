import type { RouteRecordRaw } from 'vue-router';

export const draftPickRoutes: RouteRecordRaw[] = [
  {
    path: '/draftpicks',
    name: 'DraftPicks',
    component: () => import('@/views/DraftPickView.vue'),
    meta: {
      title: 'Draft Picks',
      requiresAuth: false,
    },
  },
  {
    path: '/draftpicks/:id',
    name: 'DraftPickDetail',
    component: () => import('@/views/DraftPickDetailView.vue'),
    meta: {
      title: 'Draft Pick Details',
      requiresAuth: false,
    },
  },
];