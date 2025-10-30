// src/types/Job.ts
export enum JobType {
  PF_DRAFT_SCRAPER = 'PF_DRAFT_SCRAPER',
  ESPN_PLAYER_IMPORT = 'ESPN_PLAYER_IMPORT',
  NFL_STATS_IMPORT = 'NFL_STATS_IMPORT',
}

export enum JobStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface JobParameters {
  [key: string]: any;
}

export interface JobResult {
  itemsAdded?: number;
  itemsUpdated?: number;
  itemsSkipped?: number;
  itemsFailed?: number;
  details?: string;
  [key: string]: any;
}

export interface Job {
  id: number;
  type: JobType;
  status: JobStatus;
  progress: number;
  totalItems: number;
  processedItems: number;
  parameters?: JobParameters;
  result?: JobResult;
  error?: string;
  createdBy?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  updatedAt: string;
}

export interface CreateJobRequest {
  type: JobType;
  parameters?: JobParameters;
  createdBy?: string;
}

export interface CreatePFDraftScraperRequest {
  year: number;
  createdBy?: string;
}