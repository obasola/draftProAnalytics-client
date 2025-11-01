// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
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
// Import the new draft pick routes
import { draftPickRoutes } from './draftPickRoutes'
// DO NOT import these at module level:
// import { onMounted } from 'vue'
// import { useThemeStore } from '@/stores/theme.store'
// import { useRoute } from 'vue-router'
const JobsPage = () => import('@/views/JobsPage.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
    },
    {
      path: '/players/:id?',
      name: 'PlayerDetail',
      component: PlayerDetail,
    },
    {
      path: '/teams/:id?',
      name: 'TeamDetail',
      component: TeamDetail,
    },
    {
      path: '/standings',
      name: 'StandingsView',
      component: () => import('@/views/StandingsView.vue'),
    },
    {
      path: '/player-awards/:id?',
      name: 'PlayerAwardDetail',
      component: PlayerAwardDetail,
    },
    {
      path: '/player-teams/:id?',
      name: 'PlayerTeamDetail',
      component: PlayerTeamDetail,
    },
    {
      path: '/combine-scores/:id?',
      name: 'CombineScoreDetail',
      component: CombineScoreDetail,
    },
    {
      path: '/draft-simulator',
      name: 'DraftBoard',
      component: DraftBoard,
    },
    // OLD ROUTE - You may want to remove or keep for backward compatibility
    // {
    //   path: '/draft-picks/:id?',
    //   name: 'DraftPickDetail',
    //   component: DraftPickDetail,
    // },
    
    // NEW DRAFT PICK ROUTES - Spread them into the routes array
    ...draftPickRoutes,
    {
      path: '/admin/import-draft',
      name: 'DraftImport',
      component: () => import('@/views/DraftImportView.vue'),
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
      meta: {
        title: 'Jobs',
        requiresAuth: true, // Adjust based on your auth requirements
      },
    },
    {
      path: '/jobs/:id',
      name: 'JobDetail',
      component: () => import('@/views/jobs/JobDetailView.vue'),
      meta: {
        title: 'Job Detail',
        requiresAuth: true,
      },
    },
    {
      path: '/prospects/:id?',
      name: 'ProspectDetail',
      component: ProspectDetail,
    },
    {
      path: '/schedules',
      name: 'schedules',
      component: ScheduleDetail,
      meta: {
        title: 'NFL Schedule',
        description: 'View and edit NFL game schedules',
      },
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
    },
    /*
    {
      path: '/team-needs/:id?',
      name: 'TeamNeedDetail',
      component: TeamNeedDetail,
    },
    {
      path: '/post-season-results/:id?',
      name: 'PostSeasonResultDetail',
      component: PostSeasonResultDetail,
    },
    */
  ],
})

export default router
