import type { RouteRecordRaw } from 'vue-router'
export const postDraftMetricRoutes: RouteRecordRaw[] = [{ path:'/post-draft-metrics/wr', name:'post-draft-wr-metrics', component:()=>import('../views/WrMetricManagementView.vue'), meta:{ requiresAuth:true, perm:{domain:'DRAFT_TOOLS',action:'VIEW'}, title:'WR Metric Ingestion' } }]
