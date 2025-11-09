// src/router/draftPickRoutes.ts
import type { RouteRecordRaw } from 'vue-router'

export const draftPickRoutes: RouteRecordRaw[] = [
  {
    path: '/draftpicks',
    name: 'DraftPickList',
    component: () => import('@/views/DraftPickView.vue'),
    meta: { title: 'Draft Picks' },
  },
  {
    path: '/draftpicks/create',
    name: 'DraftPickCreate',
    component: () => import('@/views/DraftPickDetailView.vue'),
    meta: { title: 'Create Draft Pick', mode: 'create' },
  },
  {
    path: '/draftpicks/:draftYear/:round/:pickNumber',
    name: 'DraftPickDetail',
    component: () => import('@/views/DraftPickDetailView.vue'),
    meta: { title: 'Draft Pick Detail' },
  },
]
