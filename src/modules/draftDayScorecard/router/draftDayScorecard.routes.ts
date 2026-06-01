import type { RouteRecordRaw } from 'vue-router'
import DraftPickManagementView from '../views/DraftPickManagementView.vue'
import DraftReportCardsView from '../views/DraftReportCardsView.vue'
import TeamDraftReportCardView from '../views/TeamDraftReportCardView.vue'

export const draftDayScorecardRoutes: RouteRecordRaw[] = [
  {
    path: '/draft-day-scorecard',
    name: 'draft-day-scorecard',
    component: DraftReportCardsView,
    meta: {
      domain: 'DRAFT',
      action: 'VIEW',
    },
  },
  {
    path: '/draft-day-scorecard/:draftYear',
    name: 'draft-day-scorecard-year',
    component: DraftReportCardsView,
    meta: {
      domain: 'DRAFT',
      action: 'VIEW',
    },
  },
  {
    path: '/draft-day-scorecard/:draftYear/teams/:teamId',
    name: 'draft-day-scorecard-team',
    component: TeamDraftReportCardView,
    meta: {
      domain: 'DRAFT',
      action: 'VIEW',
    },
  },
  {
    path: '/draft-day-scorecard/:draftYear/manage',
    name: 'draft-day-scorecard-manage',
    component: DraftPickManagementView,
    meta: {
      domain: 'DRAFT',
      action: 'EDIT',
    },
  },
]
