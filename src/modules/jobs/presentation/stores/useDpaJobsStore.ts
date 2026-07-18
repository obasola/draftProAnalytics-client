import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

import { DPA_JOB_STATUS } from '../../domain/NflJobTypes';
import type {
  DpaJobListQuery,
  DpaJobLogEntry,
  DpaJobStatus,
  DpaJobSummary,
  ImportNflGameScoresCommand,
  LoadNflSeasonScheduleCommand,
  LoadEspnDraftClassPlayersCommand,
  LoadEspnDraftResultsCommand,
  EnrichPlayerTeamPositionsCommand,
  SyncEspnDraftPicksToDpaCommand,
  LoadEspnTeamRostersCommand,
  SyncPostSeasonResultsCommand,
  ProcessJobQueueResult,
} from '../../domain/NflJobTypes';
import { dpaJobsApi } from '../../application/DpaJobsApi';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return 'The jobs request failed.';
};

export const useDpaJobsStore = defineStore('dpaJobs', () => {
  const jobs = ref<readonly DpaJobSummary[]>([]);
  const selectedJob = ref<DpaJobSummary | null>(null);
  const selectedJobLogs = ref<readonly DpaJobLogEntry[]>([]);
  const loading = ref<boolean>(false);
  const submitting = ref<boolean>(false);
  const processingQueue = ref<boolean>(false);
  const errorMessage = ref<string | null>(null);
  const lastQueueResult = ref<ProcessJobQueueResult | null>(null);

  const activeJobs = computed<readonly DpaJobSummary[]>(() => jobs.value.filter((job) => (
    job.status === DPA_JOB_STATUS.PENDING || job.status === DPA_JOB_STATUS.IN_PROGRESS
  )));

  const hasActiveJobs = computed<boolean>(() => activeJobs.value.length > 0);

  const enqueueLoadNflSeasonSchedule = async (command: LoadNflSeasonScheduleCommand): Promise<DpaJobSummary> => {
    submitting.value = true;
    errorMessage.value = null;

    try {
      const job = await dpaJobsApi.enqueueLoadNflSeasonSchedule(command);
      await refreshJobs({ limit: 50 });
      return job;
    } catch (error) {
      errorMessage.value = getErrorMessage(error);
      throw error;
    } finally {
      submitting.value = false;
    }
  };

  const enqueueImportNflGameScores = async (command: ImportNflGameScoresCommand): Promise<DpaJobSummary> => {
    submitting.value = true;
    errorMessage.value = null;

    try {
      const job = await dpaJobsApi.enqueueImportNflGameScores(command);
      await refreshJobs({ limit: 50 });
      return job;
    } catch (error) {
      errorMessage.value = getErrorMessage(error);
      throw error;
    } finally {
      submitting.value = false;
    }
  };


  const enqueueLoadEspnDraftClassPlayers = async (command: LoadEspnDraftClassPlayersCommand): Promise<DpaJobSummary> => {
    submitting.value = true; errorMessage.value = null;
    try { const job = await dpaJobsApi.enqueueLoadEspnDraftClassPlayers(command); await refreshJobs({ limit: 50 }); return job; }
    catch (error) { errorMessage.value = getErrorMessage(error); throw error; } finally { submitting.value = false; }
  };
  const enqueueLoadEspnDraftResults = async (command: LoadEspnDraftResultsCommand): Promise<DpaJobSummary> => {
    submitting.value = true; errorMessage.value = null;
    try { const job = await dpaJobsApi.enqueueLoadEspnDraftResults(command); await refreshJobs({ limit: 50 }); return job; }
    catch (error) { errorMessage.value = getErrorMessage(error); throw error; } finally { submitting.value = false; }
  };

  const enqueueSyncEspnDraftPicksToDpa = async (command: SyncEspnDraftPicksToDpaCommand): Promise<DpaJobSummary> => {
    submitting.value = true; errorMessage.value = null;
    try { const job = await dpaJobsApi.enqueueSyncEspnDraftPicksToDpa(command); await refreshJobs({ limit: 50 }); return job; }
    catch (error) { errorMessage.value = getErrorMessage(error); throw error; } finally { submitting.value = false; }
  };

  const enqueueEnrichPlayerTeamPositions = async (command: EnrichPlayerTeamPositionsCommand): Promise<DpaJobSummary> => {
    submitting.value = true; errorMessage.value = null;
    try { const job = await dpaJobsApi.enqueueEnrichPlayerTeamPositions(command); await refreshJobs({ limit: 50 }); return job; }
    catch (error) { errorMessage.value = getErrorMessage(error); throw error; } finally { submitting.value = false; }
  };

  const enqueueLoadEspnTeamRosters = async (command: LoadEspnTeamRostersCommand): Promise<DpaJobSummary> => {
    submitting.value = true; errorMessage.value = null;
    try { const job = await dpaJobsApi.enqueueLoadEspnTeamRosters(command); await refreshJobs({ limit: 50 }); return job; }
    catch (error) { errorMessage.value = getErrorMessage(error); throw error; } finally { submitting.value = false; }
  };

  const enqueueSyncPostSeasonResults = async (command: SyncPostSeasonResultsCommand): Promise<DpaJobSummary> => {
    submitting.value = true; errorMessage.value = null;
    try { const job = await dpaJobsApi.enqueueSyncPostSeasonResults(command); await refreshJobs({ limit: 50 }); return job; }
    catch (error) { errorMessage.value = getErrorMessage(error); throw error; } finally { submitting.value = false; }
  };

  const processJobQueue = async (take: number): Promise<ProcessJobQueueResult> => {
    processingQueue.value = true;
    errorMessage.value = null;

    try {
      const result = await dpaJobsApi.processJobQueue({ take });
      lastQueueResult.value = result;
      await refreshJobs({ limit: 50 });
      return result;
    } catch (error) {
      errorMessage.value = getErrorMessage(error);
      throw error;
    } finally {
      processingQueue.value = false;
    }
  };

  const refreshJobs = async (query: DpaJobListQuery = { limit: 50 }): Promise<void> => {
    loading.value = true;
    errorMessage.value = null;

    try {
      jobs.value = await dpaJobsApi.listJobs(query);
    } catch (error) {
      errorMessage.value = getErrorMessage(error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const readJob = async (jobId: number): Promise<void> => {
    loading.value = true;
    errorMessage.value = null;

    try {
      selectedJob.value = await dpaJobsApi.readJob(jobId);
    } catch (error) {
      errorMessage.value = getErrorMessage(error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const readJobLogs = async (jobId: number): Promise<void> => {
    loading.value = true;
    errorMessage.value = null;

    try {
      selectedJobLogs.value = await dpaJobsApi.readJobLogs(jobId);
    } catch (error) {
      errorMessage.value = getErrorMessage(error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const cancelJob = async (jobId: number, reason: string): Promise<void> => {
    submitting.value = true;
    errorMessage.value = null;

    try {
      await dpaJobsApi.cancelJob(jobId, reason);
      await refreshJobs({ limit: 50 });
    } catch (error) {
      errorMessage.value = getErrorMessage(error);
      throw error;
    } finally {
      submitting.value = false;
    }
  };

  const clearSelectedJob = (): void => {
    selectedJob.value = null;
    selectedJobLogs.value = [];
  };

  const clearError = (): void => {
    errorMessage.value = null;
  };

  return {
    jobs,
    selectedJob,
    selectedJobLogs,
    loading,
    submitting,
    processingQueue,
    errorMessage,
    lastQueueResult,
    activeJobs,
    hasActiveJobs,
    enqueueLoadNflSeasonSchedule,
    enqueueImportNflGameScores,
    enqueueLoadEspnDraftClassPlayers,
    enqueueLoadEspnDraftResults,
    enqueueEnrichPlayerTeamPositions,
    enqueueSyncEspnDraftPicksToDpa,
    enqueueLoadEspnTeamRosters,
    enqueueSyncPostSeasonResults,
    processJobQueue,
    refreshJobs,
    readJob,
    readJobLogs,
    cancelJob,
    clearSelectedJob,
    clearError,
  };
});
