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
import ScheduleDetail from '@/views/GameScheduleView.vue'
import TeamSelectionView from '@/views/TeamSelectionView.vue'

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
      path: '/draft-picks/:id?',
      name: 'DraftPickDetail',
      component: DraftPickDetail,
    },
    {
      path: '/draft',
      name: 'draft',
      component: TeamSelectionView,
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
    // Fixed: removed duplicate PlayerAwardDetail route
    
    // Fixed: removed duplicate GameDetail routes, kept the lazy-loaded one
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
      component: JobsPage 
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

// DO NOT call Vue composition functions at module level
// Remove these lines:
// const route = useRoute();
// const themeStore = useThemeStore();
// onMounted(async () => { ... });

export default router