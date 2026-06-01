# DPA Client Jobs Module: Full Module Migration

This archive provides a full module migration version of the DPA Jobs UI.

It moves Jobs from the legacy layout:

```txt
src/components/jobs/*
src/views/JobsPage.vue
src/stores/jobStore.ts
src/types/Job.ts
```

into the module layout:

```txt
src/modules/jobs/
  domain/
  application/
  infrastructure/
  presentation/
```

The package includes the new **Load Season Schedule** workflow as a first-class Jobs module feature.

## Feature summary

Adds or replaces:

```txt
src/modules/jobs/domain/job.types.ts
src/modules/jobs/domain/seasonScheduleLoad.types.ts
src/modules/jobs/infrastructure/jobApi.ts
src/modules/jobs/infrastructure/seasonScheduleImportApi.ts
src/modules/jobs/application/useJobStatusPolling.ts
src/modules/jobs/application/stores/job.store.ts
src/modules/jobs/presentation/components/JobActions.vue
src/modules/jobs/presentation/components/JobDetail.vue
src/modules/jobs/presentation/components/JobList.vue
src/modules/jobs/presentation/components/JobLogsPanel.vue
src/modules/jobs/presentation/components/JobQueueDialog.vue
src/modules/jobs/presentation/components/JobSchedulePanel.vue
src/modules/jobs/presentation/components/JobTable.vue
src/modules/jobs/presentation/components/LoadSeasonSchedulePanel.vue
src/modules/jobs/presentation/routes/jobs.routes.ts
src/modules/jobs/presentation/views/JobDetailPage.vue
src/modules/jobs/presentation/views/JobsPage.vue
src/modules/jobs/presentation/views/LoadSeasonSchedulePage.vue
src/modules/jobs/index.ts
```

## Backend endpoints expected

This module assumes the current backend exposes these routes under the existing Axios base URL `/api`:

```http
GET    /api/jobs
GET    /api/jobs/:jobId
GET    /api/jobs/:jobId/logs
POST   /api/jobs
POST   /api/jobs/:jobId/run
POST   /api/jobs/:jobId/cancel
GET    /api/jobs/schedules
POST   /api/jobs/schedules
PATCH  /api/jobs/schedules/:scheduleId
DELETE /api/jobs/schedules/:scheduleId
POST   /api/imports/nfl-schedule
```

The season schedule import payload is:

```json
{
  "seasonYear": 2026,
  "seasonType": 2,
  "week": 1,
  "dryRun": false
}
```

Season type values:

```txt
1 = preseason
2 = regular season
3 = postseason
```

## Install

From the extracted archive root:

```bash
cp -R src/modules/jobs /home/dthompson/aiAssistWS/draftProAnalytics-client/src/modules/
```

Or from inside the DPA client root:

```bash
cp -R /path/to/extracted/src/modules/jobs src/modules/
```

## Router wiring

Add the module routes to your router.

```ts
import { jobsRoutes } from '@/modules/jobs';

const routes = [
  // existing routes
  ...jobsRoutes,
];
```

Important: remove or disable legacy `/jobs` and `/jobs/:id` routes so there are no duplicate route names.

## Navigation wiring

Add this to the Jobs Menu section in `AppNavigation.vue`:

```ts
routeItem({
  label: 'Load Season Schedule',
  icon: 'pi pi-cloud-download',
  to: '/jobs/load-season-schedule',
  requiredPerm: { domain: 'JOBS', action: 'RUN' },
})
```

Also keep:

```ts
routeItem({
  label: 'Job Queue',
  icon: 'pi pi-list',
  to: '/jobs',
  requiredPerm: { domain: 'JOBS', action: 'VIEW' },
})
```

## Forced migration steps

1. Copy `src/modules/jobs` from this archive into the client app.
2. Wire `jobsRoutes` into the router.
3. Replace the Jobs Menu entries with module route targets.
4. Temporarily archive the legacy Jobs files:

```bash
mkdir -p src/_legacy/jobs
mv src/components/jobs src/_legacy/jobs/components-jobs
mv src/views/JobsPage.vue src/_legacy/jobs/JobsPage.vue
```

5. Search for stale legacy imports:

```bash
grep -R "components/jobs" -n src
grep -R "views/JobsPage" -n src
grep -R "stores/jobStore" -n src
grep -R "types/Job" -n src
```

6. Run:

```bash
npm run build
npm run dev
```

## Expected UI routes

```txt
/jobs
/jobs/load-season-schedule
/jobs/:id
```

## What to test

1. Navigate to `/jobs` and confirm the queue loads.
2. Navigate to `/jobs/load-season-schedule`.
3. Choose year `2026`, plan `Regular season only`, weeks `1` through `18`.
4. Submit jobs.
5. Confirm one job id appears per week.
6. Confirm statuses poll and transition.
7. Open `/jobs/:id` from the queue and confirm logs/details load.

## Notes

This is intentionally stricter than the additive feature archive. It is designed to force Jobs into the module boundary and retire legacy `/src/components/jobs` usage.

If your backend job routes differ slightly, adjust only:

```txt
src/modules/jobs/infrastructure/jobApi.ts
src/modules/jobs/infrastructure/seasonScheduleImportApi.ts
```
