<!-- src/modules/draft-analysis/components/GradeCard.vue -->
<script setup lang="ts">
import { computed } from 'vue';
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import ProgressBar from 'primevue/progressbar';
import { useDraftGrading } from '../composables/useDraftGrading';

interface Props {
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  score: number;
  playerName: string;
  position: string;
  college?: string;
  warnings?: string[];
  reasoning?: string[];
  expectedSuccess?: number;
}

const props = defineProps<Props>();

const { getGradeSeverity, getGradeColor, getSuccessColor } = useDraftGrading();

const gradeColorStyle = computed(() => ({
  borderLeftColor: getGradeColor(props.grade),
  borderLeftWidth: '4px',
  borderLeftStyle: 'solid'
}));

const successColorStyle = computed(() => {
  if (!props.expectedSuccess) return {};
  return {
    color: getSuccessColor(props.expectedSuccess)
  };
});
</script>

<template>
  <Card class="grade-card" :style="gradeColorStyle">
    <template #content>
      <!-- Header Section -->
      <div class="flex justify-content-between align-items-start mb-3">
        <div>
          <h3 class="m-0 mb-1">{{ playerName }}</h3>
          <p class="text-color-secondary m-0 mb-1">
            {{ position }}
            <span v-if="college"> • {{ college }}</span>
          </p>
        </div>
        <Tag 
          :value="grade"
          :severity="getGradeSeverity(grade)"
          class="text-2xl px-3 py-2"
        />
      </div>

      <!-- Score Progress Bar -->
      <div class="mb-3">
        <div class="flex justify-content-between mb-2">
          <span class="text-sm font-semibold">Grade Score</span>
          <span class="text-sm font-semibold">{{ score.toFixed(0) }}/100</span>
        </div>
        <ProgressBar 
          :value="score"
          :showValue="false"
          style="height: 12px;"
        >
          <template #value="slotProps: { value: number }">
            <div 
              :style="{
                width: slotProps.value + '%',
                height: '100%',
                backgroundColor: getGradeColor(grade),
                transition: 'width 0.3s ease'
              }"
            ></div>
          </template>
        </ProgressBar>
      </div>

      <!-- Expected Success (if provided) -->
      <div v-if="expectedSuccess !== undefined" class="mb-3">
        <div class="flex justify-content-between align-items-center">
          <span class="text-sm">Expected Success Rate</span>
          <span 
            class="text-sm font-semibold"
            :style="successColorStyle"
          >
            {{ expectedSuccess.toFixed(1) }}%
          </span>
        </div>
      </div>

      <!-- Reasoning (if provided) -->
      <div v-if="reasoning && reasoning.length > 0" class="mb-3">
        <h4 class="text-sm mb-2 font-semibold flex align-items-center">
          <i class="pi pi-info-circle mr-2 text-blue-500"></i>
          Analysis
        </h4>
        <ul class="reasoning-list pl-3 m-0">
          <li 
            v-for="(reason, index) in reasoning"
            :key="index"
            class="text-sm mb-1"
          >
            {{ reason }}
          </li>
        </ul>
      </div>

      <!-- Warnings (if any) -->
      <div v-if="warnings && warnings.length > 0" class="warnings">
        <h4 class="text-sm mb-2 font-semibold flex align-items-center">
          <i class="pi pi-exclamation-triangle mr-2 text-orange-500"></i>
          Warnings
        </h4>
        <ul class="warning-list pl-3 m-0">
          <li 
            v-for="(warning, index) in warnings"
            :key="index"
            class="text-sm text-orange-700 mb-1"
          >
            {{ warning }}
          </li>
        </ul>
      </div>
    </template>
  </Card>
</template>

<style scoped>
.grade-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.grade-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.reasoning-list,
.warning-list {
  list-style: none;
}

.reasoning-list li::before {
  content: '•';
  color: var(--blue-500);
  font-weight: bold;
  display: inline-block;
  width: 1em;
  margin-left: -1em;
}

.warning-list li::before {
  content: '⚠';
  font-weight: bold;
  display: inline-block;
  width: 1em;
  margin-left: -1em;
}
</style>