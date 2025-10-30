// src/services/JobsApi.ts
import http from './http'

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'canceled'
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'
export interface ScheduleItem { id: string; cron: string; enabled: boolean }

export type JobDTO = {
  id: number
  type: string
  status: JobStatus
  createdAt: string
  startedAt?: string | null
  finishedAt?: string | null
  cancelAt?: string | null
  cancelReason?: string | null
  resultCode?: string | null
  resultJson?: any
  payload?: any
}

export type JobLogDTO = {
  id: number
  jobId: number
  level: LogLevel
  message: string
  createdAt: string
}

export type ListResponse<T> = { total: number; items: T[] }

export const JobsApi = {
  list: async (params: { status?: string; type?: string; page?: number; pageSize?: number }) =>
    (await http.get<ListResponse<JobDTO>>('/jobs', { params })).data,

  detail: async (id: number) => (await http.get<JobDTO>(`/jobs/${id}`)).data,

  logs: async (id: number, args?: { afterId?: number }) =>
    (await http.get<JobLogDTO[]>(`/jobs/${id}/logs`, { params: args })).data,

  queue: async (req: { type: string; payload?: any; autoStart?: boolean }) =>
    (await http.post<JobDTO>('/jobs', req)).data,

  run: async (id: number) => (await http.post(`/jobs/${id}/run`, {})).data,

  cancel: async (id: number, reason?: string) =>
    (await http.post(`/jobs/${id}/cancel`, { reason })).data,

  schedule: {
    add: async (args: {
      id: string
      cron: string
      job: { type: string; payload?: any }
      active?: boolean
    }) => (await http.post('/jobs/schedule', args)).data,

    list: async () =>
      (await http.get('/jobs/schedule')).data as Array<{
        id: string
        cron: string
        enabled: boolean
        req?: any
      }>,

    toggle: async (id: string, enabled: boolean) =>
      (await http.post(`/jobs/schedule/${id}/toggle`, { enabled })).data,

    remove: async (id: string) => (await http.delete(`/jobs/schedule/${id}`)).data,
  },
}
