// ──────────────────────────────────────────
// src/stores/jobStore.ts (updated)
// ──────────────────────────────────────────
//export const __jobStore_ts = `
import { defineStore } from 'pinia';
import { JobsApi } from '@/services/JobsApi';
import { JobApiService} from '@/services/Jobs';
import type { JobDTO, JobLogDTO, ScheduleItem } from '@/services/JobsApi';
import { JobRow } from '@/services/api';

const USE_SSE_LOGS = false; // feature flag; future-ready

export const useJobStore = defineStore('jobStore', {
  state: () => ({
    items: [] as JobDTO[],
    total: 0,
    page: 1,
    pageSize: 20,
    filterStatus: '' as string,
    filterType: '' as string,
    loading: false,
    current: null as JobDTO | null,
    logs: [] as JobLogDTO[],
    lastLogId: 0 as number,
    scheduling: [] as ScheduleItem[],
    // sse
    sse: null as EventSource | null,
    sseActive: false,
  }),
  actions: {
    async fetch(params?: { status?: string; type?: string; page?: number; pageSize?: number }) {
      this.loading = true;
      try {
        const p = {
          status: params?.status ?? (this.filterStatus || undefined),
          type: params?.type ?? (this.filterType || undefined),
          page: params?.page ?? this.page,
          pageSize: params?.pageSize ?? this.pageSize,
        };
        const data = await JobsApi.list(p);
        this.items = data.items;
        this.total = data.total;
        this.page = p.page!;
        this.pageSize = p.pageSize!;
      } finally {
        this.loading = false;
      }
    },
    // ✅ The createJob wrapper — uses JobsApi.queue
    async createJob(payload: { type: string; payload?: any; autoStart?: boolean }) {
      const res = await JobsApi.queue(payload)
      if (res && typeof res === 'object' && 'id' in res) {
        this.items.unshift(res)
      }
      return res
    },
  
    async detail(id: number) {
      this.current = await JobsApi.detail(id);
      this.logs = [];
      this.lastLogId = 0;
    },
    async fetchLogs(id: number, incremental = true) {
      const args = incremental && this.lastLogId ? { afterId: this.lastLogId } : undefined;
      const chunk = await JobsApi.logs(id, args);
      if (!incremental) {
        this.logs = chunk;
      } else if (chunk.length) {
        this.logs.push(...chunk);
      }
      if (this.logs.length) {
        this.lastLogId = Math.max(this.lastLogId, this.logs[this.logs.length - 1].id);
      }
    },
    resetLogs() {
      if (this.logs.length) {
        this.logs = [];
        this.lastLogId = 0;
      }
    },
    async queue(req: { type: string; payload?: any; autoStart?: boolean }) {
      const job = await JobsApi.queue(req);
      await this.fetch();
      return job;
    },
    async run(id: number) {
      await JobsApi.run(id);
      await this.detail(id);
    },
    async cancel(id: number, reason?: string) {
      await JobsApi.cancel(id, reason);
      await this.detail(id);
    },
    async fetchSchedule() {
      return this.scheduleList();
    },
    // scheduler helpers
    async scheduleAdd(args: { id: string; cron: string; job: { type: string; payload?: any }; active?: boolean }) {
      return JobsApi.schedule.add(args);
    },
    async scheduleList(): Promise<ScheduleItem[]> {
      const list = await JobsApi.schedule.list()
      this.scheduling = list
      return list
    },
    async scheduleToggle(id: string, enabled: boolean) {
      return JobsApi.schedule.toggle(id, enabled);
    },
    async scheduleRemove(id: string) {
      return JobsApi.schedule.remove(id);
    },
    // SSE controls (future):
    connectSse(jobId: number) {
      if (!USE_SSE_LOGS) return;
      this.disconnectSse();
      const es = new EventSource(`/api/jobs/\${jobId}/stream`);
      this.sse = es; this.sseActive = true;
      es.onmessage = (ev) => {
        try {
          const data: JobLogDTO = JSON.parse(ev.data);
          this.logs.push(data);
          this.lastLogId = Math.max(this.lastLogId, data.id);
        } catch {}
      };
      es.onerror = () => { this.disconnectSse(); };
    },
    disconnectSse() {
      if (this.sse) { this.sse.close(); this.sse = null; this.sseActive = false; }
    },
  },
});

