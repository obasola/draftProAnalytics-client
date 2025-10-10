// src/services/api.ts
import axios, { AxiosInstance, AxiosResponse, AxiosError, AxiosHeaders } from 'axios'

/* ==================== base URL resolution ==================== */
const dropTrailingSlash = (u?: string) => (u ? u.replace(/\/+$/, '') : '')
const hasApiSuffix = (u: string) => /\/api(?:\/|$)/i.test(u)

/**
 * If VITE_API_BASE_URL is set, use it as-is (may or may not include /api).
 * Otherwise:
 *   - when on http://localhost:5173  -> http://localhost:5000/api
 *   - else                            -> ${origin}/api  (works behind nginx)
 */
function computeBase(): string {
  const fromEnv = dropTrailingSlash(import.meta.env.VITE_API_BASE_URL?.trim())
  if (fromEnv) return fromEnv

  const origin = window.location.origin
  if (origin.includes('localhost:5173')) return 'http://localhost:5000/api'
  return hasApiSuffix(origin) ? origin : `${origin}/api`
}

export const API_BASE = dropTrailingSlash(computeBase())

/* ==================== shared axios instance ==================== */
const axiosInstance = axios.create({
  baseURL: API_BASE, // e.g. http://localhost:5000/api  OR  https://draftproanalytics.local/api
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
  withCredentials: true,
})

/* ==================== interceptors ==================== */
function setupInterceptors(instance: AxiosInstance): void {
  instance.interceptors.request.use(
    config => {
      const token = localStorage.getItem('auth_token')
      if (token) {
        const headers = (config.headers ??= new AxiosHeaders())
        headers.set('Authorization', `Bearer ${token}`)
        // optionally: headers.set('Content-Type', 'application/json');
      }
      const method = (config.method || 'get').toUpperCase()
      const base = config.baseURL?.replace(/\/+$/, '') || ''
      const url = `${base}${config.url || ''}`
      console.log(`🔄 ${method} ${url}`)
      return config
    },
    error => {
      console.error('❌ Request Error:', error)
      return Promise.reject(error)
    }
  )

  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      const method = (response.config.method || 'get').toUpperCase()
      console.log(`✅ ${method} ${response.config.url} - ${response.status}`)
      return response
    },
    (error: AxiosError) => {
      const method = (error.config?.method || 'get').toUpperCase()
      const url = error.config?.url || '(unknown url)'
      const status = error.response?.status
      console.error(`❌ ${method} ${url} - ${status ?? 'NO_RESPONSE'}`)

      switch (status) {
        case 401:
          localStorage.removeItem('auth_token')
          window.location.href = '/login'
          break
        case 403:
          console.error('Access forbidden')
          break
        case 404:
          console.error('Resource not found')
          break
        case 500:
          console.error('Server error')
          break
        default:
          console.error('API Error:', error.response?.data || error.message)
      }
      return Promise.reject(error)
    }
  )
}
setupInterceptors(axiosInstance)

/* ==================== safe path helpers ==================== */
const ensureLeadingSlash = (p: string) => (p.startsWith('/') ? p : `/${p}`)
/** Be defensive: if callers accidentally pass "/api/xyz", strip the leading "/api" */
const sanitizePath = (p: string) => ensureLeadingSlash(p).replace(/^\/api(\/|$)/i, '/')

/* ==================== domain types ==================== */
export type JobType = 'PLAYER_SYNC' | 'TEAM_SYNC' | 'FULL_SYNC' | 'VALIDATION' | 'ENRICHMENT'

export type JobStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'

export interface JobRow {
  id: number
  job_type: JobType
  status: JobStatus
  started_at: string | null
  completed_at: string | null
  total_records: number | null
  processed_records: number | null
  failed_records: number | null
  error_message?: string | null
  created_at: string | null
  updated_at: string | null
}

export interface ScoreboardSyncResult {
  ok: boolean
  jobId?: number
  processed: number
  failed: number
  season: number | null
  seasonType: 1 | 2 | 3 | null
  week: number | null
  missingMappings: Array<{ espnGameId?: string; homeEspnId?: number; awayEspnId?: number }>
}

export type Day = 'SUN' | 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT'
export interface ScoreboardSchedule {
  enabled: boolean
  days: Day[]
  hour: number
  minute: number
  timezone: string
  mode?: 'by-date'
}

/* ==================== OO wrapper (reuses shared instance) ==================== */
class ApiService {
  private api: AxiosInstance

  constructor(instance: AxiosInstance = axiosInstance) {
    this.api = instance
  }

  // Generic HTTP methods (paths should be relative to API base, e.g., "/jobs")
  public get<T>(url: string, params?: any): Promise<AxiosResponse<T>> {
    return this.api.get<T>(sanitizePath(url), { params })
  }
  public post<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.api.post<T>(sanitizePath(url), data)
  }
  public put<T>(url: string, data: any): Promise<AxiosResponse<T>> {
    return this.api.put<T>(sanitizePath(url), data)
  }
  public patch<T>(url: string, data: any): Promise<AxiosResponse<T>> {
    return this.api.patch<T>(sanitizePath(url), data)
  }
  public delete<T>(url: string): Promise<AxiosResponse<T>> {
    return this.api.delete<T>(sanitizePath(url))
  }

  // Helper methods for common REST patterns
  public async getAll<T>(endpoint: string, params?: any): Promise<T[]> {
    const { data } = await this.get<T[]>(endpoint, params)
    return data
  }
  public async getById<T>(endpoint: string, id: number): Promise<T> {
    const { data } = await this.get<T>(`${endpoint}/${id}`)
    return data
  }
  public async create<T>(endpoint: string, payload: Omit<T, 'id'>): Promise<T> {
    const { data } = await this.post<T>(endpoint, payload)
    return data
  }
  public async update<T>(endpoint: string, id: number, payload: Partial<T>): Promise<T> {
    const { data } = await this.put<T>(`${endpoint}/${id}`, payload)
    return data
  }
  public async remove(endpoint: string, id: number): Promise<void> {
    await this.delete(`${endpoint}/${id}`)
  }

  // Job-specific helpers
  public async listJobs(limit = 50) {
    const { data } = await this.api.get<JobRow[]>('/jobs', { params: { limit } })
    return data
  }
  public async getJob(id: number) {
    const { data } = await this.api.get<JobRow>(`/jobs/${id}`)
    return data
  }
  public async kickoffTeams() {
    const { data } = await this.api.post(`/jobs/kickoff/teams`, {})
    return data
  }
  public async kickoffRoster(team: string) {
    const { data } = await this.api.post(`/jobs/kickoff/roster`, { team })
    return data
  }
}

/* ==================== exports ==================== */
export const api = axiosInstance
export const apiService = new ApiService()

/* ---- Scoreboard API ---- */
export const ScoreboardApi = {
  async refreshByDate(date: string) {
    const res = await apiService.post<ScoreboardSyncResult>(`/jobs/kickoff/scoreboard/by-date`, {
      date,
    })
    return res.data
  },
  async refreshByWeek(season: number, seasonType: 1 | 2 | 3, week: number) {
    const res = await apiService.post<ScoreboardSyncResult>(`/jobs/kickoff/scoreboard/by-week`, {
      season,
      seasonType,
      week,
    })
    return res.data
  },
  async getSchedule(): Promise<ScoreboardSchedule> {
    const res = await apiService.get<ScoreboardSchedule>(`/jobs/scoreboard/schedule`)
    return res.data
  },
  async saveSchedule(payload: ScoreboardSchedule): Promise<ScoreboardSchedule> {
    const res = await apiService.put<ScoreboardSchedule>(`/jobs/scoreboard/schedule`, payload)
    return res.data
  },
}

/* ---- Jobs API ---- */
export const JobsApi = {
  async list(limit = 50): Promise<JobRow[]> {
    const res = await apiService.get<JobRow[]>('/jobs', { limit })
    return res.data
  },
  async get(id: number): Promise<JobRow> {
    const res = await apiService.get<JobRow>(`/jobs/${id}`)
    return res.data
  },
  async kickoffTeams(): Promise<{ id: number; message?: string }> {
    const res = await apiService.post<{ id: number; message?: string }>(`/jobs/kickoff/teams`, {})
    return res.data
  },
  async kickoffRoster(team: string): Promise<{ id: number; message?: string }> {
    const res = await apiService.post<{ id: number; message?: string }>(`/jobs/kickoff/roster`, {
      team,
    })
    return res.data
  },
  async kickoffScoreboardByDate(date: string) {
    const res = await apiService.post(`/jobs/kickoff/scoreboard/by-date`, { date })
    return res.data
  },
  async kickoffScoreboardByWeek(year: number, seasonType: 1 | 2 | 3, week: number) {
    const res = await apiService.post(`/jobs/kickoff/scoreboard/by-week`, {
      year,
      seasonType,
      week,
    })
    return res.data
  },
}
