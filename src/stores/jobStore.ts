import { defineStore } from 'pinia'
import axios from 'axios'

export type Job = {
  id: number; type: string; status: 'pending'|'in_progress'|'completed'|'failed'|'canceled';
  createdAt: string; startedAt?: string; finishedAt?: string;
  resultCode?: string; resultJson?: any; payload?: any;
}

export type JobLog = { id: number; jobId: number; level: 'info'|'warn'|'error'; message: string; createdAt: string }

export const useJobStore = defineStore('jobStore', {
  state: () => ({ jobs: [] as Job[], logs: [] as JobLog[], current: null as Job | null }),
  actions: {
    async fetchJobs(status?: string) {
      const { data } = await axios.get<Job[]>(`/api/jobs`, { params: { status } })
      this.jobs = data
    },
    async fetchJob(id: number) {
      const { data } = await axios.get<Job>(`/api/jobs/${id}`)
      this.current = data
    },
    async fetchLogs(id: number) {
      const { data } = await axios.get<JobLog[]>(`/api/jobs/${id}/logs`)
      this.logs = data
    },
    async enqueueImport(year: number, seasons: ('pre'|'reg'|'post')[]) {
      const { data } = await axios.post(`/api/jobs/import-nfl-season`, { year, seasons })
      return data // { jobId, status }
    }
  }
})
