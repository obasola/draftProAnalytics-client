<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable, { type DataTablePageEvent } from 'primevue/datatable'
import InputNumber from 'primevue/inputnumber'
import Message from 'primevue/message'
import Dropdown from 'primevue/dropdown'
import Tag from 'primevue/tag'

import {
  postSeasonResultService,
  type PostSeasonResultRow,
} from '@/services/postSeasonResultService'

const currentYear = new Date().getFullYear()
const rows = ref<PostSeasonResultRow[]>([])
const loading = ref(false)
const errorMessage = ref('')
const playoffYear = ref<number | null>(null)
const resultFilter = ref<'W' | 'L' | null>(null)
const page = ref(1)
const pageSize = ref(25)
const totalRecords = ref(0)

const resultOptions = [
  { label: 'All results', value: null },
  { label: 'Wins', value: 'W' },
  { label: 'Losses', value: 'L' },
]

const hasFilters = computed(() => playoffYear.value !== null || resultFilter.value !== null)

async function loadResults(): Promise<void> {
  loading.value = true
  errorMessage.value = ''

  try {
    const result = await postSeasonResultService.getAll({
      page: page.value,
      limit: pageSize.value,
      playoffYear: playoffYear.value ?? undefined,
      winLose: resultFilter.value ?? undefined,
    })

    rows.value = result.data
    totalRecords.value = result.pagination?.total ?? result.data.length
  } catch (error) {
    console.error('Failed to load post-season results', error)
    errorMessage.value = 'Unable to load post-season results.'
    rows.value = []
    totalRecords.value = 0
  } finally {
    loading.value = false
  }
}

async function applyFilters(): Promise<void> {
  page.value = 1
  await loadResults()
}

async function clearFilters(): Promise<void> {
  playoffYear.value = null
  resultFilter.value = null
  page.value = 1
  await loadResults()
}

async function handlePage(event: DataTablePageEvent): Promise<void> {
  page.value = event.page + 1
  pageSize.value = event.rows
  await loadResults()
}

function resultSeverity(row: PostSeasonResultRow): 'success' | 'danger' | 'secondary' {
  if (row.winLose === 'W' || row.isWin) return 'success'
  if (row.winLose === 'L') return 'danger'
  return 'secondary'
}

onMounted(loadResults)
</script>

<template>
  <section class="post-season-results-page">
    <header class="page-header">
      <div>
        <h1>Post Season Results</h1>
        <p>Review NFL playoff outcomes by season and result.</p>
      </div>
      <Button
        label="Refresh"
        icon="pi pi-refresh"
        severity="secondary"
        outlined
        :loading="loading"
        @click="loadResults"
      />
    </header>

    <div class="filter-bar">
      <div class="field">
        <label for="playoff-year">Playoff year</label>
        <InputNumber
          id="playoff-year"
          v-model="playoffYear"
          :min="1990"
          :max="currentYear + 1"
          :use-grouping="false"
          placeholder="All years"
        />
      </div>

      <div class="field">
        <label for="result-filter">Result</label>
        <Dropdown
          id="result-filter"
          v-model="resultFilter"
          :options="resultOptions"
          option-label="label"
          option-value="value"
          placeholder="All results"
          show-clear
        />
      </div>

      <div class="filter-actions">
        <Button label="Search" icon="pi pi-search" :loading="loading" @click="applyFilters" />
        <Button
          label="Clear"
          icon="pi pi-times"
          severity="secondary"
          outlined
          :disabled="!hasFilters || loading"
          @click="clearFilters"
        />
      </div>
    </div>

    <Message v-if="errorMessage" severity="error" :closable="false">
      {{ errorMessage }}
    </Message>

    <DataTable
      :value="rows"
      :loading="loading"
      lazy
      paginator
      :rows="pageSize"
      :total-records="totalRecords"
      :rows-per-page-options="[10, 25, 50, 100]"
      striped-rows
      responsive-layout="scroll"
      data-key="id"
      @page="handlePage"
    >
      <template #empty>
        No post-season results matched the selected filters.
      </template>

      <Column field="playoffYear" header="Year" sortable />
      <Column header="Team" sortable sort-field="team.name">
        <template #body="{ data }">
          {{ data.team?.fullName || data.team?.name || `Team ${data.teamId ?? '—'}` }}
        </template>
      </Column>
      <Column field="playoffRound" header="Round">
        <template #body="{ data }">
          {{ data.playoffRound || data.lastRoundReached || '—' }}
        </template>
      </Column>
      <Column header="Result">
        <template #body="{ data }">
          <Tag
            :value="data.winLose === 'W' || data.isWin ? 'Win' : data.winLose === 'L' ? 'Loss' : 'Unknown'"
            :severity="resultSeverity(data)"
          />
        </template>
      </Column>
      <Column header="Score">
        <template #body="{ data }">
          {{ data.gameResult || `${data.teamScore ?? '—'} - ${data.opponentScore ?? '—'}` }}
        </template>
      </Column>
      <Column field="scoreDifferential" header="Differential">
        <template #body="{ data }">
          {{ data.scoreDifferential ?? '—' }}
        </template>
      </Column>
    </DataTable>
  </section>
</template>

<style scoped>
.post-season-results-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.page-header h1 {
  margin: 0;
}

.page-header p {
  margin: 0.35rem 0 0;
  color: var(--text-color-secondary);
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--surface-border);
  border-radius: var(--border-radius);
  background: var(--surface-card);
}

.field {
  display: flex;
  min-width: 12rem;
  flex-direction: column;
  gap: 0.4rem;
}

.field label {
  font-weight: 600;
}

.filter-actions {
  display: flex;
  gap: 0.5rem;
}

@media (max-width: 700px) {
  .page-header {
    flex-direction: column;
  }

  .field,
  .filter-actions {
    width: 100%;
  }

  .filter-actions :deep(.p-button) {
    flex: 1;
  }
}
</style>
