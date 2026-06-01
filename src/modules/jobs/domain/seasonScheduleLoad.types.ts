import type { JobStatus } from './job.types';

export type LoadSeasonScheduleJobStatus = JobStatus;

export type NflScheduleSeasonType = 1 | 2 | 3;

export type SeasonSchedulePlanCode = 'PRESEASON' | 'REGULAR_SEASON' | 'POSTSEASON' | 'FULL_SEASON';

export interface SeasonSchedulePlanOption {
  readonly label: string;
  readonly code: SeasonSchedulePlanCode;
  readonly seasonTypes: readonly NflScheduleSeasonType[];
  readonly defaultStartWeek: number;
  readonly defaultEndWeek: number;
}

export interface ImportNflScheduleRequest {
  readonly seasonYear: number;
  readonly seasonType: NflScheduleSeasonType;
  readonly week: number;
  readonly dryRun?: boolean;
}

export interface ImportNflScheduleResult {
  readonly jobId: number;
  readonly type: string;
  readonly status: JobStatus;
  readonly message?: string;
}

export interface JobQueueStatusResult {
  readonly id: number;
  readonly type: string;
  readonly status: JobStatus;
  readonly resultCode?: string | null;
  readonly cancelReason?: string | null;
  readonly error?: string | null;
  readonly createdAt?: string | null;
  readonly startedAt?: string | null;
  readonly finishedAt?: string | null;
}

export interface SeasonScheduleLoadJobRow {
  readonly jobId: number;
  readonly seasonYear: number;
  readonly seasonType: NflScheduleSeasonType;
  readonly week: number;
  readonly status: JobStatus;
  readonly type: string;
  readonly message?: string;
  readonly submittedAt: string;
  readonly lastCheckedAt?: string;
}
