// src/modules/playoffs/presentation/playoffsRoutes.ts
import type { RouteRecordRaw } from 'vue-router'
import PlayoffBracketView from '@/modules/playoffs/presentation/views/PlayoffBracketView.vue'

export const playoffsRoutes: RouteRecordRaw[] = [
  {
    path: '/playoffs/bracket',
    name: 'playoff-bracket',
    component: PlayoffBracketView,
    meta: {
      requiresAuth: true,
      allowedRoles: [1, 2, 3], // Visitor, Admin, Developer can view
    },
  },
]
