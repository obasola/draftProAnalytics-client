<!-- src/components/ui/AppNavigation.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Menu from 'primevue/menu'
import { useNavigation } from '@/composables/useNavigation'

const router = useRouter()
const { goToPage } = useNavigation()

const menuItems = ref([
  { label: 'Dashboard', icon: 'pi pi-chart-line', command: () => router.push('/') },
  { label: 'Games', icon: 'pi pi-calendar', command: () => router.push('/games') },
  { label: 'Players', icon: 'pi pi-users', command: () => router.push('/players') },
  { label: 'Teams', icon: 'pi pi-flag', command: () => router.push('/teams') },
  { label: 'Prospects', icon: 'pi pi-star', command: () => router.push('/prospects') },
  { label: 'Draft Picks', icon: 'pi pi-list', command: () => router.push('/draft-picks') },
  { label: 'Combine Scores', icon: 'pi pi-chart-bar', command: () => router.push('/combine-scores') },
  { label: 'Schedules', icon: 'pi pi-calendar', command: () => router.push('/schedules') },
  { label: 'Player Awards', icon: 'pi pi-trophy', command: () => router.push('/player-awards') },
  { label: 'Player Teams', icon: 'pi pi-users', command: () => router.push('/player-teams') },
  { label: 'Team Needs', icon: 'pi pi-exclamation-triangle', command: () => router.push('/team-needs') },
  { label: 'Team Standings', icon: 'pi pi-exclamation-triangle', command: () => router.push('/standings') },
  { label: 'Post Season Results', icon: 'pi pi-crown', command: () => router.push('/post-season-results') },
  {
    label: 'Draft Menu', icon: 'pi pi-folder', items: [
      { label: 'Draft Simulator', icon: 'pi pi-stopwatch', command: () => router.push('draft-simulator') },
      { label: 'Draft Tracker', icon: 'pi pi-stopwatch', command: () => router.push('draft-tracker') },
      { label: 'Draft Pick Scraper', icon: 'pi pi-cloud-download', route: '/admin/draft-pick-scraper'}
    ]
  },
  {
    label: 'Batch Jobs Menu', icon: 'pi pi-folder', items: [
      { label: 'Jobs', icon: 'pi pi-stopwatch', command: () => goToPage('jobs'), to: { name: 'jobs' } }
    ]
  },
])
</script>

<template>
  <nav class="app-navigation" role="navigation" aria-label="Main Navigation">
    <Menu :model="menuItems" class="nav-menu" />
  </nav>
</template>

<style scoped>
.app-navigation {
  width: 260px;
  background: var(--nav-bg);          /* bg1 #9E4B03 */
  color: var(--text-on-bg1);          /* white */
  border-right: 1px solid rgba(0,0,0,0.35);
  padding: 0.75rem 0.5rem;
  overflow-y: auto;
}

/* PrimeVue Menu overrides */
:deep(.nav-menu.p-menu) {
  background: transparent;
  border: none;
  width: 100%;
  color: var(--text-on-bg1);
}

:deep(.p-menuitem-link) {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
  color: var(--text-on-bg1);
  font-weight: 700;                   /* darker/bolder per your ask */
  transition: background 0.18s, color 0.18s;
}

:deep(.p-menuitem-link:hover) {
  background: rgba(255,255,255,0.1);
  color: #FFFFFF;
}

:deep(.p-menuitem-icon) { color: var(--text-on-bg1); }
:deep(.p-menuitem-link:hover .p-menuitem-icon) { color: #FFFFFF; }

/* Submenus */
:deep(.p-submenu-list) {
  background: var(--card-bg);         /* bg1 inside */
  padding-left: 0.4rem;
  border-left: 2px solid rgba(255,255,255,0.25);
  border-radius: 6px;
  margin-left: 0.35rem;
}

/* Scrollbar styling */
:deep(::-webkit-scrollbar) { width: 10px; }
:deep(::-webkit-scrollbar-track) { background: var(--content-bg); }
:deep(::-webkit-scrollbar-thumb) { background: rgba(0,0,0,0.35); border-radius: 5px; }
:deep(::-webkit-scrollbar-thumb:hover) { background: rgba(0,0,0,0.5); }
</style>
