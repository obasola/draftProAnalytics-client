<template>
  <Card v-if="teamContext">
    <template #title>Future Team Context</template>
    <template #subtitle>{{ teamContext.label }}</template>
    <template #content>
      <div class="placeholder-grid">
        <div><strong>Coaching Grade by Group:</strong> {{ teamContext.teamCoachingGradeByGroup ?? 'Deferred' }}</div>
        <div><strong>Development Environment:</strong> {{ teamContext.teamDevelopmentEnvironment ?? 'Deferred' }}</div>
        <div><strong>Usage Fit Context:</strong> {{ teamContext.teamUsageFitContext ?? 'Deferred' }}</div>
        <div><strong>Applied:</strong> {{ teamContext.isApplied ? 'Yes' : 'No' }}</div>
      </div>
      <Message severity="info" :closable="false">
        This panel is a deferred-ready placeholder. Team context is not mutating the canonical B4Me framework by default.
      </Message>
    </template>
  </Card>
</template>

<script setup lang="ts">
import Card from 'primevue/card';
import Message from 'primevue/message';
import type { B4MeOptionalTeamContext } from '../types/b4meAnalysis';

defineProps<{
  teamContext: B4MeOptionalTeamContext | null;
}>();
</script>

<style scoped>
.placeholder-grid {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
</style>
