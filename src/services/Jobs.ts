import axios from './http';

export interface JobDto {
  id: number;
  type: string;
  status: string; // pending|running|completed|failed|canceled
  createdAt: string;
  startedAt?: string | null;
  finishedAt?: string | null;
  cancelAt?: string | null;
  cancelReason?: string | null;
  resultCode?: string | null;
  resultJson?: unknown | null;
}

export interface JobLogDto {
  id: number;
  jobId: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  createdAt: string; // ISO
}

export interface ListResponse<T> { total: number; items: T[] }
export interface ScheduleItem { id: string; cron: string; enabled: boolean }

export interface QueueJobBody { type: string; payload?: any; autoStart?: boolean }
export interface ToggleBody { enabled: boolean }
export interface CancelBody { reason?: string }

export const JobApiService = {
  list(params: { status?: string; type?: string; page?: number; pageSize?: number }): Promise<ListResponse<JobDto>> {
    return axios.get('/jobs', { params }).then(r => r.data);
  },
  detail(id: number): Promise<JobDto> {
    return axios.get(`/jobs/${id}`).then(r => r.data);
  },
  logs(id: number, afterId?: number): Promise<JobLogDto[]> {
    return axios.get(`/jobs/${id}/logs`, { params: { afterId } }).then(r => r.data);
  },
  queue(body: QueueJobBody): Promise<JobDto> {
    return axios.post('/jobs', body).then(r => r.data);
  },
  run(id: number): Promise<JobDto> {
    return axios.post(`/jobs/${id}/run`).then(r => r.data);
  },
  cancel(id: number, body?: CancelBody): Promise<JobDto> {
    return axios.post(`/jobs/${id}/cancel`, body).then(r => r.data);
  },
  schedList(): Promise<ScheduleItem[]> {
    return axios.get('/jobs/schedule').then(r => r.data);
  },
  schedAdd(body: { id: string; cron: string; job: QueueJobBody; active?: boolean }): Promise<unknown> {
    return axios.post('/jobs/schedule', body).then(r => r.data);
  },
  schedToggle(id: string, body: ToggleBody): Promise<unknown> {
    return axios.post(`/jobs/schedule/${id}/toggle`, body).then(r => r.data);
  },
  schedRemove(id: string): Promise<unknown> {
    return axios.delete(`/jobs/schedule/${id}`).then(r => r.data);
  },
};
