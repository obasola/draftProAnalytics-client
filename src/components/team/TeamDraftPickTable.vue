<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import { useDraftPick } from '@/composables/draftPick/useDraftPick';

interface Props {
  teamId?: number;
  initialYear?: number;
}

const props = defineProps<Props>();

const {
  draftPicksWithRelations,
  loading,
  error,
  fetchByTeamAndYear,
} = useDraftPick();

const selectedYear = ref<number>(props.initialYear || new Date().getFullYear());

const yearOptions = ref<{ label: string; value: number }[]>([]);

const initializeYearOptions = (): void => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear; i >= currentYear - 10; i--) {
    years.push({ label: i.toString(), value: i });
  }
  yearOptions.value = years;
};

const loadDraftPicks = async (): Promise<void> => {
  if (props.teamId && selectedYear.value) {
    await fetchByTeamAndYear(props.teamId, selectedYear.value);
  }
};

watch(selectedYear, async () => {
  await loadDraftPicks();
});

watch(() => props.teamId, async () => {
  await loadDraftPicks();
});

onMounted(async () => {
  initializeYearOptions();
  await loadDraftPicks();
});
</script>

<template>
  <div class="draft-pick-table-container">
    <div class="table-header">
      <h4>Draft Picks</h4>
      <div class="year-selector">
        <label for="yearSelect">Year:</label>
        <Dropdown 
          id="yearSelect"
          v-model="selectedYear" 
          :options="yearOptions" 
          optionLabel="label" 
          optionValue="value"
          placeholder="Select Year"
        />
      </div>
    </div>

    <div v-if="loading" class="loading-message">
      <i class="pi pi-spin pi-spinner"></i> Loading draft picks...
    </div>

    <div v-else-if="error" class="error-message">
      <i class="pi pi-exclamation-triangle"></i> {{ error }}
    </div>

    <div v-else-if="draftPicksWithRelations.length === 0" class="empty-message">
      <i class="pi pi-info-circle"></i> No draft picks found for this team and year.
    </div>

    <DataTable 
      v-else
      :value="draftPicksWithRelations" 
      :paginator="false"
      class="draft-picks-table"
      responsiveLayout="scroll"
    >
      <Column field="round" header="Round" sortable />
      <Column field="pickNumber" header="Pick" sortable />
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
      <Column field="team" header="Current Team" sortable />
    </DataTable>

    <div v-if="draftPicksWithRelations.length > 0" class="picks-summary">
      <span class="summary-text">
        Total Picks: <strong>{{ draftPicksWithRelations.length }}</strong>
      </span>
    </div>
  </div>
</template>

<style scoped>
.draft-pick-table-container {
  width: 100%;
  box-sizing: border-box;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--surface-border);
}

.table-header h4 {
  margin: 0;
  color: var(--text-color);
}

.year-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.year-selector label {
  font-weight: 500;
  color: var(--text-color);
}

.loading-message,
.error-message,
.empty-message {
  text-align: center;
  padding: 2rem;
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

.picks-summary {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--surface-border);
  text-align: center;
}

.summary-text {
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

.summary-text strong {
  color: var(--text-color);
  font-size: 1rem;
}

.draft-picks-table {
  width: 100%;
}
</style>