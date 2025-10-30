// src/services/jobService.ts
import { apiService } from './api';
import type { 
  Job, 
  CreateJobRequest, 
  CreatePFDraftScraperRequest,
  JobType,
  JobStatus 
} from '../types/Job';

export interface JobSearchParams {
  type?: JobType;
  status?: JobStatus;
  createdBy?: string;
  fromDate?: string;
  toDate?: string;
}

class JobService {
  private readonly basePath = '/jobs';

  async createJob(request: CreateJobRequest): Promise<Job> {
    const response = await apiService.post<{ success: boolean; data: Job }>(
      this.basePath,
      request
    );
    return response.data.data;
  }

  async createPFDraftScraperJob(request: CreatePFDraftScraperRequest): Promise<Job> {
    const response = await apiService.post<{ success: boolean; data: Job }>(
      `${this.basePath}/pf-draft-scraper`,
      request
    );
    return response.data.data;
  }

  async getJob(id: number): Promise<Job> {
    const response = await apiService.get<{ success: boolean; data: Job }>(
      `${this.basePath}/${id}`
    );
    return response.data.data;
  }

  async listJobs(params?: JobSearchParams): Promise<Job[]> {
    const response = await apiService.get<{ success: boolean; data: Job[] }>(
      this.basePath,
      { params }
    );
    return response.data.data;
  }

  async cancelJob(id: number): Promise<void> {
    await apiService.post<{ success: boolean; message: string }>(
      `${this.basePath}/${id}/cancel`
    );
  }

  async getJobStatus(id: number): Promise<Job> {
    const response = await apiService.get<{ success: boolean; data: Job }>(
      `${this.basePath}/${id}/status`
    );
    return response.data.data;
  }
}

export const jobService = new JobService();