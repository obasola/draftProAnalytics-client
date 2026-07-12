# Legacy Jobs UI Cleanup Checklist

Use this after the module compiles and routes correctly.

## Legacy files to retire or archive

These files were part of the pre-module Jobs UI layout:

```txt
src/components/jobs/JobActions.vue
src/components/jobs/JobActionsSmall.vue
src/components/jobs/JobDetail.vue
src/components/jobs/JobFilters.vue
src/components/jobs/JobList.vue
src/components/jobs/JobLogsPanel.vue
src/components/jobs/JobQueueDialog.vue
src/components/jobs/JobSchedulePanel.vue
src/components/jobs/JobsScoreboardPanel.vue
src/components/jobs/JobTable.vue
src/components/jobs/ScheduleEditor.vue
src/components/jobs/ScheduleList.vue
src/components/jobs/WeeklyEventSyncPanel.vue
src/views/JobsPage.vue
```

Do not delete them first. Move them to a temporary archive folder, run the build, then remove them after verification.

Recommended local safety move:

```bash
mkdir -p src/_legacy/jobs
mv src/components/jobs src/_legacy/jobs/components-jobs
mv src/views/JobsPage.vue src/_legacy/jobs/JobsPage.vue
```

Then run:

```bash
npm run build
npm run dev
```

## Search for stale imports

```bash
grep -R "components/jobs" -n src
grep -R "views/JobsPage" -n src
grep -R "stores/jobStore" -n src
grep -R "types/Job" -n src
```

Any remaining Jobs imports should be moved to:

```txt
src/modules/jobs
```

## Route priority warning

Keep `/jobs/load-season-schedule` before `/jobs/:id` in the route list. Otherwise Vue Router may treat `load-season-schedule` as an id.
