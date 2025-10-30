// src/composables/useJobsService.ts

import { ref, Ref } from 'vue';
import { apiService as apiClient } from '@/services/api';

export interface Job {
  id: string;
  type: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface JobsState {
  jobs: Map<string, Job>;
}

class JobsService {
  private state: Ref<JobsState>;

  constructor() {
    this.state = ref<JobsState>({
      jobs: new Map()
    });
  }

  async fetchJobStatus(jobId: string): Promise<Job> {
    const response = await apiClient.get<{ success: boolean; job: Job }>(
      `/api/jobs/${jobId}`
    );
    
    if (response.data.success) {
      this.state.value.jobs.set(jobId, response.data.job);
      return response.data.job;
    }
    
    throw new Error('Failed to fetch job status');
  }

  getJobStatus(jobId: string): Job | undefined {
    return this.state.value.jobs.get(jobId);
  }

  async fetchAllJobs(): Promise<Job[]> {
    const response = await apiClient.get<{ success: boolean; jobs: Job[] }>(
      '/api/jobs'
    );
    
    if (response.data.success) {
      response.data.jobs.forEach(job => {
        this.state.value.jobs.set(job.id, job);
      });
      return response.data.jobs;
    }
    
    return [];
  }

  clearJob(jobId: string): void {
    this.state.value.jobs.delete(jobId);
  }

  clearAllJobs(): void {
    this.state.value.jobs.clear();
  }
}

const jobsService = new JobsService();

export function useJobsService() {
  return jobsService;
}