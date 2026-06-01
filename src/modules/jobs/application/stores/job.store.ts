import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { jobApi } from '../../infrastructure/jobApi';
import type {
  AddJobScheduleRequest,
  Job,
  JobLog,
  JobPageRequest,
  JobSchedule,
  QueueJobRequest,
} from '../../domain/job.types';

export const useJobsModuleStore = defineStore('jobsModule', () => {
  const jobs = ref<readonly Job[]>([]);
  const total = ref<number>(0);
  const currentJob = ref<Job | null>(null);
  const currentJobLogs = ref<readonly JobLog[]>([]);
  const schedules = ref<readonly JobSchedule[]>([]);
  const loading = ref<boolean>(false);

  const hasActiveJobs = computed<boolean>(() => {
    return jobs.value.some((job) => ['PENDING', 'QUEUED', 'RUNNING'].includes(job.status));
  });

  const fetchJobs = async (request: JobPageRequest): Promise<void> => {
    loading.value = true;

    try {
      const result = await jobApi.listJobs(request);
      jobs.value = result.items;
      total.value = result.total;
    } finally {
      loading.value = false;
    }
  };

  const fetchJob = async (jobId: number): Promise<void> => {
    currentJob.value = await jobApi.getJob(jobId);
  };

  const fetchJobLogs = async (jobId: number): Promise<void> => {
    currentJobLogs.value = await jobApi.getJobLogs(jobId);
  };

  const queueJob = async (request: QueueJobRequest): Promise<Job> => {
    const job = await jobApi.queueJob(request);
    await fetchJobs({ page: 1, pageSize: 25 });
    return job;
  };

  const runJob = async (jobId: number): Promise<void> => {
    currentJob.value = await jobApi.runJob(jobId);
    await fetchJobs({ page: 1, pageSize: 25 });
  };

  const cancelJob = async (jobId: number): Promise<void> => {
    currentJob.value = await jobApi.cancelJob(jobId);
    await fetchJobs({ page: 1, pageSize: 25 });
  };

  const fetchSchedules = async (): Promise<void> => {
    schedules.value = await jobApi.listSchedules();
  };

  const addSchedule = async (request: AddJobScheduleRequest): Promise<void> => {
    await jobApi.addSchedule(request);
    await fetchSchedules();
  };

  const toggleSchedule = async (scheduleId: string, enabled: boolean): Promise<void> => {
    await jobApi.toggleSchedule(scheduleId, enabled);
    await fetchSchedules();
  };

  const removeSchedule = async (scheduleId: string): Promise<void> => {
    await jobApi.removeSchedule(scheduleId);
    await fetchSchedules();
  };

  return {
    jobs,
    total,
    currentJob,
    currentJobLogs,
    schedules,
    loading,
    hasActiveJobs,
    fetchJobs,
    fetchJob,
    fetchJobLogs,
    queueJob,
    runJob,
    cancelJob,
    fetchSchedules,
    addSchedule,
    toggleSchedule,
    removeSchedule,
  };
});
