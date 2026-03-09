<!-- src/modules/draft-analysis/components/PositionCompetencyBadge.vue -->
<script setup lang="ts">
import Tag from 'primevue/tag';

interface Props {
  competency: 'Elite' | 'Good' | 'Average' | 'Poor' | 'Terrible';
  successRate: number;
}

const props = defineProps<Props>();

function getSeverity(competency: string) {
  switch (competency) {
    case 'Elite': return 'success';
    case 'Good': return 'info';
    case 'Average': return 'warning';
    case 'Poor': return 'danger';
    case 'Terrible': return 'danger';
    default: return 'secondary';
  }
}
</script>

<template>
  <div class="position-competency-badge">
    <Tag 
      :value="`${competency} (${successRate.toFixed(1)}%)`"
      :severity="getSeverity(competency)"
    />
  </div>
</template>