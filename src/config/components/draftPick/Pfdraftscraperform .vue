<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import InputNumber from 'primevue/inputnumber';
import Card from 'primevue/card';
import Message from 'primevue/message';
import { useJobStore } from '@/stores/profootball/JobStore';

const router = useRouter();
const jobStore = useJobStore();

const year = ref<number>(new Date().getFullYear());
const isSubmitting = ref(false);
const errorMessage = ref<string | null>(null);

const currentYear = new Date().getFullYear();
const minYear = 1936; // First NFL Draft year

const isValidYear = computed(() => {
  return year.value >= minYear && year.value <= currentYear;
});

const canSubmit = computed(() => {
  return isValidYear.value && !isSubmitting.value;
});

/*
await jobStore.createJob({
  type: 'IMPORT_SCORES_WEEK',
  payload: { seasonYear: 2025, seasonType: 2, week: 7 },
});
*/
async function handleSubmit() {
  if (!canSubmit.value) {
    return;
  }

  errorMessage.value = null;
  isSubmitting.value = true;

  try {
    const job = await jobStore.createPFDraftScraperJob(year.value);
    
    // Navigate to job detail page
    router.push({ name: 'JobDetail', params: { id: job.id } });
  } catch (error) {
    errorMessage.value = error instanceof Error 
      ? error.message 
      : 'Failed to start draft scraper';
  } finally {
    isSubmitting.value = false;
  }
}

function setCurrentYear() {
  year.value = currentYear;
}

function setPreviousYear() {
  year.value = currentYear - 1;
}
</script>

<template>
  <Card>
    <template #title>
      <div class="flex align-items-center gap-2">
        <i class="pi pi-download" />
        <span>Import NFL Draft Data</span>
      </div>
    </template>

    <template #content>
      <div class="flex flex-column gap-4">
        <Message 
          v-if="errorMessage" 
          severity="error" 
          :closable="true"
          @close="errorMessage = null"
        >
          {{ errorMessage }}
        </Message>

        <div class="flex flex-column gap-2">
          <label for="year" class="font-semibold">Draft Year</label>
          <InputNumber
            id="year"
            v-model="year"
            :min="minYear"
            :max="currentYear"
            :useGrouping="false"
            :disabled="isSubmitting"
            placeholder="Enter draft year"
            class="w-full"
          />
          <small class="text-color-secondary">
            Enter a year between {{ minYear }} and {{ currentYear }}
          </small>
        </div>

        <div class="flex gap-2">
          <Button
            label="Current Year"
            icon="pi pi-calendar"
            severity="secondary"
            size="small"
            outlined
            :disabled="isSubmitting"
            @click="setCurrentYear"
          />
          <Button
            label="Previous Year"
            icon="pi pi-calendar-minus"
            severity="secondary"
            size="small"
            outlined
            :disabled="isSubmitting"
            @click="setPreviousYear"
          />
        </div>

        <div class="pt-3 border-top-1 border-300">
          <p class="text-sm text-color-secondary mb-3">
            This will scrape draft pick data from Pro Football Reference for the selected year,
            including player names, positions, teams, and colleges.
          </p>
          
          <Button
            label="Start Import"
            icon="pi pi-play"
            :loading="isSubmitting"
            :disabled="!canSubmit"
            @click="handleSubmit"
            class="w-full"
          />
        </div>
      </div>
    </template>
  </Card>
</template>

<style scoped>
/* Add any component-specific styles here */
</style>