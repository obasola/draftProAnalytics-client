<template>
  <Card v-if="row">
    <template #title>{{ row.playerName }}</template>
    <template #subtitle>{{ row.positionGroup }} • {{ row.scoreLabel }}</template>
    <template #content>
      <div class="detail-grid">
        <div><strong>Base:</strong> {{ row.baseScore }}</div>
        <div><strong>Enhanced:</strong> {{ row.enhancedScore }}</div>
        <div><strong>Decision View:</strong> {{ row.decisionViewScore }}</div>
        <div><strong>Coachability:</strong> {{ row.decisionViewDimensions.coachability }}</div>
        <div><strong>RFA:</strong> {{ row.decisionViewDimensions.rfa }}</div>
        <div><strong>RVA:</strong> {{ row.decisionViewDimensions.rva }}</div>
      </div>

      <p v-if="row.evaluationNotes">{{ row.evaluationNotes }}</p>

      <Button
        label="Show Score Explanation"
        icon="pi pi-info-circle"
        @click="$emit('show-explanation', row.prospectId)"
      />
    </template>
  </Card>

  <Message v-else severity="warn" :closable="false">
    Select a prospect to view detail.
  </Message>
</template>

<script setup lang="ts">
import Button from 'primevue/button';
import Card from 'primevue/card';
import Message from 'primevue/message';
import type { B4MeEvaluationRow } from '../types/b4meAnalysis';

defineProps<{
  row: B4MeEvaluationRow | null;
}>();

defineEmits<{
  (event: 'show-explanation', prospectId: string): void;
}>();
</script>

<style scoped>
.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}
</style>
