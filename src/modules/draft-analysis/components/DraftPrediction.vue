<!-- src/modules/draft-analysis/components/DraftPrediction.vue -->
<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useDraftAnalysisStore } from '../stores/draft-analysis.store';
import { useDraftPattern } from '../composables/useDraftPattern';
import { PositionGroup } from '../types/analyze-pattern.types';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import Tag from 'primevue/tag';
import ProgressBar from 'primevue/progressbar';
import Message from 'primevue/message';
import type { PositionPredictionDto } from '../types/predict-selection.types';

interface Props {
  teamId: string;
}

const props = defineProps<Props>();

const store = useDraftAnalysisStore();
const { getPositionIcon } = useDraftPattern();

const year = ref<number>(2026);
const round = ref<number>(1);
const pick = ref<number>(1);

const years = [2024, 2025, 2026, 2027];
const rounds = [1, 2, 3, 4, 5, 6, 7];
const picks = Array.from({ length: 32 }, (_: unknown, i: number) => i + 1);

// Watch for teamId changes from parent and optionally re-fetch predictions
watch(() => props.teamId, (newTeamId) => {
  // If there's a current prediction, you might want to clear it or re-fetch
  // This depends on your business logic
  console.log('Team changed to:', newTeamId);
  // Optionally: store.clearCurrentPrediction();
}, { immediate: true });

async function handlePredict(): Promise<void> {
  await store.predictDraftSelection(
    props.teamId, // Using teamId from parent component
    year.value,
    round.value,
    pick.value
  );
}

function getConfidenceSeverity(confidence: string): 'success' | 'warning' | 'danger' | 'info' | 'secondary' {
  switch (confidence) {
    case 'High': return 'success';
    case 'Medium': return 'warning';
    case 'Low': return 'danger';
    default: return 'secondary';
  }
}

function getProbabilityColor(probability: number): string {
  if (probability >= 50) return '#22c55e';
  if (probability >= 30) return '#3b82f6';
  if (probability >= 15) return '#eab308';
  return '#6b7280';
}

// Convert string position to PositionGroup enum
function getPositionGroupFromString(position: string): PositionGroup {
  // Map common position strings to PositionGroup enum
  const positionMap: Record<string, PositionGroup> = {
    'QB': PositionGroup.QUARTERBACK,
    'OL': PositionGroup.OFFENSIVE_LINE,
    'DL': PositionGroup.DEFENSIVE_LINE,
    'WR': PositionGroup.WIDE_RECEIVER,
    'RB': PositionGroup.RUNNING_BACK,
    'TE': PositionGroup.TIGHT_END,
    'LB': PositionGroup.LINEBACKER,
    'DB': PositionGroup.DEFENSIVE_BACK,
    'ST': PositionGroup.SPECIAL_TEAMS
  };

  return positionMap[position] || PositionGroup.OFFENSIVE_LINE;
}

const topThreePredictions = computed(() => {
  if (!store.currentPrediction) return [];
  return store.currentPrediction.predictions.slice(0, 3);
});
</script>

<template>
  <div class="draft-prediction">
    <Card>
      <template #title>
        <div class="flex justify-content-between align-items-center">
          <span>Draft Selection Prediction</span>
          <Tag :value="teamId" severity="info" />
        </div>
      </template>
      <template #content>
        <Message v-if="store.error" severity="error" :closable="false">
          {{ store.error }}
        </Message>

        <!-- Input Form -->
        <div class="grid mb-4">
          <div class="col-12 md:col-4">
            <label for="year" class="block mb-2">Year</label>
            <Dropdown 
              id="year"
              v-model="year"
              :options="years"
              placeholder="Select Year"
              class="w-full"
            />
          </div>
          <div class="col-12 md:col-4">
            <label for="round" class="block mb-2">Round</label>
            <Dropdown 
              id="round"
              v-model="round"
              :options="rounds"
              placeholder="Select Round"
              class="w-full"
            />
          </div>
          <div class="col-12 md:col-4">
            <label for="pick" class="block mb-2">Pick</label>
            <Dropdown 
              id="pick"
              v-model="pick"
              :options="picks"
              placeholder="Select Pick"
              class="w-full"
            />
          </div>
        </div>

        <Button 
          label="Predict Selection" 
          icon="pi pi-compass"
          @click="handlePredict"
          :loading="store.loading"
          class="mb-4"
        />

        <!-- Results -->
        <div v-if="store.currentPrediction" class="prediction-results">
          <!-- Most Likely Position -->
          <div class="mb-4 p-3 surface-ground border-round">
            <h3 class="mt-0 mb-3">Most Likely Selection</h3>
            <div class="flex align-items-center gap-3">
              <i 
                v-if="store.currentPrediction.mostLikelyPosition"
                :class="getPositionIcon(getPositionGroupFromString(store.currentPrediction.mostLikelyPosition))" 
                class="text-4xl text-primary"
              ></i>
              <div>
                <div class="text-2xl font-bold">
                  {{ store.currentPrediction.mostLikelyPosition }}
                </div>
                <Tag 
                  :value="topThreePredictions[0]?.confidenceLevel || 'Medium'"
                  :severity="getConfidenceSeverity(topThreePredictions[0]?.confidenceLevel || 'Medium')"
                />
              </div>
            </div>
          </div>

          <!-- Top 3 Predictions -->
          <div class="mb-4">
            <h4 class="mt-0 mb-3">Top Position Predictions</h4>
            <div 
              v-for="(prediction, index) in topThreePredictions" 
              :key="prediction.position"
              class="mb-3"
            >
              <div class="flex justify-content-between align-items-center mb-2">
                <div class="flex align-items-center gap-2">
                  <i :class="getPositionIcon(getPositionGroupFromString(prediction.position))"></i>
                  <span class="font-semibold">{{ prediction.position }}</span>
                </div>
                <span class="font-semibold">{{ prediction.probability.toFixed(1) }}%</span>
              </div>
              <ProgressBar 
                :value="prediction.probability"
                :showValue="false"
                style="height: 8px;"
              />
              <p class="text-sm text-color-secondary mt-2 mb-0">
                {{ prediction.reasoning[0] }}
              </p>
            </div>
          </div>

          <!-- Additional Context -->
          <div class="grid">
            <div class="col-12 md:col-6">
              <div class="p-3 surface-ground border-round">
                <div class="text-sm text-color-secondary mb-1">Team Need Score</div>
                <div class="text-xl font-bold">
                  {{ topThreePredictions[0]?.teamNeedScore.toFixed(0) || 0 }}
                </div>
              </div>
            </div>
            <div class="col-12 md:col-6">
              <div class="p-3 surface-ground border-round">
                <div class="text-sm text-color-secondary mb-1">Historical Tendency</div>
                <div class="text-xl font-bold">
                  {{ topThreePredictions[0]?.historicalTendencyScore.toFixed(0) || 0 }}
                </div>
              </div>
            </div>
          </div>

          <!-- Draft Strategy -->
          <div class="mt-4 p-3 border-1 surface-border border-round">
            <div class="text-sm text-color-secondary mb-1">Draft Strategy</div>
            <Tag 
              :value="store.currentPrediction.draftStrategy"
              :severity="store.currentPrediction.draftStrategy === 'BPA' ? 'info' : 'warning'"
              class="text-lg"
            />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.draft-prediction {
  padding: 1rem;
}

.prediction-results {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>