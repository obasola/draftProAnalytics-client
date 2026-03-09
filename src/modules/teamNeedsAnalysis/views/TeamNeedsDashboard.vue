<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { FilterMatchMode } from 'primevue/api';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputNumber from 'primevue/inputnumber';
import Card from 'primevue/card';
import Badge from 'primevue/badge';
import ProgressBar from 'primevue/progressbar';
import Dialog from 'primevue/dialog';
import { useTeamNeedsAnalysisStore } from '../store/teamNeedsAnalysis.store';
import { getNeedSeverity, getSeverityColor, getSeverityBadgeClass } from '../types/teamNeedsAnalysis.types';
import type { TeamNeedsDataTableRow } from '../types/teamNeedsAnalysis.types';

const router = useRouter();
const toast = useToast();
const store = useTeamNeedsAnalysisStore();

const selectedYear = ref(new Date().getFullYear());
const showGenerateDialog = ref(false);
const generating = ref(false);

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  teamId: { value: null, matchMode: FilterMatchMode.EQUALS },
  overallNeedScore: { value: null, matchMode: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO },
});

const selectedTeams = ref<TeamNeedsDataTableRow[]>([]);

onMounted(async () => {
  await loadData();
});

async function loadData(): Promise<void> {
  try {
    await store.fetchTeamsNeedsDataTable(selectedYear.value);
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load team needs data',
      life: 3000,
    });
  }
}

async function generateAllNeeds(): Promise<void> {
  generating.value = true;
  
  try {
    await store.generateAllTeamsNeeds({
      seasonYear: selectedYear.value,
      forceRefresh: true,
    });
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: `Team needs generated for ${selectedYear.value} season`,
      life: 3000,
    });
    
    showGenerateDialog.value = false;
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to generate team needs',
      life: 3000,
    });
  } finally {
    generating.value = false;
  }
}

function viewTeamDetails(teamId: number): void {
  router.push({
    name: 'team-needs-detail',
    params: { teamId },
    query: { year: selectedYear.value },
  });
}

function getNeedScoreSeverity(score: number): string {
  return getSeverityColor(getNeedSeverity(score));
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const sortedTeams = computed(() => {
  return [...store.allTeamsNeeds].sort((a, b) => b.overallNeedScore - a.overallNeedScore);
});
</script>

<template>
  <div class="p-4">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex justify-between items-center mb-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">NFL Team Draft Needs</h1>
          <p class="text-gray-600 mt-1">Comprehensive analysis of roster needs across the league</p>
        </div>
        <div class="flex gap-3 items-center">
          <InputNumber
            v-model="selectedYear"
            :min="2020"
            :max="2030"
            :step="1"
            showButtons
            buttonLayout="horizontal"
            class="w-32"
            @update:model-value="loadData"
          />
          <Button
            label="Generate Analysis"
            icon="pi pi-refresh"
            severity="success"
            @click="showGenerateDialog = true"
          />
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <Card>
          <template #content>
            <div class="flex justify-between items-center">
              <div>
                <p class="text-gray-500 text-sm font-medium">Total Teams</p>
                <p class="text-2xl font-bold text-gray-800">{{ store.allTeamsNeeds.length }}</p>
              </div>
              <i class="pi pi-users text-3xl text-blue-500"></i>
            </div>
          </template>
        </Card>

        <Card>
          <template #content>
            <div class="flex justify-between items-center">
              <div>
                <p class="text-gray-500 text-sm font-medium">Average Need Score</p>
                <p class="text-2xl font-bold text-gray-800">{{ store.averageNeedScore }}</p>
              </div>
              <i class="pi pi-chart-line text-3xl text-orange-500"></i>
            </div>
          </template>
        </Card>

        <Card>
          <template #content>
            <div class="flex justify-between items-center">
              <div>
                <p class="text-gray-500 text-sm font-medium">Critical Positions</p>
                <p class="text-2xl font-bold text-gray-800">{{ store.criticalNeedsCount }}</p>
              </div>
              <i class="pi pi-exclamation-triangle text-3xl text-red-500"></i>
            </div>
          </template>
        </Card>

        <Card>
          <template #content>
            <div class="flex justify-between items-center">
              <div>
                <p class="text-gray-500 text-sm font-medium">Season</p>
                <p class="text-2xl font-bold text-gray-800">{{ selectedYear }}</p>
              </div>
              <i class="pi pi-calendar text-3xl text-green-500"></i>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <!-- DataTable -->
    <Card>
      <template #content>
        <DataTable
          v-model:selection="selectedTeams"
          v-model:filters="filters"
          :value="sortedTeams"
          :loading="store.loading"
          stripedRows
          paginator
          :rows="10"
          :rowsPerPageOptions="[10, 25, 50]"
          filterDisplay="row"
          :globalFilterFields="['teamId', 'teamName']"
          sortField="overallNeedScore"
          :sortOrder="-1"
          dataKey="teamId"
          class="w-full"
        >
          <template #header>
            <div class="flex justify-between items-center">
              <span class="text-xl font-semibold">Team Draft Needs Analysis</span>
              <span class="text-sm text-gray-600">{{ selectedYear }} Season</span>
            </div>
          </template>

          <template #empty>
            <div class="text-center py-8">
              <i class="pi pi-inbox text-4xl text-gray-400 mb-3"></i>
              <p class="text-gray-600">No team needs data available for {{ selectedYear }}</p>
              <Button
                label="Generate Analysis"
                icon="pi pi-refresh"
                severity="info"
                class="mt-3"
                @click="showGenerateDialog = true"
              />
            </div>
          </template>

          <Column selectionMode="multiple" headerStyle="width: 3rem" />

          <Column field="teamId" header="Team ID" sortable style="min-width: 8rem">
            <template #body="{ data }">
              <span class="font-semibold">{{ data.teamId }}</span>
            </template>
            <template #filter="{ filterModel, filterCallback }">
              <InputNumber
                v-model="filterModel.value"
                @input="filterCallback()"
                placeholder="Search by ID"
                class="w-full"
              />
            </template>
          </Column>

          <Column field="overallNeedScore" header="Overall Need" sortable style="min-width: 12rem">
            <template #body="{ data }">
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2">
                  <span
                    :class="getNeedScoreSeverity(data.overallNeedScore)"
                    class="font-bold text-lg"
                  >
                    {{ data.overallNeedScore }}
                  </span>
                  <Badge
                    :value="getNeedSeverity(data.overallNeedScore).toUpperCase()"
                    :severity="getNeedSeverity(data.overallNeedScore) === 'critical' ? 'danger' : getNeedSeverity(data.overallNeedScore) === 'high' ? 'warning' : 'success'"
                  />
                </div>
                <ProgressBar
                  :value="data.overallNeedScore"
                  :showValue="false"
                  :pt="{
                    value: {
                      style: {
                        background: data.overallNeedScore >= 80 ? '#ef4444' : data.overallNeedScore >= 60 ? '#f97316' : data.overallNeedScore >= 40 ? '#eab308' : '#22c55e'
                      }
                    }
                  }"
                />
              </div>
            </template>
            <template #filter="{ filterModel, filterCallback }">
              <InputNumber
                v-model="filterModel.value"
                @input="filterCallback()"
                placeholder="Min score"
                class="w-full"
              />
            </template>
          </Column>

          <Column field="topNeeds" header="Top Needs" style="min-width: 16rem">
            <template #body="{ data }">
              <div class="flex flex-wrap gap-1">
                <Badge
                  v-for="(need, index) in data.topNeeds.slice(0, 5)"
                  :key="need"
                  :value="need"
                  :severity="index === 0 ? 'danger' : index === 1 ? 'warning' : 'info'"
                  class="text-xs font-medium"
                />
              </div>
            </template>
          </Column>

          <Column field="criticalPositions" header="Critical Positions" sortable style="min-width: 10rem">
            <template #body="{ data }">
              <div class="flex items-center gap-2">
                <Badge
                  :value="data.criticalPositions"
                  :severity="data.criticalPositions >= 3 ? 'danger' : data.criticalPositions >= 1 ? 'warning' : 'success'"
                  class="text-sm"
                />
                <span class="text-gray-600 text-sm">positions</span>
              </div>
            </template>
          </Column>

          <Column field="analysisDate" header="Analysis Date" sortable style="min-width: 10rem">
            <template #body="{ data }">
              <span class="text-sm text-gray-600">{{ formatDate(data.analysisDate) }}</span>
            </template>
          </Column>

          <Column header="Actions" style="min-width: 8rem">
            <template #body="{ data }">
              <Button
                icon="pi pi-eye"
                severity="info"
                text
                rounded
                @click="viewTeamDetails(data.teamId)"
                v-tooltip.top="'View Details'"
              />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Generate Dialog -->
    <Dialog
      v-model:visible="showGenerateDialog"
      modal
      header="Generate Team Needs Analysis"
      :style="{ width: '30rem' }"
    >
      <div class="flex flex-col gap-4">
        <p class="text-gray-700">
          This will analyze roster data and generate draft needs for all NFL teams for the {{ selectedYear }} season.
        </p>
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div class="flex items-start gap-2">
            <i class="pi pi-info-circle text-yellow-600 mt-0.5"></i>
            <div class="text-sm text-yellow-800">
              <p class="font-medium">This process may take 30-60 seconds</p>
              <p class="mt-1">Analysis will be based on current roster data in the database.</p>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <Button
          label="Cancel"
          icon="pi pi-times"
          text
          @click="showGenerateDialog = false"
          :disabled="generating"
        />
        <Button
          label="Generate"
          icon="pi pi-check"
          @click="generateAllNeeds"
          :loading="generating"
        />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: #f9fafb;
  font-weight: 600;
}

:deep(.p-card .p-card-content) {
  padding: 1rem;
}
</style>