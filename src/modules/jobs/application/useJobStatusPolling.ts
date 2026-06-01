import { onBeforeUnmount, ref } from 'vue';

export interface JobStatusPollingOptions {
  readonly intervalMs?: number;
}

export const useJobStatusPolling = (options: JobStatusPollingOptions = {}) => {
  const isPolling = ref<boolean>(false);
  let pollingTimerId: ReturnType<typeof window.setInterval> | undefined;
  const intervalMs = options.intervalMs ?? 3000;

  const stopPolling = (): void => {
    if (pollingTimerId !== undefined) {
      window.clearInterval(pollingTimerId);
      pollingTimerId = undefined;
    }

    isPolling.value = false;
  };

  const startPolling = (callback: () => Promise<void> | void): void => {
    stopPolling();
    isPolling.value = true;

    pollingTimerId = window.setInterval(() => {
      void callback();
    }, intervalMs);

    void callback();
  };

  onBeforeUnmount(() => {
    stopPolling();
  });

  return {
    isPolling,
    startPolling,
    stopPolling,
  };
};
