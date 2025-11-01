<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import Card from 'primevue/card';
import { useDraftPickStore } from '@/stores/draftPickStore';

const router = useRouter();
const draftPickStore = useDraftPickStore();

const filterYear = ref<number | undefined>(undefined);
const filterRound = ref<number | undefined>(undefined);

const yearOptions = ref<{ label: string; value: number }[]>([]);
const roundOptions = ref<{ label: string; value: number }[]>([
  { label: 'All Rounds', value: 0 },
  { label: 'Round 1', value: 1 },
  { label: 'Round 2', value: 2 },
  { label: 'Round 3', value: 3 },
  { label: 'Round 4', value: 4 },
  { label: 'Round 5', value: 5 },
  { label: 'Round 6', value: 6 },
  { label: 'Round 7', value: 7 },
]);

const initializeYearOptions = (): void => {
  const currentYear = new Date().getFullYear();
  const years = [{ label: 'All Years', value: 0 }];
  for (let i = currentYear + 5; i >= currentYear - 20; i--) {
    years.push({ label: i.toString(), value: i });
  }
  yearOptions.value = years;
};

const loadDraftPicks = async (): Promise<void> => {
  if (filterYear.value && filterYear.value > 0) {
    await draftPickStore.fetchByYear(filterYear.value);
  } else {
    await draftPickStore.fetchAllWithRelations();
  }
};

const viewDraftPick = (draftYear: number, round: number, pickNumber: number): void => {
  router.push(`/draftpicks/${draftYear}/${round}/${pickNumber}?mode=read`);
};

const editDraftPick = (draftYear: number, round: number, pickNumber: number): void => {
  router.push(`/draftpicks/${draftYear}/${round}/${pickNumber}?mode=edit`);
};

const createDraftPick = (): void => {
  router.push('/draftpicks/create');
};

const applyFilters = async (): Promise<void> => {
  await loadDraftPicks();
};

const clearFilters = async (): Promise<void> => {
  filterYear.value = undefined;
  filterRound.value = undefined;
  await loadDraftPicks();
};

const filteredPicks = ref<any[]>([]);

const applyRoundFilter = () => {
  if (filterRound.value && filterRound.value > 0) {
    filteredPicks.value = draftPickStore.draftPicksWithRelations.filter(
      pick => pick.round === filterRound.value
    );
  } else {
    filteredPicks.value = draftPickStore.draftPicksWithRelations;
  }
};

const refresh = async () => {
  await loadDraftPicks();
  applyRoundFilter();
};

onMounted(async () => {
  initializeYearOptions();
  await loadDraftPicks();
  applyRoundFilter();
});
</script>

<template>
  <Card class="draft-picks-container">
    <template #title>
      <div class="page-header">
        <h2>Draft Picks Management</h2>
        <Button 
          @click="createDraftPick" 
          icon="pi pi-plus" 
          label="Create Draft Pick"
          class="p-button-success"
        />
      </div>
    </template>

    <template #content>
      <div class="filters-section">
        <div class="filter-row">
          <div class="filter-item">
            <label for="yearFilter">Year</label>
            <Dropdown 
              id="yearFilter"
              v-model="filterYear" 
              :options="yearOptions" 
              optionLabel="label" 
              optionValue="value"
              placeholder="All Years"
            />
          </div>

          <div class="filter-item">
            <label for="roundFilter">Round</label>
            <Dropdown 
              id="roundFilter"
              v-model="filterRound" 
              :options="roundOptions" 
              optionLabel="label" 
              optionValue="value"
              placeholder="All Rounds"
              @change="applyRoundFilter"
            />
          </div>

          <div class="filter-actions">
            <Button 
              @click="applyFilters" 
              icon="pi pi-filter" 
              label="Apply"
              class="p-button-primary"
            />
            <Button 
              @click="clearFilters" 
              icon="pi pi-filter-slash" 
              label="Clear"
              class="p-button-secondary"
            />
          </div>
        </div>
      </div>

      <div v-if="draftPickStore.loading" class="loading-message">
        <i class="pi pi-spin pi-spinner"></i> Loading draft picks...
      </div>

      <div v-else-if="draftPickStore.error" class="error-message">
        <i class="pi pi-exclamation-triangle"></i> {{ draftPickStore.error }}
      </div>

      <div v-else-if="filteredPicks.length === 0" class="empty-message">
        <i class="pi pi-info-circle"></i> No draft picks found. Create your first draft pick!
      </div>

      <DataTable 
        v-else
        :value="filteredPicks" 
        :paginator="true"
        :rows="25"
        :rowsPerPageOptions="[10, 25, 50, 100]"
        class="draft-picks-table"
        responsiveLayout="scroll"
        sortField="draftYear"
        :sortOrder="-1"
      >
        <Column field="draftYear" header="Year" sortable />
        <Column field="round" header="Round" sortable />
        <Column field="pickNumber" header="Pick #" sortable />
        <Column field="team" header="Team" sortable />
        <Column field="player" header="Player" sortable>
          <template #body="{ data }">
            <span v-if="data.player">{{ data.player }}</span>
            <span v-else class="text-muted">Not selected</span>
          </template>
        </Column>
        <Column field="position" header="Position" sortable>
          <template #body="{ data }">
            <span v-if="data.position">{{ data.position }}</span>
            <span v-else>-</span>
          </template>
        </Column>
        <Column header="Actions" :exportable="false">
          <template #body="{ data }">
            <div class="action-buttons">
              <Button 
                @click="viewDraftPick(data.draftYear, data.round, data.pickNumber)" 
                icon="pi pi-eye" 
                class="p-button-info p-button-sm"
                v-tooltip="'View'"
              />
              <Button 
                @click="editDraftPick(data.draftYear, data.round, data.pickNumber)" 
                icon="pi pi-pencil" 
                class="p-button-warning p-button-sm"
                v-tooltip="'Edit'"
              />
            </div>
          </template>
        </Column>
      </DataTable>

      <div v-if="filteredPicks.length > 0" class="table-summary">
        <span>Total Draft Picks: <strong>{{ filteredPicks.length }}</strong></span>
      </div>
    </template>
  </Card>
</template>

<style scoped>
.draft-picks-container {
  width: 100%;
  margin: 0 auto;
  padding: 1rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.page-header h2 {
  margin: 0;
  color: var(--text-color);
}

.filters-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: var(--surface-card);
  border-radius: 8px;
  border: 1px solid var(--surface-border);
}

.filter-row {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 200px;
}

.filter-item label {
  font-weight: 500;
  color: var(--text-color);
  font-size: 0.875rem;
}

.filter-actions {
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
}

.loading-message,
.error-message,
.empty-message {
  text-align: center;
  padding: 3rem;
  color: var(--text-color-secondary);
}

.error-message {
  color: var(--red-500);
}

.loading-message i {
  margin-right: 0.5rem;
}

.text-muted {
  color: var(--text-color-secondary);
  font-style: italic;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.table-summary {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--surface-border);
  text-align: center;
  color: var(--text-color-secondary);
}

.table-summary strong {
  color: var(--text-color);
}

.draft-picks-table {
  width: 100%;
}
</style>