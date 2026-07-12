<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Message from 'primevue/message';
import JobTable from './JobTable.vue';
import { useJobsModuleStore } from '../../application/stores/job.store';

const emit = defineEmits<{
  (event: 'view-job', jobId: number): void;
}>();

const store = useJobsModuleStore();
const page = ref<number>(1);
const pageSize = ref<number>(25);
const errorMessage = ref<string | null>(null);

const loadJobs = async (): Promise<void> => {
  errorMessage.value = null;

  try {
    await store.fetchJobs({ page: page.value, pageSize: pageSize.value });
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to load jobs.';
  }
};

const handlePage = async (value: { page: number; pageSize: number }): Promise<void> => {
  page.value = value.page;
  pageSize.value = value.pageSize;
  await loadJobs();
};

const handleRun = async (jobId: number): Promise<void> => {
  await store.runJob(jobId);
  await loadJobs();
};

const handleCancel = async (jobId: number): Promise<void> => {
  await store.cancelJob(jobId);
  await loadJobs();
};

onMounted(() => {
  void loadJobs();
});
</script>

<template>
  <Card>
    <template #title>
      Job Queue
    </template>

    <template #content>
      <div class="job-list-toolbar">
        <Button icon="pi pi-refresh" label="Refresh" :loading="store.loading" @click="loadJobs" />
      </div>

      <Message v-if="errorMessage" severity="error" :closable="false">
        {{ errorMessage }}
      </Message>

      <JobTable
        :items="store.jobs"
        :loading="store.loading"
        :page="page"
        :pageSize="pageSize"
        :total="store.total"
        @page="handlePage"
        @view="emit('view-job', $event)"
        @run="handleRun"
        @cancel="handleCancel"
      />
    </template>
  </Card>
</template>

<style scoped>
.job-list-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.75rem;
}
</style>
