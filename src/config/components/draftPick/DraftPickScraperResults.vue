<script setup lang="ts">
import { computed } from 'vue';
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Message from 'primevue/message';
import type { DraftPickScraperResult } from '@/services/draftPickScraperService';

/**
 * Draft Pick Scraper Results Component
 * Displays the results of draft pick scraping operations
 * Follows Single Responsibility Principle
 */

interface Props {
  result?: DraftPickScraperResult | null;
  results?: DraftPickScraperResult[];
}

const props = defineProps<Props>();

const displayResults = computed(() => {
  if (props.result) {
    return [props.result];
  }
  return props.results || [];
});

const hasResults = computed(() => displayResults.value.length > 0);

const totalStats = computed(() => {
  return displayResults.value.reduce(
    (acc, result) => {
      if (result.success && result.importResult) {
        acc.totalProcessed += result.importResult.totalProcessed;
        acc.playersCreated += result.importResult.playersCreated;
        acc.playersUpdated += result.importResult.playersUpdated;
        acc.draftPicksCreated += result.importResult.draftPicksCreated;
        acc.draftPicksUpdated += result.importResult.draftPicksUpdated;
        acc.playerTeamsCreated += result.importResult.playerTeamsCreated;
        acc.errors += result.importResult.errors.length;
      }
      return acc;
    },
    {
      totalProcessed: 0,
      playersCreated: 0,
      playersUpdated: 0,
      draftPicksCreated: 0,
      draftPicksUpdated: 0,
      playerTeamsCreated: 0,
      errors: 0,
    }
  );
});

function formatDuration(ms: number): string {
  return `${(ms / 1000).toFixed(2)}s`;
}

function getSeverity(success: boolean): 'success' | 'danger' {
  return success ? 'success' : 'danger';
}
</script>

<template>
  <Card v-if="hasResults">
    <template #title>
      <div class="flex align-items-center gap-2">
        <i class="pi pi-check-circle text-success"></i>
        <span>Scraping Results</span>
      </div>
    </template>

    <template #content>
      <div class="flex flex-column gap-4">
        <!-- Summary Statistics -->
        <div class="grid">
          <div class="col-12 md:col-4">
            <div class="surface-card p-3 border-round">
              <div class="flex justify-content-between align-items-center">
                <div>
                  <div class="text-500 text-sm mb-1">Total Processed</div>
                  <div class="text-900 font-bold text-xl">
                    {{ totalStats.totalProcessed }}
                  </div>
                </div>
                <i class="pi pi-database text-primary text-3xl"></i>
              </div>
            </div>
          </div>

          <div class="col-12 md:col-4">
            <div class="surface-card p-3 border-round">
              <div class="flex justify-content-between align-items-center">
                <div>
                  <div class="text-500 text-sm mb-1">Players Created</div>
                  <div class="text-900 font-bold text-xl">
                    {{ totalStats.playersCreated }}
                  </div>
                </div>
                <i class="pi pi-user-plus text-green-500 text-3xl"></i>
              </div>
            </div>
          </div>

          <div class="col-12 md:col-4">
            <div class="surface-card p-3 border-round">
              <div class="flex justify-content-between align-items-center">
                <div>
                  <div class="text-500 text-sm mb-1">Draft Picks Created</div>
                  <div class="text-900 font-bold text-xl">
                    {{ totalStats.draftPicksCreated }}
                  </div>
                </div>
                <i class="pi pi-star text-yellow-500 text-3xl"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Detailed Results Table -->
        <DataTable
          :value="displayResults"
          :rows="10"
          :paginator="displayResults.length > 10"
          responsiveLayout="scroll"
          stripedRows
        >
          <Column field="year" header="Year" :sortable="true" />

          <Column header="Status">
            <template #body="{ data }">
              <Tag
                :value="data.success ? 'Success' : 'Failed'"
                :severity="getSeverity(data.success)"
              />
            </template>
          </Column>

          <Column field="scraperResult.totalPicks" header="Picks Scraped" :sortable="true">
            <template #body="{ data }">
              {{ data.scraperResult?.totalPicks || 0 }}
            </template>
          </Column>

          <Column field="importResult.playersCreated" header="Players Created" :sortable="true">
            <template #body="{ data }">
              {{ data.importResult?.playersCreated || 0 }}
            </template>
          </Column>

          <Column field="importResult.draftPicksCreated" header="Draft Picks" :sortable="true">
            <template #body="{ data }">
              {{ data.importResult?.draftPicksCreated || 0 }}
            </template>
          </Column>

          <Column field="importResult.playerTeamsCreated" header="Team Relations" :sortable="true">
            <template #body="{ data }">
              {{ data.importResult?.playerTeamsCreated || 0 }}
            </template>
          </Column>

          <Column field="duration" header="Duration" :sortable="true">
            <template #body="{ data }">
              {{ formatDuration(data.duration) }}
            </template>
          </Column>

          <Column header="Errors">
            <template #body="{ data }">
              <Tag
                v-if="data.importResult?.errors?.length > 0"
                :value="`${data.importResult.errors.length}`"
                severity="warning"
              />
              <span v-else class="text-500">None</span>
            </template>
          </Column>
        </DataTable>

        <!-- Error Details -->
<!-- Error Details -->
        <div
          v-for="result in displayResults.filter((r) => r.importResult && r.importResult.errors && r.importResult.errors.length > 0)"
          :key="result.year"
        >
          <Message severity="warn" :closable="false">
            <template #messageicon>
              <i class="pi pi-exclamation-triangle"></i>
            </template>
            <div class="flex flex-column gap-2">
              <strong>Errors for {{ result.year }}</strong>
              <ul class="m-0 pl-4">
                <li v-for="(error, idx) in result.importResult!.errors" :key="idx">
                  {{ error.pick.playerName }}: {{ error.error }}
                </li>
              </ul>
            </div>
          </Message>
        </div>
      </div>
    </template>
  </Card>
</template>

<style scoped>
.surface-card {
  background-color: var(--surface-card);
  border: 1px solid var(--surface-border);
}

.text-success {
  color: var(--green-500);
}
</style>