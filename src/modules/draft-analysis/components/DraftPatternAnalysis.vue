<!-- src/modules/draft-analysis/components/DraftPatternAnalysis.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useDraftPattern } from '../composables/useDraftPattern';
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import ProgressBar from 'primevue/progressbar';
import Button from 'primevue/button';
import Message from 'primevue/message';

interface Props {
  teamId: string;
}

const props = defineProps<Props>();

const {
  pattern,
  loading,
  error,
  sortedMetrics,
  bestPositions,
  worstPositions,
  loadPattern,
  getCompetencySeverity,
  formatSuccessRate,
  getPositionIcon
} = useDraftPattern();

onMounted(async () => {
  await loadPattern(props.teamId);
});
</script>

<template>
  <div class="draft-pattern-analysis">
    <Message v-if="error" severity="error" :closable="false">
      {{ error }}
    </Message>

    <div v-if="loading" class="loading-container">
      <ProgressBar mode="indeterminate" />
    </div>

    <template v-else-if="pattern">
      <!-- Header Card -->
      <Card class="mb-4">
        <template #title>
          Draft Pattern Analysis: {{ pattern.generalManager }} Era
        </template>
        <template #subtitle>
          {{ pattern.regimeStartYear }} - {{ pattern.regimeEndYear || 'Present' }} | 
          Head Coach: {{ pattern.headCoach }}
        </template>
        <template #content>
          <div class="grid">
            <div class="col-12 md:col-3">
              <div class="stat-card">
                <div class="stat-label">Overall Success Rate</div>
                <div class="stat-value">{{ formatSuccessRate(pattern.overallSuccessRate) }}</div>
              </div>
            </div>
            <div class="col-12 md:col-3">
              <div class="stat-card">
                <div class="stat-label">Total Picks Analyzed</div>
                <div class="stat-value">{{ pattern.totalPicksAnalyzed }}</div>
              </div>
            </div>
            <div class="col-12 md:col-3">
              <div class="stat-card">
                <div class="stat-label">Best Positions</div>
                <div class="stat-value">
                  <Tag 
                    v-for="pos in bestPositions" 
                    :key="pos" 
                    :value="pos" 
                    severity="success"
                    class="mr-1"
                  />
                </div>
              </div>
            </div>
            <div class="col-12 md:col-3">
              <div class="stat-card">
                <div class="stat-label">Worst Positions</div>
                <div class="stat-value">
                  <Tag 
                    v-for="pos in worstPositions" 
                    :key="pos" 
                    :value="pos" 
                    severity="danger"
                    class="mr-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Position Metrics Table -->
      <Card>
        <template #title>Position Group Performance</template>
        <template #content>
          <DataTable 
            :value="sortedMetrics" 
            :paginator="false"
            responsiveLayout="scroll"
          >
            <Column field="position" header="Position">
              <template #body="{ data }">
                <i :class="['pi', getPositionIcon(data.position), 'mr-2']"></i>
                {{ data.position }}
              </template>
            </Column>

            <Column field="totalPicks" header="Total Picks" />

            <Column field="successRate" header="Success Rate">
              <template #body="{ data }">
                <div class="flex align-items-center">
                  <ProgressBar 
                    :value="data.successRate" 
                    :showValue="false"
                    class="flex-1 mr-2"
                    style="height: 8px;"
                  />
                  <span>{{ formatSuccessRate(data.successRate) }}</span>
                </div>
              </template>
            </Column>

            <Column field="competency" header="Competency">
              <template #body="{ data }">
                <Tag 
                  :value="data.competency" 
                  :severity="getCompetencySeverity(data.competency)"
                />
              </template>
            </Column>

            <Column field="averageRound" header="Avg Round">
              <template #body="{ data }">
                {{ data.averageRound.toFixed(1) }}
              </template>
            </Column>

            <Column field="preferredRounds" header="Preferred Rounds">
              <template #body="{ data }">
                <Tag 
                  v-for="round in data.preferredRounds" 
                  :key="round" 
                  :value="`R${round}`"
                  severity="info"
                  class="mr-1"
                />
              </template>
            </Column>

            <Column field="systemFitBias" header="System Bias">
              <template #body="{ data }">
                <Tag 
                  v-if="data.systemFitBias" 
                  value="Yes" 
                  severity="warning"
                  icon="pi pi-exclamation-triangle"
                />
                <span v-else class="text-500">No</span>
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </template>
  </div>
</template>

<style scoped>
.draft-pattern-analysis {
  padding: 1rem;
}

.loading-container {
  padding: 2rem;
}

.stat-card {
  text-align: center;
  padding: 1rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary-color);
}
</style>