<!-- components/TeamSelector.vue -->
<template>
  <div class="team-selector">
    <Dropdown
      v-model="selectedTeamId"
      :options="teamOptions"
      option-label="label"
      option-value="value"
      placeholder="Select Your Team"
      class="w-full"
      @change="handleTeamChange"
    >
      <template #value="{ value, placeholder }">
        <div v-if="value" class="flex items-center gap-2">
          <div 
            class="w-4 h-4 rounded-full"
            :style="{ backgroundColor: getTeamPrimaryColor(value) }"
          ></div>
          <span>{{ getTeamName(value) }}</span>
        </div>
        <span v-else>{{ placeholder }}</span>
      </template>
      
      <template #option="{ option }">
        <div class="flex items-center gap-2 p-2">
          <div 
            class="w-4 h-4 rounded-full"
            :style="{ backgroundColor: option.primaryColor }"
          ></div>
          <span>{{ option.label }}</span>
        </div>
      </template>
    </Dropdown>
    
    <Button
      v-if="currentTeam"
      @click="resetTeam"
      severity="secondary"
      size="small"
      class="mt-2"
    >
      Reset to Default
    </Button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useThemeStore } from '@/stores/theme.store';
import type { TeamId } from '@/types/team.types';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';

// Props
interface Props {
  groupByDivision?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  groupByDivision: false,
});

// Store
const themeStore = useThemeStore();

// State
const selectedTeamId = ref<TeamId | null>(null);

// Computed
const { teams, currentTeam, teamsByDivision } = storeToRefs(themeStore);

const teamOptions = computed(() => {
  if (props.groupByDivision) {
    return Object.entries(teamsByDivision.value).map(([division, divisionTeams]) => ({
      label: division,
      items: divisionTeams.map(team => ({
        label: team.name,
        value: team.id,
        primaryColor: team.colors.primary,
      })),
    }));
  }

  return teams.value.map(team => ({
    label: team.name,
    value: team.id,
    primaryColor: team.colors.primary,
  }));
});

// Methods
const handleTeamChange = async (event: { value: TeamId }): Promise<void> => {
  if (event.value) {
    try {
      await themeStore.selectTeam(event.value);
    } catch (error) {
      console.error('Failed to change team:', error);
    }
  }
};

const resetTeam = (): void => {
  themeStore.resetTheme();
  selectedTeamId.value = null;
};

const getTeamPrimaryColor = (teamId: TeamId): string => {
  const team = teams.value.find(t => t.id === teamId);
  return team?.colors.primary || '#013369';
};

const getTeamName = (teamId: TeamId): string => {
  const team = teams.value.find(t => t.id === teamId);
  return team?.name || '';
};

// Lifecycle
onMounted(async () => {
  await themeStore.initializeTheme();
  selectedTeamId.value = currentTeam.value?.id || null;
});

// Watch for external team changes
watch(currentTeam, (newTeam) => {
  selectedTeamId.value = newTeam?.id || null;
});
</script>

<style scoped>
.team-selector {
  @apply min-w-64;
}
</style>







<!-- App.vue usage example -->
<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Header with team colors -->
    <header class="bg-team-primary text-team-accent shadow-lg">
      <div class="container mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold">NFL App</h1>
          <TeamSelector />
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TeamCard
          v-for="team in teams"
          :key="team.id"
          :team="team"
        />
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-team-secondary text-team-accent py-8">
      <div class="container mx-auto px-4 text-center">
        <p>&copy; 2025 NFL App. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useThemeStore } from '@/stores/theme.store';
import TeamSelector from '@/components/TeamSelector.vue';
import TeamCard from '@/components/TeamCard.vue';

// Store
const themeStore = useThemeStore();
const { teams } = storeToRefs(themeStore);

// Lifecycle
onMounted(async () => {
  await themeStore.initializeTheme();
});
</script>

<style>
/* Global CSS Variables */
:root {
  /* Default NFL Colors */
  --team-primary: #013369;
  --team-secondary: #D50A0A;
  --team-accent: #FFFFFF;
  
  /* Semantic color mappings */
  --color-primary: var(--team-primary);
  --color-secondary: var(--team-secondary);
  --color-accent: var(--team-accent);
  
  /* Component-specific mappings */
  --header-bg: var(--team-primary);
  --button-primary-bg: var(--team-primary);
  --button-secondary-bg: var(--team-secondary);
  --accent-text: var(--team-accent);
  
  /* Neutral colors that don't change */
  --color-neutral-50: #f9fafb;
  --color-neutral-100: #f3f4f6;
  --color-neutral-200: #e5e7eb;
  --color-neutral-300: #d1d5db;
  --color-neutral-400: #9ca3af;
  --color-neutral-500: #6b7280;
  --color-neutral-600: #4b5563;
  --color-neutral-700: #374151;
  --color-neutral-800: #1f2937;
  --color-neutral-900: #111827;
}

/* Team-aware utility classes */
.bg-team-primary {
  background-color: var(--team-primary);
}

.bg-team-secondary {
  background-color: var(--team-secondary);
}

.text-team-primary {
  color: var(--team-primary);
}

.text-team-secondary {
  color: var(--team-secondary);
}

.text-team-accent {
  color: var(--team-accent);
}

.border-team-primary {
  border-color: var(--team-primary);
}

.border-team-secondary {
  border-color: var(--team-secondary);
}

/* Smooth transitions for color changes */
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

/* PrimeVue component overrides */
.p-dropdown {
  --p-dropdown-background: white;
  --p-dropdown-border-color: var(--team-primary);
  --p-dropdown-focus-border-color: var(--team-secondary);
}

.p-button.p-button-primary {
  --p-button-primary-background: var(--team-primary);
  --p-button-primary-border-color: var(--team-primary);
  --p-button-primary-color: var(--team-accent);
  --p-button-primary-hover-background: var(--team-secondary);
  --p-button-primary-hover-border-color: var(--team-secondary);
}

.p-card {
  --p-card-background: white;
  --p-card-border-color: var(--color-neutral-200);
}
</style>