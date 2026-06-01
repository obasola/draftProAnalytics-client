export type JobStatus = 'PENDING' | 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'UNKNOWN';

export type JobType =
  | 'IMPORT_NFL_SCHEDULE'
  | 'IMPORT_SCORES_WEEK'
  | 'PF_DRAFT_SCRAPER'
  | 'ESPN_PLAYER_IMPORT'
  | 'NFL_STATS_IMPORT'
  | string;

export type JobPayload = Record<string, unknown>;

export interface Job {
  readonly id: number;
  readonly type: JobType;
  readonly status: JobStatus;
  readonly payload?: JobPayload | null;
  readonly resultCode?: string | null;
  readonly resultJson?: JobPayload | null;
  readonly cancelReason?: string | null;
  readonly createdAt?: string | null;
  readonly startedAt?: string | null;
  readonly finishedAt?: string | null;
}

export interface JobLog {
  readonly id: number;
  readonly jobId: number;
  readonly level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | string;
  readonly message: string;
  readonly createdAt: string;
}

export interface JobPageRequest {
  readonly page: number;
  readonly pageSize: number;
  readonly status?: JobStatus | null;
  readonly type?: string | null;
}

export interface JobPageResult {
  readonly items: readonly Job[];
  readonly total: number;
}

export interface QueueJobRequest {
  readonly type: string;
  readonly payload: JobPayload;
  readonly autoStart: boolean;
}

export interface JobSchedule {
  readonly id: string;
  readonly cron: string;
  readonly enabled: boolean;
  readonly req?: JobPayload;
}

export interface AddJobScheduleRequest {
  readonly id: string;
  readonly cron: string;
  readonly job: {
    readonly type: string;
    readonly payload: JobPayload;
  };
  readonly active: boolean;
}
