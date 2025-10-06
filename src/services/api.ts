// src/services/api.ts
import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'

// ---- Env/base URL (align both implementations) ----
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// ---- Domain types (from first snippet) ----
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

export type Day = 'SUN'|'MON'|'TUE'|'WED'|'THU'|'FRI'|'SAT'
export interface ScoreboardSchedule {
  enabled: boolean
  days: Day[]
  hour: number
  minute: number
  timezone: string
  mode?: 'by-date'
}

class ApiService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
      withCredentials: true, // keep behavior from original snippet
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token')
        if (token) config.headers.Authorization = `Bearer ${token}`
        console.log(`🔄 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
        return config
      },
      (error) => {
        console.error('❌ Request Error:', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`)
        return response
      },
      (error: AxiosError) => {
        console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status}`)
        switch (error.response?.status) {
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

  // Generic HTTP methods
  public get<T>(url: string, params?: any): Promise<AxiosResponse<T>> {
    return this.api.get<T>(url, { params })
  }
  public post<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.api.post<T>(url, data)
  }
  public put<T>(url: string, data: any): Promise<AxiosResponse<T>> {
    return this.api.put<T>(url, data)
  }
  public patch<T>(url: string, data: any): Promise<AxiosResponse<T>> {
    return this.api.patch<T>(url, data)
  }
  public delete<T>(url: string): Promise<AxiosResponse<T>> {
    return this.api.delete<T>(url)
  }

  // Helper methods for common REST patterns
  public async getAll<T>(endpoint: string, params?: any): Promise<T[]> {
    const response = await this.get<T[]>(endpoint, params)
    return response.data
  }
  public async getById<T>(endpoint: string, id: number): Promise<T> {
    const response = await this.get<T>(`${endpoint}/${id}`)
    return response.data
  }
  public async create<T>(endpoint: string, data: Omit<T, 'id'>): Promise<T> {
    const response = await this.post<T>(endpoint, data)
    return response.data
  }
  public async update<T>(endpoint: string, id: number, data: Partial<T>): Promise<T> {
    const response = await this.put<T>(`${endpoint}/${id}`, data)
    return response.data
  }
  public async remove(endpoint: string, id: number): Promise<void> {
    await this.delete(`${endpoint}/${id}`)
  }

  public async listJobs(limit = 50) {
    const { data } = await this.api.get<JobRow[]>(`/jobs`, { params: { limit } })
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

export const apiService = new ApiService()
// src/services/api.ts (additions)
export const ScoreboardApi = {
  // Manual refresh
  async refreshByDate(date: string) {
    const res = await apiService.post<ScoreboardSyncResult>(`/jobs/kickoff/scoreboard/by-date`, { date })
    return res.data
  },
  async refreshByWeek(season: number, seasonType: 1|2|3, week: number) {
    const res = await apiService.post<ScoreboardSyncResult>(`/jobs/kickoff/scoreboard/by-week`, { season, seasonType, week })
    return res.data
  },

  // Scheduling controls
  /*
  async getSchedule(): Promise<{
    enabled: boolean
    days: Array<'SUN'|'MON'|'TUE'|'WED'|'THU'|'FRI'|'SAT'>
    hour: number
    minute: number
    timezone: string
  }> {
    const res = await apiService.get(`/jobs/scoreboard/schedule`)
    return res.data
  },
  async saveSchedule(payload: {
    enabled: boolean
    days: Array<'SUN'|'MON'|'TUE'|'WED'|'THU'|'FRI'|'SAT'>
    hour: number
    minute: number
    timezone: string
  }) {
    const res = await apiService.put(`/jobs/scoreboard/schedule`, payload)
    return res.data
  }
    */
   async getSchedule(): Promise<ScoreboardSchedule> {
    const res = await apiService.get<ScoreboardSchedule>(`/jobs/scoreboard/schedule`)
    return res.data
  },
  async saveSchedule(payload: ScoreboardSchedule): Promise<ScoreboardSchedule> {
    const res = await apiService.put<ScoreboardSchedule>(`/jobs/scoreboard/schedule`, payload)
    return res.data
  }
}

// ---- Jobs API (merged from first snippet; typed + uses ApiService) ----
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
    const res = await apiService.post<{ id: number; message?: string }>(`/jobs/kickoff/roster`, { team })
    return res.data
  },
  async kickoffScoreboardByDate(date: string) {
    const res = await apiService.post(`/jobs/kickoff/scoreboard/by-date`, { date })
    return res.data
  },
  async kickoffScoreboardByWeek(year: number, seasonType: 1|2|3, week: number) {
    const res = await apiService.post(`/jobs/kickoff/scoreboard/by-week`, { year, seasonType, week })
    return res.data
  },
  
}
