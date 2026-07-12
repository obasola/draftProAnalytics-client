# DPA Jobs Module Add-On: Import Game Scores

This add-on moves the existing `IMPORT_SCORES_WEEK` operation into the new `src/modules/jobs` client module.

## What this adds

```txt
src/modules/jobs/domain/weeklyScoreImport.types.ts
src/modules/jobs/infrastructure/weeklyScoreImportApi.ts
src/modules/jobs/presentation/components/ImportGameScoresPanel.vue
src/modules/jobs/presentation/views/ImportGameScoresPage.vue
docs/jobs-routes-update-snippet.ts
docs/navigation-update-snippet.ts
docs/job-type-label-update-snippet.ts
```

## Why this is separate from Load Season Schedule

`LoadSeasonSchedulePanel.vue` queues or calls schedule import jobs using `IMPORT_NFL_SCHEDULE` / `/imports/nfl-schedule`.

This add-on queues score import jobs using the existing generic jobs queue endpoint:

```txt
POST /api/jobs
```

with the payload:

```json
{
  "type": "IMPORT_SCORES_WEEK",
  "payload": {
    "seasonYear": 2026,
    "seasonType": 2,
    "week": 1
  },
  "autoStart": true
}
```

That matches the legacy comment previously found in `src/components/jobs/JobList.vue`:

```ts
await jobStore.createJob({
  type: 'IMPORT_SCORES_WEEK',
  payload: { seasonYear: 2025, seasonType: 2, week: 7 },
});
```

## Install

From the extracted add-on root, copy files into the client app:

```bash
cp -R src/modules/jobs/* /home/dthompson/aiAssistWS/draftProAnalytics-client/src/modules/jobs/
```

## Router update

Open:

```txt
src/modules/jobs/presentation/routes/jobs.routes.ts
```

Add the route from:

```txt
docs/jobs-routes-update-snippet.ts
```

Recommended route:

```txt
/jobs/import-game-scores
```

## Navigation update

Open your app navigation component and add the menu item from:

```txt
docs/navigation-update-snippet.ts
```

Recommended placement:

```txt
Jobs Menu
  - Load Season Schedule
  - Import Game Scores
  - Job Queue
```

## Verify job type display

The full module migration archive already included this label mapping in:

```txt
src/modules/jobs/presentation/components/jobUi.ts
```

```ts
case 'IMPORT_SCORES_WEEK':
  return 'Import Weekly Scores';
```

If your local file does not have it, add the snippet from:

```txt
docs/job-type-label-update-snippet.ts
```

## Test

Start client and server, then open:

```txt
http://localhost:5173/jobs/import-game-scores
```

Queue one regular-season week first:

```txt
Season Year: 2026
Season Type: Regular Season
Start Week: 1
End Week: 1
Auto start jobs: checked
```

Expected behavior:

1. UI posts to `/api/jobs`.
2. Job type is `IMPORT_SCORES_WEEK`.
3. Payload includes `seasonYear`, `seasonType`, and `week`.
4. Job queue id appears in the table.
5. UI polls `/api/jobs/:jobId` until `COMPLETED`, `FAILED`, or `CANCELLED`.

## Backend dependency

This assumes the server supports the generic job queue endpoint and has a registered handler for:

```txt
IMPORT_SCORES_WEEK
```

If the backend uses a direct route instead, such as `/api/imports/nfl-scores`, update `weeklyScoreImportApi.ts` to call that direct endpoint instead of `jobApi.queueJob`.
