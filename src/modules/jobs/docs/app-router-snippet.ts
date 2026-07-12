// src/router/index.ts or your current router composition file
// Replace the legacy /jobs route entries with the module routes.

import { jobsRoutes } from '@/modules/jobs';

const routes = [
  // ...existing routes
  ...jobsRoutes,
];
