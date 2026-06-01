<template>
  <Accordion :multiple="true" v-if="methodology">
    <AccordionTab header="Framework Metadata">
      <div class="meta-grid">
        <div><strong>Version:</strong> {{ methodology.frameworkVersion }}</div>
        <div><strong>Framework Type:</strong> {{ methodology.positionGroupFrameworkType }}</div>
        <div><strong>Lineage:</strong> {{ methodology.methodologyLineage }}</div>
        <div><strong>Validation:</strong> {{ methodology.validationStatus }}</div>
        <div><strong>Scoring Mode:</strong> {{ methodology.scoringModeUsed }}</div>
      </div>
      <p v-if="methodology.validationNote">{{ methodology.validationNote }}</p>
    </AccordionTab>

    <AccordionTab
      v-for="section in methodology.methodologySections"
      :key="section.key"
      :header="section.title"
    >
      <p>{{ section.body }}</p>
    </AccordionTab>

    <AccordionTab header="Known Limitations">
      <ul class="limitation-list">
        <li v-for="item in methodology.knownLimitations" :key="item">{{ item }}</li>
      </ul>
      <p v-if="methodology.knownLimitations.length === 0">No limitations were returned.</p>
    </AccordionTab>
  </Accordion>
</template>

<script setup lang="ts">
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import type { B4MeMethodologyMetadata } from '../types/b4meAnalysis';

defineProps<{
  methodology: B4MeMethodologyMetadata | null;
}>();
</script>

<style scoped>
.meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.limitation-list {
  margin: 0;
  padding-left: 1.25rem;
}
</style>
