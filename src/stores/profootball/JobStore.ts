// src/stores/jobStore.ts
import { jobService, JobSearchParams } from '@/services/jobService';
import { Job } from '@/types/Job';
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
 
export const useJobStore = defineStore('job', () => {
  // State
  const jobs = ref<Job[]>([]);
  const currentJob = ref<Job | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const pendingJobs = computed(() => 
    jobs.value.filter(job => job.status === 'PENDING')
  );

  const runningJobs = computed(() => 
    jobs.value.filter(job => job.status === 'RUNNING')
  );

  const completedJobs = computed(() => 
    jobs.value.filter(job => job.status === 'COMPLETED')
  );

  const failedJobs = computed(() => 
    jobs.value.filter(job => job.status === 'FAILED')
  );

  // Actions
  async function createPFDraftScraperJob(year: number, createdBy?: string): Promise<Job> {
    loading.value = true;
    error.value = null;

    try {
      const job = await jobService.createPFDraftScraperJob({ year, createdBy });
      jobs.value.unshift(job);
      return job;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create job';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchJobs(params?: JobSearchParams): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      jobs.value = await jobService.listJobs(params);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch jobs';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchJob(id: number): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      currentJob.value = await jobService.getJob(id);
      
      // Update in list if exists
      const index = jobs.value.findIndex(j => j.id === id);
      if (index !== -1) {
        jobs.value[index] = currentJob.value;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch job';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function refreshJobStatus(id: number): Promise<Job> {
    try {
      const job = await jobService.getJobStatus(id);
      
      // Update in list
      const index = jobs.value.findIndex(j => j.id === id);
      if (index !== -1) {
        jobs.value[index] = job;
      }
      
      // Update current if it's the same job
      if (currentJob.value?.id === id) {
        currentJob.value = job;
      }
      
      return job;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to refresh job status';
      throw err;
    }
  }

  async function cancelJob(id: number): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      await jobService.cancelJob(id);
      await fetchJob(id); // Refresh to get updated status
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to cancel job';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function clearError(): void {
    error.value = null;
  }

  function clearCurrentJob(): void {
    currentJob.value = null;
  }

  return {
    // State
    jobs,
    currentJob,
    loading,
    error,
    // Computed
    pendingJobs,
    runningJobs,
    completedJobs,
    failedJobs,
    // Actions
    createPFDraftScraperJob,
    fetchJobs,
    fetchJob,
    refreshJobStatus,
    cancelJob,
    clearError,
    clearCurrentJob,
  };
});