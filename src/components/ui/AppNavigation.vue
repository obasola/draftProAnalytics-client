<!-- src/components/ui/AppNavigation.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Menu from 'primevue/menu'
import { useNavigation } from '@/composables/useNavigation' // or wherever it's defined

const router = useRouter()
const { goToPage } = useNavigation()

const menuItems = ref([
  {
    label: 'Dashboard',
    icon: 'pi pi-chart-line',
    command: () => router.push('/'),
  },
  {
    label: 'Games',
    icon: 'pi pi-calendar',
    command: () => router.push('/games'),
  },
  {
    label: 'Players',
    icon: 'pi pi-users',
    command: () => router.push('/players'),
  },
  {
    label: 'Teams',
    icon: 'pi pi-flag',
    command: () => router.push('/teams'),
  },
  {
    label: 'Prospects',
    icon: 'pi pi-star',
    command: () => router.push('/prospects'),
  },
  {
    label: 'Draft Picks',
    icon: 'pi pi-list',
    command: () => router.push('/draft-picks'),
  },
  {
    label: 'Combine Scores',
    icon: 'pi pi-chart-bar',
    command: () => router.push('/combine-scores'),
  },
  {
    label: 'Schedules',
    icon: 'pi pi-calendar',
    command: () => router.push('/schedules'),
  },
  {
    label: 'Player Awards',
    icon: 'pi pi-trophy',
    command: () => router.push('/player-awards'),
  },
  {
    label: 'Player Teams',
    icon: 'pi pi-users',
    command: () => router.push('/player-teams'),
  },  
  {
    label: 'Team Needs',
    icon: 'pi pi-exclamation-triangle',
    command: () => router.push('/team-needs'),
  },
  {
    label: 'Post Season Results',
    icon: 'pi pi-crown',
    command: () => router.push('/post-season-results'),
  },
  {
    label: 'Draft Menu',
    icon: 'pi pi-folder',
    styleClass: 'green-icon',
    items: [
      {
        label: 'Draft Tracker',
        icon: 'pi pi-stopwatch',
        styleClass: 'green-icon',
        command: () => goToPage('draft'),
        to: { name: 'draft' }
      },
      {
        label: 'Track Draft',
        icon: 'pi pi-stopwatch',
        styleClass: 'green-icon',
        command: () => ('draft-tracker'),
        to: { name: 'draft-tracker' }
      }
    ]
  },
])
</script>

<template>
  <nav class="app-navigation">
    <Menu :model="menuItems" class="nav-menu" />
  </nav>
</template>

<style scoped>
.app-navigation {
  width: 250px;
  color: var(--text-secondary);
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  padding: 1rem;
  
}

:deep(.nav-menu) {
  border: none;
  background: transparent;
}

:deep(.nav-menu .p-menuitem-link) {
  color: var(--text-secondary);
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

:deep(.nav-menu .p-menuitem-link:hover) {
  background-color: rgba(120, 0, 0, 0.1);

}

:deep(.nav-menu .p-menuitem-icon) {
  color: var(--text-secondary);
}
</style>