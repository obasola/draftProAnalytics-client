// src/composables/useJobPolling.ts
import { ref, onUnmounted } from 'vue';
import type { Job } from '../types/Job';
import { useJobStore } from '@/stores/profootball/JobStore';

export function useJobPolling(intervalMs = 3000) {
  const jobStore = useJobStore();
  const isPolling = ref(false);
  const pollingIntervalId = ref<number | null>(null);

  function startPolling(jobId: number, onComplete?: (job: Job) => void): void {
    if (isPolling.value) {
      return;
    }

    isPolling.value = true;

    pollingIntervalId.value = window.setInterval(async () => {
      try {
        const job = await jobStore.refreshJobStatus(jobId);
        
        // Stop polling if job is complete
        if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(job.status)) {
          stopPolling();
          onComplete?.(job);
        }
      } catch (error) {
        console.error('Error polling job status:', error);
      }
    }, intervalMs);
  }

  function stopPolling(): void {
    if (pollingIntervalId.value !== null) {
      clearInterval(pollingIntervalId.value);
      pollingIntervalId.value = null;
    }
    isPolling.value = false;
  }

  // Cleanup on unmount
  onUnmounted(() => {
    stopPolling();
  });

  return {
    isPolling,
    startPolling,
    stopPolling,
  };
}