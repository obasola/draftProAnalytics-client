<!-- src/modules/draft-analysis/views/DraftAnalysisView.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import DraftPatternAnalysis from '../components/DraftPatternAnalysis.vue';
import DraftPrediction from '../components/DraftPrediction.vue';
import LiveDraftTracker from '../components/LiveDraftTracker.vue';
import DraftReport from '../components/DraftReport.vue';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Card from 'primevue/card';
import Dropdown from 'primevue/dropdown';
import { useDraftAnalysisStore } from '../stores/draft-analysis.store';

const route = useRoute();
const store = useDraftAnalysisStore();

const selectedTeamId = ref('KC'); // Default to Kansas City Chiefs
const selectedYear = ref(2026);

const teams = ref([
  { label: 'Kansas City Chiefs', value: 'KC' },
  { label: 'Buffalo Bills', value: 'BUF' },
  { label: 'San Francisco 49ers', value: 'SF' },
  // Add more teams as needed
]);

const years = ref([2024, 2025, 2026, 2027]);

const activeTab = ref(0);

onMounted(() => {
  // Check if teamId is in route params
  if (route.params.teamId) {
    selectedTeamId.value = route.params.teamId as string;
  }
});
</script>

<template>
  <div class="draft-analysis-view">
    <!-- Header -->
    <Card class="mb-4">
      <template #content>
        <div class="flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <h1 class="m-0 mb-2">Draft Analysis System</h1>
            <p class="m-0 text-color-secondary">
              Analyze draft patterns, predict selections, and track live picks
            </p>
          </div>
          <div class="flex gap-2">
            <div>
              <label for="team" class="block mb-2 text-sm">Team</label>
              <Dropdown 
                id="team"
                v-model="selectedTeamId"
                :options="teams"
                optionLabel="label"
                optionValue="value"
                placeholder="Select Team"
                style="width: 200px;"
              />
            </div>
            <div>
              <label for="year" class="block mb-2 text-sm">Year</label>
              <Dropdown 
                id="year"
                v-model="selectedYear"
                :options="years"
                placeholder="Select Year"
                style="width: 120px;"
              />
            </div>
          </div>
        </div>
      </template>
    </Card>

    <!-- Main Content -->
    <Card style="background-color: #062d92">
      <template #content>
        <TabView v-model:activeIndex="activeTab" class="custom-tabview">
          <!-- Pattern Analysis Tab -->
          <TabPanel>
            <template #header>
              <i class="pi pi-chart-bar mr-2"></i>
              <span>Pattern Analysis</span>
            </template>
            <DraftPatternAnalysis :team-id="selectedTeamId" />
          </TabPanel>

          <!-- Prediction Tab -->
          <TabPanel>
            <template #header>
              <i class="pi pi-compass mr-2"></i>
              <span>Draft Prediction</span>
            </template>
            <DraftPrediction :team-id="selectedTeamId" />
          </TabPanel>

          <!-- Live Tracker Tab -->
          <TabPanel>
            <template #header>
              <i class="pi pi-stopwatch mr-2"></i>
              <span>Live Tracker</span>
            </template>
            <LiveDraftTracker 
              :team-id="selectedTeamId"
              :year="selectedYear"
            />
          </TabPanel>

          <!-- Draft Report Tab -->
          <TabPanel>
            <template #header>
              <i class="pi pi-file mr-2"></i>
              <span>Draft Report</span>
            </template>
            <DraftReport 
              :team-id="selectedTeamId"
              :year="selectedYear"
            />
          </TabPanel>
        </TabView>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.draft-analysis-view {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

h1 {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-color);
}

/* Custom TabView Styling */
.custom-tabview :deep(.p-tabview-nav) {
  background-color: #b66e00;
  border-bottom: 2px solid #054dbc;
}

.custom-tabview :deep(.p-tabview-nav li .p-tabview-nav-link) {
  color: #054dbc;
  font-weight: 500;
  background-color: transparent;
}

.custom-tabview :deep(.p-tabview-nav li .p-tabview-nav-link:hover) {
  background-color: rgba(5, 77, 188, 0.1);
  color: #054dbc;
}

.custom-tabview :deep(.p-tabview-nav li.p-highlight .p-tabview-nav-link) {
  color: #054dbc;
  border-color: #054dbc;
  background-color: rgba(5, 77, 188, 0.15);
}

.custom-tabview :deep(.p-tabview-nav li .p-tabview-nav-link:focus) {
  box-shadow: inset 0 0 0 0.2rem rgba(5, 77, 188, 0.2);
}

.custom-tabview :deep(.p-tabview-panels) {
  background-color: transparent;
  padding: 1.25rem 0;
}
</style>