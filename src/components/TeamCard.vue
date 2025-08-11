<!-- components/TeamCard.vue -->
<template>
  <Card class="team-card" :class="{ 'is-selected': isSelected }">
    <template #header>
      <div 
        class="team-header"
        :style="{ 
          background: `linear-gradient(135deg, ${team.colors.primary} 0%, ${team.colors.secondary} 100%)`,
          color: team.colors.accent
        }"
      >
        <h3 class="team-name">{{ team.name }}</h3>
        <span class="team-abbreviation">{{ team.abbreviation }}</span>
      </div>
    </template>
    
    <template #content>
      <div class="team-info">
        <div class="division-info">
          <span class="label">Division:</span>
          <span class="value">{{ team.division }}</span>
        </div>
        
        <div class="color-palette">
          <span class="label">Team Colors:</span>
          <div class="color-swatches">
            <div 
              v-for="(color, name) in team.colors" 
              :key="name"
              class="color-swatch"
              :style="{ backgroundColor: color }"
              :title="`${name}: ${color}`"
            ></div>
          </div>
        </div>
      </div>
    </template>
    
    <template #footer>
      <Button
        :label="isSelected ? 'Selected' : 'Select Team'"
        :disabled="isSelected"
        @click="selectTeam"
        class="w-full"
        :style="{
          backgroundColor: isSelected ? team.colors.secondary : team.colors.primary,
          borderColor: isSelected ? team.colors.secondary : team.colors.primary,
          color: team.colors.accent
        }"
      />
    </template>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useThemeStore } from '@/stores/theme.store';
import type { TeamEntity } from '@/types/team.types';
import Card from 'primevue/card';
import Button from 'primevue/button';

// Props
interface Props {
  team: TeamEntity;
}

const props = defineProps<Props>();

// Store
const themeStore = useThemeStore();
const { currentTeam } = storeToRefs(themeStore);

// Computed
const isSelected = computed(() => currentTeam.value?.id === props.team.id);

// Methods
const selectTeam = async (): Promise<void> => {
  try {
    await themeStore.selectTeam(props.team.id);
  } catch (error) {
    console.error('Failed to select team:', error);
  }
};
</script>

<style scoped>
.team-card {
  @apply transition-all duration-200 hover:shadow-lg;
}

.team-card.is-selected {
  @apply ring-2 ring-blue-500 shadow-lg;
}

.team-header {
  @apply p-4 text-center;
}

.team-name {
  @apply text-lg font-bold mb-1;
}

.team-abbreviation {
  @apply text-sm opacity-90;
}

.team-info {
  @apply space-y-3;
}

.division-info {
  @apply flex justify-between items-center;
}

.label {
  @apply text-sm font-medium text-gray-600;
}

.value {
  @apply text-sm text-gray-900;
}

.color-palette {
  @apply space-y-2;
}

.color-swatches {
  @apply flex gap-2;
}

.color-swatch {
  @apply w-6 h-6 rounded border border-gray-300 shadow-sm;
}
</style>
