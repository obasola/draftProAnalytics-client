import type { RouteRecordRaw } from 'vue-router';
import DpaNflJobsPage from '../pages/DpaNflJobsPage.vue';

export const jobsRoutes: readonly RouteRecordRaw[] = [
  {
    path: '/jobs/nfl-imports',
    name: 'DpaNflJobs',
    component: DpaNflJobsPage,
    meta: {
      label: 'NFL Jobs',
      domain: 'JOBS',
      action: 'VIEW',
    },
  },
];
