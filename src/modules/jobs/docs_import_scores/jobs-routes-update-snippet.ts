// src/modules/jobs/presentation/routes/jobs.routes.ts
// Add this route to the exported jobsRoutes array.

{
  path: '/jobs/import-game-scores',
  name: 'ImportGameScores',
  component: () => import('../views/ImportGameScoresPage.vue'),
  meta: {
    domain: 'JOBS',
    action: 'RUN',
  },
}
