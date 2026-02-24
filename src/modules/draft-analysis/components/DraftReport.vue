<!-- src/modules/draft-analysis/components/DraftReport.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useDraftAnalysisStore } from '../stores/draft-analysis.store';
import { useDraftGrading } from '../composables/useDraftGrading';
import Card from 'primevue/card';
import Chart from 'primevue/chart';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import ProgressBar from 'primevue/progressbar';
import Message from 'primevue/message';

interface Props {
  teamId: string;
  year: number;
}

const props = defineProps<Props>();

const store = useDraftAnalysisStore();
const { getGradeSeverity, getGradeColor } = useDraftGrading();

onMounted(async () => {
  await store.loadDraftReport(props.teamId, props.year);
});

const positionChartData = computed(() => {
  if (!store.currentReport) return null;

  const positions = store.currentReport.positionBreakdown.map(p => p.position);
  const counts = store.currentReport.positionBreakdown.map(p => p.count);
  const avgGrades = store.currentReport.positionBreakdown.map(p => p.averageGrade);

  return {
    labels: positions,
    datasets: [
      {
        label: 'Number of Picks',
        data: counts,
        backgroundColor: '#3b82f6',
        yAxisID: 'y'
      },
      {
        label: 'Average Grade',
        data: avgGrades,
        backgroundColor: '#22c55e',
        yAxisID: 'y1'
      }
    ]
  };
});

const positionChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top'
    }
  },
  scales: {
    y: {
      type: 'linear',
      display: true,
      position: 'left',
      beginAtZero: true,
      title: {
        display: true,
        text: 'Number of Picks'
      }
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',
      beginAtZero: true,
      max: 100,
      title: {
        display: true,
        text: 'Average Grade'
      },
      grid: {
        drawOnChartArea: false
      }
    }
  }
};

const gradeDistributionData = computed(() => {
  if (!store.currentReport) return null;

  const gradeCounts: Record<string, number> = {
    'A+': 0,
    'A': 0,
    'B': 0,
    'C': 0,
    'D': 0,
    'F': 0
  };

  store.currentReport.picks.forEach(pick => {
    gradeCounts[pick.grade]++;
  });

  return {
    labels: Object.keys(gradeCounts),
    datasets: [
      {
        data: Object.values(gradeCounts),
        backgroundColor: [
          '#22c55e',
          '#22c55e',
          '#3b82f6',
          '#eab308',
          '#f97316',
          '#ef4444'
        ]
      }
    ]
  };
});

const gradeDistributionOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom'
    }
  }
};

function exportReport() {
  // Implementation for exporting report as PDF or CSV
  console.log('Export report');
}
</script>

<template>
  <div class="draft-report">
    <Message v-if="store.error" severity="error" :closable="false">
      {{ store.error }}
    </Message>

    <div v-if="store.loading" class="loading-container">
      <ProgressBar mode="indeterminate" />
    </div>

    <template v-else-if="store.currentReport">
      <!-- Header Card -->
      <Card class="mb-4">
        <template #title>
          {{ props.year }} Draft Report
        </template>
        <template #content>
          <div class="grid">
            <div class="col-12 md:col-3">
              <div class="stat-card">
                <div class="stat-label">Overall Grade</div>
                <div class="stat-value">
                  <Tag 
                    :value="store.currentReport.overallGrade"
                    :severity="getGradeSeverity(store.currentReport.overallGrade)"
                    class="text-2xl"
                  />
                </div>
              </div>
            </div>
            <div class="col-12 md:col-3">
              <div class="stat-card">
                <div class="stat-label">Average Score</div>
                <div class="stat-value">
                  {{ store.currentReport.averagePickGrade.toFixed(1) }}
                </div>
              </div>
            </div>
            <div class="col-12 md:col-3">
              <div class="stat-card">
                <div class="stat-label">Total Picks</div>
                <div class="stat-value">
                  {{ store.currentReport.totalPicks }}
                </div>
              </div>
            </div>
            <div class="col-12 md:col-3">
              <div class="stat-card">
                <div class="stat-label">Percentile</div>
                <div class="stat-value">
                  {{ store.currentReport.historicalComparison.percentile }}th
                  <i 
                    v-if="store.currentReport.historicalComparison.betterThanAverage"
                    class="pi pi-arrow-up text-green-500 ml-2"
                  ></i>
                  <i 
                    v-else
                    class="pi pi-arrow-down text-red-500 ml-2"
                  ></i>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-content-end mt-3">
            <Button 
              label="Export Report" 
              icon="pi pi-download"
              @click="exportReport"
              outlined
            />
          </div>
        </template>
      </Card>

      <div class="grid">
        <!-- Strengths & Concerns -->
        <div class="col-12 md:col-6">
          <Card class="h-full">
            <template #title>Strengths</template>
            <template #content>
              <ul v-if="store.currentReport.strengths.length > 0" class="strength-list">
                <li 
                  v-for="(strength, index) in store.currentReport.strengths" 
                  :key="index"
                  class="flex align-items-start mb-2"
                >
                  <i class="pi pi-check-circle text-green-500 mr-2 mt-1"></i>
                  <span>{{ strength }}</span>
                </li>
              </ul>
              <p v-else class="text-color-secondary">No notable strengths identified</p>
            </template>
          </Card>
        </div>

        <div class="col-12 md:col-6">
          <Card class="h-full">
            <template #title>Concerns</template>
            <template #content>
              <ul v-if="store.currentReport.concerns.length > 0" class="concern-list">
                <li 
                  v-for="(concern, index) in store.currentReport.concerns" 
                  :key="index"
                  class="flex align-items-start mb-2"
                >
                  <i class="pi pi-exclamation-triangle text-orange-500 mr-2 mt-1"></i>
                  <span>{{ concern }}</span>
                </li>
              </ul>
              <p v-else class="text-color-secondary">No major concerns identified</p>
            </template>
          </Card>
        </div>

        <!-- Charts -->
        <div class="col-12 md:col-8">
          <Card>
            <template #title>Position Breakdown</template>
            <template #content>
              <Chart 
                v-if="positionChartData"
                type="bar" 
                :data="positionChartData"
                :options="positionChartOptions"
                style="height: 300px;"
              />
            </template>
          </Card>
        </div>

        <div class="col-12 md:col-4">
          <Card>
            <template #title>Grade Distribution</template>
            <template #content>
              <Chart 
              v-if="gradeDistributionData"
                type="doughnut" 
                :data="gradeDistributionData"
                :options="gradeDistributionOptions"
                style="height: 300px;"
              />
            </template>
          </Card>
        </div>

        <!-- Picks Table -->
        <div class="col-12">
          <Card>
            <template #title>All Picks</template>
            <template #content>
              <DataTable 
                :value="store.currentReport.picks"
                responsiveLayout="scroll"
                :paginator="true"
                :rows="10"
              >
                <Column field="round" header="Round" sortable style="width: 100px">
                  <template #body="{ data }">
                    R{{ data.round }}
                  </template>
                </Column>

                <Column field="pick" header="Pick" sortable style="width: 100px">
                  <template #body="{ data }">
                    #{{ data.pick }}
                  </template>
                </Column>

                <Column field="playerName" header="Player" sortable />

                <Column field="position" header="Position" sortable style="width: 120px">
                  <template #body="{ data }">
                    <Tag :value="data.position" />
                  </template>
                </Column>

                <Column field="grade" header="Grade" sortable style="width: 120px">
                  <template #body="{ data }">
                    <Tag 
                      :value="data.grade"
                      :severity="getGradeSeverity(data.grade)"
                    />
                  </template>
                </Column>

                <Column field="score" header="Score" sortable style="width: 150px">
                  <template #body="{ data }: { data: { grade: string; score: number } }">
                    <div class="flex align-items-center">
                      <ProgressBar 
                        :value="data.score"
                        :showValue="false"
                        style="height: 8px; flex: 1;"
                        class="mr-2"
                      />
                      <span class="text-sm">{{ data.score.toFixed(0) }}</span>
                    </div>
                  </template>
                </Column>
              </DataTable>
            </template>
          </Card>
        </div>
      </div>
    </template>

    <Card v-else>
      <template #content>
        <div class="text-center p-4">
          <i class="pi pi-file text-4xl text-color-secondary mb-3"></i>
          <p class="text-color-secondary">No report data available</p>
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.draft-report {
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.strength-list,
.concern-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
</style>