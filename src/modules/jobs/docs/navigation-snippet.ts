// Add or replace the Jobs Menu section in AppNavigation.vue.
// Keep your existing routeItem helper and RBAC filtering.

{
  label: 'Jobs Menu',
  icon: 'pi pi-cog',
  items: [
    routeItem({
      label: 'Load Season Schedule',
      icon: 'pi pi-cloud-download',
      to: '/jobs/load-season-schedule',
      requiredPerm: { domain: 'JOBS', action: 'RUN' },
    }),
    routeItem({
      label: 'Job Queue',
      icon: 'pi pi-list',
      to: '/jobs',
      requiredPerm: { domain: 'JOBS', action: 'VIEW' },
    }),
    routeItem({
      label: 'Job Schedules',
      icon: 'pi pi-calendar-plus',
      to: '/jobs',
      requiredPerm: { domain: 'JOBS', action: 'VIEW' },
    }),
  ],
}
