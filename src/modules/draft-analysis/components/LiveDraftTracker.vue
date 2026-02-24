<!-- src/modules/draft-analysis/components/LiveDraftTracker.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useDraftAnalysisStore } from '../stores/draft-analysis.store';
import { useDraftGrading } from '../composables/useDraftGrading';
import { PositionGroup } from '../types/analyze-pattern.types';
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import Tag from 'primevue/tag';
import ProgressBar from 'primevue/progressbar';
import Message from 'primevue/message';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

interface Props {
  teamId: string;
  year: number;
}

const props = defineProps<Props>();

const store = useDraftAnalysisStore();
const toast = useToast();
const { getGradeSeverity, getGradeColor } = useDraftGrading();

const showTrackDialog = ref(false);
const trackForm = ref({
  round: 1,
  pick: 1,
  playerName: '',
  position: PositionGroup.QUARTERBACK,
  college: '',
  consensusRanking: 1
});

const positions = Object.values(PositionGroup);

onMounted(async () => {
  await store.loadTeamPicks(props.teamId, props.year);
});

const sortedPicks = computed(() => {
  return [...store.teamPicks].sort((a, b) => a.overallPick - b.overallPick);
});

const averageGrade = computed(() => {
  const completed = store.completedPicks;
  if (completed.length === 0) return 'N/A';
  const avg = store.averageTeamGrade;
  return avg.toFixed(1);
});

const overallGradeLetter = computed(() => {
  const avg = store.averageTeamGrade;
  if (avg >= 90) return 'A+';
  if (avg >= 80) return 'A';
  if (avg >= 70) return 'B';
  if (avg >= 60) return 'C';
  if (avg >= 50) return 'D';
  return 'F';
});

function openTrackDialog() {
  showTrackDialog.value = true;
}

function closeTrackDialog() {
  showTrackDialog.value = false;
  resetForm();
}

function resetForm() {
  trackForm.value = {
    round: 1,
    pick: 1,
    playerName: '',
    position: PositionGroup.QUARTERBACK,
    college: '',
    consensusRanking: 1
  };
}

async function submitPick() {
  try {
    await store.trackLivePick({
      year: props.year,
      teamId: props.teamId,
      ...trackForm.value
    });

    toast.add({
      severity: 'success',
      summary: 'Pick Tracked',
      detail: `${trackForm.value.playerName} has been added and graded`,
      life: 5000
    });

    closeTrackDialog();
    
    // Reload picks
    await store.loadTeamPicks(props.teamId, props.year);
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to track pick',
      life: 5000
    });
  }
}

function formatPickNumber(round: number, pick: number): string {
  return `R${round} - P${pick}`;
}

function getStatusSeverity(status: string) {
  switch (status) {
    case 'completed': return 'success';
    case 'current': return 'info';
    case 'upcoming': return 'warning';
    case 'traded': return 'danger';
    default: return 'secondary';
  }
}
</script>

<template>
  <div class="live-draft-tracker">
    <Toast />
    
    <!-- Header Stats -->
    <div class="grid mb-4">
      <div class="col-12 md:col-4">
        <Card>
          <template #content>
            <div class="stat-card">
              <div class="stat-label">Total Picks</div>
              <div class="stat-value">{{ store.teamPicks.length }}</div>
            </div>
          </template>
        </Card>
      </div>
      <div class="col-12 md:col-4">
        <Card>
          <template #content>
            <div class="stat-card">
              <div class="stat-label">Completed Picks</div>
              <div class="stat-value">{{ store.completedPicks.length }}</div>
            </div>
          </template>
        </Card>
      </div>
      <div class="col-12 md:col-4">
        <Card>
          <template #content>
            <div class="stat-card">
              <div class="stat-label">Average Grade</div>
              <div class="stat-value">
                <Tag 
                  :value="overallGradeLetter" 
                  :severity="getGradeSeverity(overallGradeLetter)"
                  class="text-xl"
                />
                <span class="ml-2 text-color-secondary">({{ averageGrade }})</span>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <!-- Main Card -->
    <Card>
      <template #title>
        {{ props.year }} Draft Picks
      </template>
      <template #content>
        <div class="flex justify-content-between align-items-center mb-4">
          <Button 
            label="Track New Pick" 
            icon="pi pi-plus"
            @click="openTrackDialog"
            severity="success"
          />
          <Button 
            label="Refresh" 
            icon="pi pi-refresh"
            @click="store.loadTeamPicks(props.teamId, props.year)"
            :loading="store.loading"
            text
          />
        </div>

        <Message v-if="store.error" severity="error" :closable="false">
          {{ store.error }}
        </Message>

        <DataTable 
          :value="sortedPicks"
          :loading="store.loading"
          responsiveLayout="scroll"
          :paginator="true"
          :rows="10"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} picks"
        >
          <Column field="overallPick" header="Overall" sortable style="width: 100px">
            <template #body="{ data }">
              <Tag :value="`#${data.overallPick}`" severity="info" />
            </template>
          </Column>

          <Column field="round" header="Pick" sortable style="width: 120px">
            <template #body="{ data }">
              {{ formatPickNumber(data.round, data.pick) }}
            </template>
          </Column>

          <Column field="playerName" header="Player" sortable>
            <template #body="{ data }">
              <div v-if="data.playerName">
                <div class="font-semibold">{{ data.playerName }}</div>
                <div class="text-sm text-color-secondary">
                  {{ data.position }} - {{ data.college }}
                </div>
              </div>
              <span v-else class="text-color-secondary">-</span>
            </template>
          </Column>

          <Column field="status" header="Status" sortable style="width: 120px">
            <template #body="{ data }">
              <Tag 
                :value="data.status" 
                :severity="getStatusSeverity(data.status)"
              />
            </template>
          </Column>

          <Column field="grade" header="Grade" sortable style="width: 150px">
            <template #body="{ data }">
              <div v-if="data.grade" class="grade-cell">
                <Tag 
                  :value="data.grade.grade" 
                  :severity="getGradeSeverity(data.grade.grade)"
                  class="mr-2"
                />
                <ProgressBar 
                  :value="data.grade.score"
                  :showValue="false"
                  style="height: 6px; width: 60px;"
                >
                  <template #value="{ value }">
                    <div 
                      :style="{
                        width: value + '%',
                        height: '100%',
                        backgroundColor: getGradeColor(data.grade.grade)
                      }"
                    ></div>
                  </template>
                </ProgressBar>
              </div>
              <span v-else class="text-color-secondary">-</span>
            </template>
          </Column>

          <Column field="pickedAt" header="Time" style="width: 150px">
            <template #body="{ data }">
              <span v-if="data.pickedAt" class="text-sm">
                {{ new Date(data.pickedAt).toLocaleString() }}
              </span>
              <span v-else class="text-color-secondary">-</span>
            </template>
          </Column>

          <template #empty>
            <div class="text-center p-4">
              <i class="pi pi-inbox text-4xl text-color-secondary mb-3"></i>
              <p class="text-color-secondary">No picks tracked yet</p>
              <Button 
                label="Track First Pick" 
                icon="pi pi-plus"
                @click="openTrackDialog"
                text
              />
            </div>
          </template>
        </DataTable>
      </template>
    </Card>

    <!-- Track Pick Dialog -->
    <Dialog 
      v-model:visible="showTrackDialog"
      modal
      header="Track Draft Pick"
      :style="{ width: '600px' }"
      :closable="true"
    >
      <div class="grid">
        <div class="col-12 md:col-6">
          <label for="round" class="block mb-2">Round *</label>
          <InputNumber 
            id="round"
            v-model="trackForm.round"
            :min="1"
            :max="7"
            class="w-full"
          />
        </div>
        <div class="col-12 md:col-6">
          <label for="pick" class="block mb-2">Pick *</label>
          <InputNumber 
            id="pick"
            v-model="trackForm.pick"
            :min="1"
            :max="32"
            class="w-full"
          />
        </div>
        <div class="col-12">
          <label for="playerName" class="block mb-2">Player Name *</label>
          <InputText 
            id="playerName"
            v-model="trackForm.playerName"
            class="w-full"
            placeholder="Enter player name"
          />
        </div>
        <div class="col-12 md:col-6">
          <label for="position" class="block mb-2">Position *</label>
          <Dropdown 
            id="position"
            v-model="trackForm.position"
            :options="positions"
            class="w-full"
          />
        </div>
        <div class="col-12 md:col-6">
          <label for="consensusRanking" class="block mb-2">Consensus Rank *</label>
          <InputNumber 
            id="consensusRanking"
            v-model="trackForm.consensusRanking"
            :min="1"
            :max="300"
            class="w-full"
          />
        </div>
        <div class="col-12">
          <label for="college" class="block mb-2">College</label>
          <InputText 
            id="college"
            v-model="trackForm.college"
            class="w-full"
            placeholder="Enter college name"
          />
        </div>
      </div>

      <template #footer>
        <Button 
          label="Cancel" 
          icon="pi pi-times"
          @click="closeTrackDialog"
          text
        />
        <Button 
          label="Track Pick" 
          icon="pi pi-check"
          @click="submitPick"
          :disabled="!trackForm.playerName || store.loading"
          :loading="store.loading"
        />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.live-draft-tracker {
  padding: 1rem;
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

.grade-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>