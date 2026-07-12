import api from '@/services/api';
import type {
  AddJobScheduleRequest,
  Job,
  JobLog,
  JobPageRequest,
  JobPageResult,
  JobPayload,
  JobSchedule,
  JobStatus,
  QueueJobRequest,
} from '../domain/job.types';

interface RawJob {
  readonly id?: number;
  readonly jobId?: number;
  readonly type?: string;
  readonly status?: string;
  readonly payload?: JobPayload | null;
  readonly resultCode?: string | null;
  readonly resultJson?: JobPayload | null;
  readonly cancelReason?: string | null;
  readonly createdAt?: string | null;
  readonly startedAt?: string | null;
  readonly finishedAt?: string | null;
}

interface RawJobPage {
  readonly items?: readonly RawJob[];
  readonly jobs?: readonly RawJob[];
  readonly data?: readonly RawJob[];
  readonly total?: number;
  readonly totalCount?: number;
}

interface RawJobLog {
  readonly id?: number;
  readonly jobId?: number;
  readonly level?: string;
  readonly message?: string;
  readonly createdAt?: string;
}

interface RawJobSchedule {
  readonly id?: string;
  readonly cron?: string;
  readonly enabled?: boolean;
  readonly active?: boolean;
  readonly req?: JobPayload;
}

const normalizeStatus = (status: string | undefined): JobStatus => {
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

const normalizeJob = (raw: RawJob): Job => {
  const id = raw.id ?? raw.jobId;

  if (typeof id !== 'number') {
    throw new Error('Job response did not include a valid job id.');
  }

  return {
    id,
    type: raw.type ?? 'UNKNOWN_JOB_TYPE',
    status: normalizeStatus(raw.status),
    payload: raw.payload,
    resultCode: raw.resultCode,
    resultJson: raw.resultJson,
    cancelReason: raw.cancelReason,
    createdAt: raw.createdAt,
    startedAt: raw.startedAt,
    finishedAt: raw.finishedAt,
  };
};

const normalizeJobLog = (raw: RawJobLog): JobLog => {
  if (typeof raw.id !== 'number' || typeof raw.jobId !== 'number') {
    throw new Error('Job log response did not include valid ids.');
  }

  return {
    id: raw.id,
    jobId: raw.jobId,
    level: raw.level ?? 'INFO',
    message: raw.message ?? '',
    createdAt: raw.createdAt ?? new Date().toISOString(),
  };
};

const normalizeSchedule = (raw: RawJobSchedule): JobSchedule => {
  if (!raw.id || !raw.cron) {
    throw new Error('Job schedule response did not include id and cron.');
  }

  return {
    id: raw.id,
    cron: raw.cron,
    enabled: raw.enabled ?? raw.active ?? false,
    req: raw.req,
  };
};

const resolveJobItems = (body: RawJobPage | readonly RawJob[]): readonly RawJob[] => {
  if (Array.isArray(body)) {
    return body;
  }

  return body.items ?? body.jobs ?? body.data ?? [];
};

const resolveJobTotal = (body: RawJobPage | readonly RawJob[], fallback: number): number => {
  if (Array.isArray(body)) {
    return body.length;
  }

  return body.total ?? body.totalCount ?? fallback;
};

export const jobApi = {
  async listJobs(request: JobPageRequest): Promise<JobPageResult> {
    const response = await api.get<RawJobPage | readonly RawJob[]>('/jobs', {
      params: {
        page: request.page,
        pageSize: request.pageSize,
        status: request.status ?? undefined,
        type: request.type ?? undefined,
      },
    });

    const rawItems = resolveJobItems(response.data);

    return {
      items: rawItems.map(normalizeJob),
      total: resolveJobTotal(response.data, rawItems.length),
    };
  },

  async getJob(jobId: number): Promise<Job> {
    const response = await api.get<RawJob>(`/jobs/${jobId}`);
    return normalizeJob(response.data);
  },

  async getJobLogs(jobId: number): Promise<readonly JobLog[]> {
    const response = await api.get<readonly RawJobLog[]>(`/jobs/${jobId}/logs`);
    return response.data.map(normalizeJobLog);
  },

  async queueJob(request: QueueJobRequest): Promise<Job> {
    const response = await api.post<RawJob>('/jobs', request);
    return normalizeJob(response.data);
  },

  async runJob(jobId: number): Promise<Job> {
    const response = await api.post<RawJob>(`/jobs/${jobId}/run`);
    return normalizeJob(response.data);
  },

  async cancelJob(jobId: number): Promise<Job> {
    const response = await api.post<RawJob>(`/jobs/${jobId}/cancel`);
    return normalizeJob(response.data);
  },

  async listSchedules(): Promise<readonly JobSchedule[]> {
    const response = await api.get<readonly RawJobSchedule[]>('/jobs/schedules');
    return response.data.map(normalizeSchedule);
  },

  async addSchedule(request: AddJobScheduleRequest): Promise<void> {
    await api.post('/jobs/schedules', request);
  },

  async toggleSchedule(scheduleId: string, enabled: boolean): Promise<void> {
    await api.patch(`/jobs/schedules/${scheduleId}`, { enabled });
  },

  async removeSchedule(scheduleId: string): Promise<void> {
    await api.delete(`/jobs/schedules/${scheduleId}`);
  },
};
