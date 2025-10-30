<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDraftPickScraper } from '@/composables/useDraftPickScraper';
import Card from 'primevue/card';
import InputNumber from 'primevue/inputnumber';
import Button from 'primevue/button';
import Chips from 'primevue/chips';
import RadioButton from 'primevue/radiobutton';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';

/**
 * Draft Pick Scraper Form Component
 * Provides UI for scraping NFL draft picks from Pro Football Reference
 * Follows Single Responsibility Principle
 */

const {
  isLoading,
  currentResult,
  multipleResults,
  error,
  scrapeDraftYear,
  scrapeMultipleYears,
  validateScraper,
} = useDraftPickScraper();

const scrapeMode = ref<'single' | 'multiple'>('single');
const singleYear = ref<number>(new Date().getFullYear());
const multipleYears = ref<number[]>([]);
const isValidating = ref(false);
const validationMessage = ref<string | null>(null);

const canSubmit = computed(() => {
  if (scrapeMode.value === 'single') {
    return singleYear.value > 1936 && singleYear.value <= new Date().getFullYear();
  }
  return multipleYears.value.length > 0 && multipleYears.value.every(
    (y) => y > 1936 && y <= new Date().getFullYear()
  );
});

const currentYear = computed(() => new Date().getFullYear());

async function handleValidate() {
  if (!singleYear.value) return;

  isValidating.value = true;
  validationMessage.value = null;

  const isValid = await validateScraper(singleYear.value);
  
  if (isValid) {
    validationMessage.value = `✅ URL is valid and accessible for ${singleYear.value}`;
  } else {
    validationMessage.value = `❌ URL is not accessible for ${singleYear.value}`;
  }

  isValidating.value = false;
}

async function handleSubmit() {
  if (!canSubmit.value) return;

  if (scrapeMode.value === 'single' && singleYear.value) {
    await scrapeDraftYear(singleYear.value);
  } else if (scrapeMode.value === 'multiple') {
    await scrapeMultipleYears(multipleYears.value);
  }
}

function generateYearRange() {
  const start = 2020;
  const end = currentYear.value;
  const years: number[] = [];
  
  for (let year = start; year <= end; year++) {
    years.push(year);
  }
  
  multipleYears.value = years;
}
</script>

<template>
  <Card>
    <template #title>
      <div class="flex align-items-center gap-2">
        <i class="pi pi-cloud-download text-primary"></i>
        <span>NFL Draft Pick Scraper</span>
      </div>
    </template>

    <template #subtitle>
      Scrape draft picks from Pro Football Reference
    </template>

    <template #content>
      <div class="flex flex-column gap-4">
        <!-- Scrape Mode Selection -->
        <div class="flex flex-column gap-2">
          <label class="font-semibold">Scrape Mode</label>
          <div class="flex gap-4">
            <div class="flex align-items-center">
              <RadioButton
                v-model="scrapeMode"
                inputId="mode-single"
                value="single"
                :disabled="isLoading"
              />
              <label for="mode-single" class="ml-2">Single Year</label>
            </div>
            <div class="flex align-items-center">
              <RadioButton
                v-model="scrapeMode"
                inputId="mode-multiple"
                value="multiple"
                :disabled="isLoading"
              />
              <label for="mode-multiple" class="ml-2">Multiple Years</label>
            </div>
          </div>
        </div>

        <!-- Single Year Mode -->
        <div v-if="scrapeMode === 'single'" class="flex flex-column gap-3">
          <div class="flex flex-column gap-2">
            <label for="year" class="font-semibold">Draft Year</label>
            <InputNumber
              v-model="singleYear"
              inputId="year"
              :min="1936"
              :max="currentYear"
              :disabled="isLoading"
              placeholder="Enter year (e.g., 2024)"
              class="w-full"
            />
            <small class="text-muted">
              Available years: 1936 - {{ currentYear }}
            </small>
          </div>

          <!-- Validation -->
          <div class="flex gap-2">
            <Button
              label="Validate URL"
              icon="pi pi-check"
              severity="secondary"
              outlined
              :loading="isValidating"
              :disabled="!singleYear || isLoading"
              @click="handleValidate"
            />
          </div>

          <Message v-if="validationMessage" severity="info" :closable="false">
            {{ validationMessage }}
          </Message>
        </div>

        <!-- Multiple Years Mode -->
        <div v-else class="flex flex-column gap-3">
          <div class="flex flex-column gap-2">
            <label for="years" class="font-semibold">Draft Years</label>
            <Chips
              v-model="multipleYears"
              inputId="years"
              :disabled="isLoading"
              placeholder="Enter years and press Enter"
              class="w-full"
            />
            <small class="text-muted">
              Enter each year and press Enter. Available years: 1936 - {{ currentYear }}
            </small>
          </div>

          <Button
            label="Generate 2020-Present"
            icon="pi pi-calendar"
            severity="secondary"
            outlined
            size="small"
            :disabled="isLoading"
            @click="generateYearRange"
          />
        </div>

        <!-- Error Message -->
        <Message v-if="error" severity="error" :closable="false">
          {{ error }}
        </Message>

        <!-- Action Buttons -->
        <div class="flex gap-2 justify-content-end">
          <Button
            label="Scrape & Import"
            icon="pi pi-download"
            :loading="isLoading"
            :disabled="!canSubmit"
            @click="handleSubmit"
          />
        </div>

        <!-- Loading Indicator -->
        <div v-if="isLoading" class="flex flex-column align-items-center gap-3 p-4">
          <ProgressSpinner style="width: 50px; height: 50px" />
          <p class="text-muted">
            Scraping draft picks... This may take a few moments.
          </p>
        </div>
      </div>
    </template>
  </Card>
</template>

<style scoped>
.text-muted {
  color: var(--text-color-secondary);
}
</style>