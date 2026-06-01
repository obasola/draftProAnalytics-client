<template>
  <div class="badge-row" v-if="badges.length > 0">
    <Tag
      v-for="badge in badges"
      :key="badge"
      :value="badge"
      severity="secondary"
      rounded
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Tag from 'primevue/tag';
import type { B4MeActiveFilterSummary } from '../types/b4meAnalysis';

const props = defineProps<{
  summary: B4MeActiveFilterSummary | null;
}>();

const badges = computed<string[]>(() => props.summary?.badges ?? []);
</script>

<style scoped>
.badge-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>
