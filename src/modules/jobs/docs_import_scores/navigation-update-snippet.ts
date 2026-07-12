// Add this under the Jobs Menu items.

routeItem({
  label: 'Import Game Scores',
  icon: 'pi pi-stopwatch',
  to: '/jobs/import-game-scores',
  requiredPerm: { domain: 'JOBS', action: 'RUN' },
}),
