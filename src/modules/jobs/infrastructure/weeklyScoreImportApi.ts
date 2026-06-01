import { jobApi } from './jobApi';
import type { Job } from '../domain/job.types';
import type { ImportWeeklyScoresJobRow, ImportWeeklyScoresRequest } from '../domain/weeklyScoreImport.types';

export const weeklyScoreImportApi = {
  async importWeeklyScores(request: ImportWeeklyScoresRequest): Promise<Job> {
    return jobApi.queueJob({
      type: 'IMPORT_SCORES_WEEK',
      payload: {
        seasonYear: request.seasonYear,
        seasonType: request.seasonType,
        week: request.week,
      },
      autoStart: request.autoStart,
    });
  },

  async getJobStatus(jobId: number): Promise<Job> {
    return jobApi.getJob(jobId);
  },

  toJobRow(job: Job, request: ImportWeeklyScoresRequest): ImportWeeklyScoresJobRow {
    return {
      jobId: job.id,
      seasonYear: request.seasonYear,
      seasonType: request.seasonType,
      week: request.week,
      status: job.status,
      message: job.resultCode ?? job.cancelReason ?? null,
      submittedAt: new Date().toISOString(),
    };
  },

  applyStatusUpdate(row: ImportWeeklyScoresJobRow, job: Job): ImportWeeklyScoresJobRow {
    return {
      ...row,
      status: job.status,
      message: job.resultCode ?? job.cancelReason ?? row.message ?? null,
      lastCheckedAt: new Date().toISOString(),
    };
  },
};
