<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Badge from 'primevue/badge';
import ProgressBar from 'primevue/progressbar';
import Chip from 'primevue/chip';
import Panel from 'primevue/panel';
import Divider from 'primevue/divider';
import { useTeamNeedsAnalysisStore } from '../store/teamNeedsAnalysis.store';
import { getNeedSeverity, getSeverityColor, getSeverityBadgeClass } from '../types/teamNeedsAnalysis.types';
import type { PositionNeedDto } from '../types/teamNeedsAnalysis.types';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const store = useTeamNeedsAnalysisStore();

const teamId = ref(parseInt(route.params.teamId as string));
const seasonYear = ref(parseInt(route.query.year as string) || new Date().getFullYear());

onMounted(async () => {
  await loadTeamNeeds();
});

async function loadTeamNeeds(): Promise<void> {
  try {
    await store.fetchTeamNeeds(teamId.value, seasonYear.value);
    
    if (!store.selectedTeamNeeds) {
      toast.add({
        severity: 'warn',
        summary: 'Not Found',
        detail: 'Team needs analysis not found',
        life: 3000,
      });
      router.push({ name: 'team-needs-dashboard' });
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load team needs',
      life: 3000,
    });
  }
}

async function regenerateAnalysis(): Promise<void> {
  try {
    await store.generateTeamNeeds({
      teamId: teamId.value,
      seasonYear: seasonYear.value,
      forceRefresh: true,
    });
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Team needs analysis regenerated',
      life: 3000,
    });
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to regenerate analysis',
      life: 3000,
    });
  }
}

function goBack(): void {
  router.push({ name: 'team-needs-dashboard' });
}

function getNeedScoreSeverity(score: number): string {
  return getSeverityColor(getNeedSeverity(score));
}

function getPrioritySeverity(priority: number): string {
  if (priority >= 9) return 'danger';
  if (priority >= 7) return 'warning';
  if (priority >= 5) return 'info';
  return 'success';
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const sortedPositionNeeds = computed(() => {
  if (!store.selectedTeamNeeds) return [];
  return [...store.selectedTeamNeeds.positionNeeds].sort((a, b) => b.priority - a.priority);
});

const criticalNeeds = computed(() => {
  return sortedPositionNeeds.value.filter(need => need.priority >= 8);
});

const highPriorityNeeds = computed(() => {
  return sortedPositionNeeds.value.filter(need => need.priority >= 6 && need.priority < 8);
});

const mediumPriorityNeeds = computed(() => {
  return sortedPositionNeeds.value.filter(need => need.priority >= 4 && need.priority < 6);
});

const positionGroupSummary = computed(() => {
  if (!store.selectedTeamNeeds) return new Map();
  
  const summary = new Map<string, { count: number; avgScore: number; avgPriority: number }>();
  
  store.selectedTeamNeeds.positionNeeds.forEach(need => {
    const existing = summary.get(need.positionGroup);
    if (existing) {
      existing.count += 1;
      existing.avgScore = (existing.avgScore + need.needScore) / 2;
      existing.avgPriority = (existing.avgPriority + need.priority) / 2;
    } else {
      summary.set(need.positionGroup, {
        count: 1,
        avgScore: need.needScore,
        avgPriority: need.priority,
      });
    }
  });
  
  return summary;
});
</script>

<template>
  <div class="p-4" v-if="store.selectedTeamNeeds">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex justify-between items-center mb-4">
        <div class="flex items-center gap-3">
          <Button
            icon="pi pi-arrow-left"
            text
            rounded
            @click="goBack"
            v-tooltip.right="'Back to Dashboard'"
          />
          <div>
            <h1 class="text-3xl font-bold text-gray-800">Team {{ teamId }} Draft Needs</h1>
            <p class="text-gray-600 mt-1">{{ seasonYear }} Season Analysis</p>
          </div>
        </div>
        <Button
          label="Regenerate Analysis"
          icon="pi pi-refresh"
          severity="info"
          :loading="store.loading"
          @click="regenerateAnalysis"
        />
      </div>

      <!-- Summary Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <template #content>
            <div class="flex justify-between items-center">
              <div>
                <p class="text-gray-500 text-sm font-medium">Overall Need Score</p>
                <p
                  class="text-3xl font-bold"
                  :class="getNeedScoreSeverity(store.selectedTeamNeeds.overallNeedScore)"
                >
                  {{ store.selectedTeamNeeds.overallNeedScore }}
                </p>
              </div>
              <Badge
                :value="getNeedSeverity(store.selectedTeamNeeds.overallNeedScore).toUpperCase()"
                :severity="getNeedSeverity(store.selectedTeamNeeds.overallNeedScore) === 'critical' ? 'danger' : 'warning'"
                class="text-sm"
              />
            </div>
            <ProgressBar
              :value="store.selectedTeamNeeds.overallNeedScore"
              :showValue="false"
              class="mt-3"
            />
          </template>
        </Card>

        <Card>
          <template #content>
            <div class="flex justify-between items-center">
              <div>
                <p class="text-gray-500 text-sm font-medium">Critical Positions</p>
                <p class="text-3xl font-bold text-red-600">{{ criticalNeeds.length }}</p>
              </div>
              <i class="pi pi-exclamation-triangle text-4xl text-red-500"></i>
            </div>
          </template>
        </Card>

        <Card>
          <template #content>
            <div class="flex justify-between items-center">
              <div>
                <p class="text-gray-500 text-sm font-medium">Roster Size</p>
                <p class="text-3xl font-bold text-gray-800">
                  {{ store.selectedTeamNeeds.metadata?.rosterSize || 'N/A' }}
                </p>
              </div>
              <i class="pi pi-users text-4xl text-blue-500"></i>
            </div>
          </template>
        </Card>

        <Card>
          <template #content>
            <div class="flex justify-between items-center">
              <div>
                <p class="text-gray-500 text-sm font-medium">Average Age</p>
                <p class="text-3xl font-bold text-gray-800">
                  {{ store.selectedTeamNeeds.metadata?.averageAge?.toFixed(1) || 'N/A' }}
                </p>
              </div>
              <i class="pi pi-clock text-4xl text-orange-500"></i>
            </div>
          </template>
        </Card>
      </div>

      <!-- Top Priorities -->
      <Card class="mb-6">
        <template #title>
          <div class="flex items-center gap-2">
            <i class="pi pi-star-fill text-yellow-500"></i>
            <span>Top Draft Priorities</span>
          </div>
        </template>
        <template #content>
          <div v-if="store.selectedTeamNeeds.topPriorities.length > 0" class="flex flex-wrap gap-2">
            <Chip
              v-for="(position, index) in store.selectedTeamNeeds.topPriorities"
              :key="position"
              :label="position"
              class="text-lg font-semibold"
              :class="{
                'bg-red-100 text-red-800': index === 0,
                'bg-orange-100 text-orange-800': index === 1,
                'bg-yellow-100 text-yellow-800': index >= 2,
              }"
            />
          </div>
          <p v-else class="text-gray-500">No critical priorities identified</p>
        </template>
      </Card>

      <!-- Position Group Summary -->
      <Card class="mb-6">
        <template #title>Position Group Summary</template>
        <template #content>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              v-for="[group, stats] in positionGroupSummary"
              :key="group"
              class="border border-gray-200 rounded-lg p-4"
            >
              <div class="flex justify-between items-start mb-2">
                <span class="font-semibold text-lg">{{ group }}</span>
                <Badge :value="stats.count" severity="info" />
              </div>
              <div class="space-y-2">
                <div>
                  <p class="text-xs text-gray-500">Avg Need Score</p>
                  <p class="text-sm font-semibold" :class="getNeedScoreSeverity(stats.avgScore)">
                    {{ stats.avgScore.toFixed(0) }}
                  </p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Avg Priority</p>
                  <p class="text-sm font-semibold">{{ stats.avgPriority.toFixed(1) }}</p>
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Position Needs Tables -->
    <div class="space-y-6">
      <!-- Critical Needs -->
      <Panel v-if="criticalNeeds.length > 0" header="Critical Needs (Priority 8-10)" toggleable>
        <DataTable
          :value="criticalNeeds"
          stripedRows
          class="w-full"
        >
          <Column field="position" header="Position" style="min-width: 8rem">
            <template #body="{ data }">
              <span class="font-bold text-lg">{{ data.position }}</span>
            </template>
          </Column>

          <Column field="positionGroup" header="Group" style="min-width: 8rem">
            <template #body="{ data }">
              <Badge :value="data.positionGroup" severity="info" />
            </template>
          </Column>

          <Column field="needScore" header="Need Score" sortable style="min-width: 12rem">
            <template #body="{ data }">
              <div class="flex items-center gap-2">
                <span
                  class="font-bold text-xl"
                  :class="getNeedScoreSeverity(data.needScore)"
                >
                  {{ data.needScore }}
                </span>
                <ProgressBar
                  :value="data.needScore"
                  :showValue="false"
                  class="flex-1"
                />
              </div>
            </template>
          </Column>

          <Column field="priority" header="Priority" sortable style="min-width: 8rem">
            <template #body="{ data }">
              <Badge
                :value="data.priority"
                :severity="getPrioritySeverity(data.priority)"
                class="text-lg"
              />
            </template>
          </Column>

          <Column field="reasoning" header="Analysis" style="min-width: 20rem">
            <template #body="{ data }">
              <ul class="list-disc list-inside text-sm space-y-1">
                <li v-for="(reason, idx) in data.reasoning" :key="idx" class="text-gray-700">
                  {{ reason }}
                </li>
              </ul>
            </template>
          </Column>
        </DataTable>
      </Panel>

      <!-- High Priority Needs -->
      <Panel v-if="highPriorityNeeds.length > 0" header="High Priority Needs (Priority 6-7)" toggleable>
        <DataTable
          :value="highPriorityNeeds"
          stripedRows
          class="w-full"
        >
          <Column field="position" header="Position" style="min-width: 8rem">
            <template #body="{ data }">
              <span class="font-semibold text-lg">{{ data.position }}</span>
            </template>
          </Column>

          <Column field="positionGroup" header="Group" style="min-width: 8rem">
            <template #body="{ data }">
              <Badge :value="data.positionGroup" severity="info" />
            </template>
          </Column>

          <Column field="needScore" header="Need Score" sortable style="min-width: 10rem">
            <template #body="{ data }">
              <span
                class="font-bold"
                :class="getNeedScoreSeverity(data.needScore)"
              >
                {{ data.needScore }}
              </span>
            </template>
          </Column>

          <Column field="priority" header="Priority" sortable style="min-width: 8rem">
            <template #body="{ data }">
              <Badge
                :value="data.priority"
                :severity="getPrioritySeverity(data.priority)"
              />
            </template>
          </Column>

          <Column field="reasoning" header="Analysis" style="min-width: 20rem">
            <template #body="{ data }">
              <ul class="list-disc list-inside text-sm space-y-1">
                <li v-for="(reason, idx) in data.reasoning" :key="idx" class="text-gray-600">
                  {{ reason }}
                </li>
              </ul>
            </template>
          </Column>
        </DataTable>
      </Panel>

      <!-- All Position Needs -->
      <Panel header="All Position Needs" toggleable :collapsed="true">
        <DataTable
          :value="sortedPositionNeeds"
          stripedRows
          paginator
          :rows="10"
          sortField="priority"
          :sortOrder="-1"
          class="w-full"
        >
          <Column field="position" header="Position" sortable style="min-width: 8rem" />
          <Column field="positionGroup" header="Group" sortable style="min-width: 8rem" />
          <Column field="needScore" header="Need Score" sortable style="min-width: 8rem">
            <template #body="{ data }">
              <span :class="getNeedScoreSeverity(data.needScore)" class="font-semibold">
                {{ data.needScore }}
              </span>
            </template>
          </Column>
          <Column field="priority" header="Priority" sortable style="min-width: 8rem">
            <template #body="{ data }">
              <Badge :value="data.priority" :severity="getPrioritySeverity(data.priority)" />
            </template>
          </Column>
          <Column field="reasoning" header="Analysis" style="min-width: 20rem">
            <template #body="{ data }">
              <p class="text-sm text-gray-600">{{ data.reasoning.join('; ') }}</p>
            </template>
          </Column>
        </DataTable>
      </Panel>
    </div>

    <!-- Metadata -->
    <Divider />
    <div class="text-sm text-gray-500 text-center">
      <p>Analysis generated: {{ formatDate(store.selectedTeamNeeds.analysisDate) }}</p>
      <p v-if="store.selectedTeamNeeds.metadata?.injuryCount" class="mt-1">
        Current injuries: {{ store.selectedTeamNeeds.metadata.injuryCount }}
      </p>
    </div>
  </div>

  <!-- Loading state -->
  <div v-else-if="store.loading" class="flex justify-center items-center h-screen">
    <ProgressBar mode="indeterminate" style="width: 300px" />
  </div>

  <!-- Error state -->
  <div v-else class="flex flex-col justify-center items-center h-screen">
    <i class="pi pi-exclamation-triangle text-6xl text-orange-500 mb-4"></i>
    <p class="text-xl text-gray-600 mb-4">Team needs analysis not found</p>
    <Button label="Go Back" icon="pi pi-arrow-left" @click="goBack" />
  </div>
</template>

<style scoped>
:deep(.p-panel .p-panel-header) {
  background-color: #f9fafb;
  font-weight: 600;
}

:deep(.p-card .p-card-content) {
  padding: 1rem;
}
</style>