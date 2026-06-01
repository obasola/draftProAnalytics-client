import api from '@/services/api';
import type { JobStatus } from '../domain/job.types';
import type {
  ImportNflScheduleRequest,
  ImportNflScheduleResult,
  JobQueueStatusResult,
  SeasonScheduleLoadJobRow,
} from '../domain/seasonScheduleLoad.types';

interface RawImportNflScheduleResponse {
  readonly id?: number;
  readonly jobId?: number;
  readonly type?: string;
  readonly status?: string;
  readonly message?: string;
  readonly job?: {
    readonly id?: number;
    readonly jobId?: number;
    readonly type?: string;
    readonly status?: string;
  };
}

interface RawJobQueueResponse {
  readonly id?: number;
  readonly jobId?: number;
  readonly type?: string;
  readonly status?: string;
  readonly resultCode?: string | null;
  readonly cancelReason?: string | null;
  readonly error?: string | null;
  readonly createdAt?: string | null;
  readonly startedAt?: string | null;
  readonly finishedAt?: string | null;
}

const normalizeJobStatus = (status: string | undefined): JobStatus => {
  switch ((status ?? '').toUpperCase()) {
    case 'PENDING':
      return 'PENDING';
    case 'QUEUED':
      return 'QUEUED';
    case 'RUNNING':
      return 'RUNNING';
    case 'COMPLETED':
      return 'COMPLETED';
    case 'FAILED':
      return 'FAILED';
    case 'CANCELLED':
      return 'CANCELLED';
    default:
      return 'UNKNOWN';
  }
};

const resolveJobId = (response: RawImportNflScheduleResponse): number => {
  const resolvedJobId = response.jobId ?? response.id ?? response.job?.jobId ?? response.job?.id;

  if (typeof resolvedJobId !== 'number' || Number.isNaN(resolvedJobId)) {
    throw new Error('NFL schedule import response did not include a valid job id.');
  }

  return resolvedJobId;
};

const resolveJobType = (response: RawImportNflScheduleResponse): string => {
  return response.type ?? response.job?.type ?? 'IMPORT_NFL_SCHEDULE';
};

export const seasonScheduleImportApi = {
  async importNflSchedule(request: ImportNflScheduleRequest): Promise<ImportNflScheduleResult> {
    const response = await api.post<RawImportNflScheduleResponse>('/imports/nfl-schedule', request);
    const body = response.data;

    return {
      jobId: resolveJobId(body),
      type: resolveJobType(body),
      status: normalizeJobStatus(body.status ?? body.job?.status),
      message: body.message,
    };
  },

  async getJobStatus(jobId: number): Promise<JobQueueStatusResult> {
    const response = await api.get<RawJobQueueResponse>(`/jobs/${jobId}`);
    const body = response.data;
    const resolvedJobId = body.id ?? body.jobId ?? jobId;

    return {
      id: resolvedJobId,
      type: body.type ?? 'IMPORT_NFL_SCHEDULE',
      status: normalizeJobStatus(body.status),
      resultCode: body.resultCode,
      cancelReason: body.cancelReason,
      error: body.error,
      createdAt: body.createdAt,
      startedAt: body.startedAt,
      finishedAt: body.finishedAt,
    };
  },

  toJobRow(result: ImportNflScheduleResult, request: ImportNflScheduleRequest): SeasonScheduleLoadJobRow {
    return {
      jobId: result.jobId,
      seasonYear: request.seasonYear,
      seasonType: request.seasonType,
      week: request.week,
      status: result.status,
      type: result.type,
      message: result.message,
      submittedAt: new Date().toISOString(),
    };
  },

  applyStatusUpdate(row: SeasonScheduleLoadJobRow, statusResult: JobQueueStatusResult): SeasonScheduleLoadJobRow {
    return {
      ...row,
      status: statusResult.status,
      type: statusResult.type,
      message: statusResult.error ?? statusResult.cancelReason ?? statusResult.resultCode ?? row.message,
      lastCheckedAt: new Date().toISOString(),
    };
  },
};
