<template>
  <Sidebar v-model:visible="visibleModel" position="right" class="score-drawer">
    <template #header>
      <div class="drawer-header">{{ explanation?.title ?? 'Score explanation' }}</div>
    </template>

    <p>{{ explanation?.summary }}</p>
    <ul v-if="explanation" class="lines">
      <li v-for="line in explanation.lines" :key="line">{{ line }}</li>
    </ul>
  </Sidebar>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Sidebar from 'primevue/sidebar';
import type { B4MeScoreExplanation } from '../types/b4meAnalysis';

const props = defineProps<{
  visible: boolean;
  explanation: B4MeScoreExplanation | null;
}>();

const emit = defineEmits<{
  (event: 'update:visible', value: boolean): void;
}>();

const visibleModel = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value)
});
</script>

<style scoped>
.score-drawer {
  width: 30rem;
}

.drawer-header {
  font-weight: 700;
}

.lines {
  padding-left: 1.25rem;
}
</style>
