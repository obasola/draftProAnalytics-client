<script setup lang="ts">
import { useDraftPickScraper } from '@/composables/useDraftPickScraper';
import DraftPickScraperForm from '@/components/draftPick/DraftPickScraperForm.vue';
import DraftPickScraperResults from '@/components/draftPick/DraftPickScraperResults.vue';
import Button from 'primevue/button';

/**
 * Draft Pick Scraper View
 * Main view for scraping NFL draft picks
 * Follows Single Responsibility Principle
 */

const {
  currentResult,
  multipleResults,
  hasResults,
  reset,
} = useDraftPickScraper();
</script>

<template>
  <div class="draft-pick-scraper-view">
    <div class="flex flex-column gap-4">
      <!-- Page Header -->
      <div class="flex justify-content-between align-items-center">
        <div>
          <h1 class="text-4xl font-bold m-0 mb-2">NFL Draft Pick Scraper</h1>
          <p class="text-xl text-muted m-0">
            Import draft picks from Pro Football Reference
          </p>
        </div>
        <Button
          v-if="hasResults"
          label="Reset"
          icon="pi pi-refresh"
          severity="secondary"
          outlined
          @click="reset"
        />
      </div>

      <!-- Scraper Form -->
      <DraftPickScraperForm />

      <!-- Results Display -->
      <DraftPickScraperResults
        :result="currentResult"
        :results="multipleResults"
      />
    </div>
  </div>
</template>

<style scoped>
.draft-pick-scraper-view {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.text-muted {
  color: var(--text-color-secondary);
}

@media (max-width: 768px) {
  .draft-pick-scraper-view {
    padding: 1rem;
  }

  h1 {
    font-size: 2rem !important;
  }

  p {
    font-size: 1rem !important;
  }
}
</style>