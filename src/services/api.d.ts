import { AxiosInstance, AxiosResponse } from 'axios';
export declare const API_BASE: string;
export type JobType = 'PLAYER_SYNC' | 'TEAM_SYNC' | 'FULL_SYNC' | 'VALIDATION' | 'ENRICHMENT';
export type JobStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export interface JobRow {
    id: number;
    job_type: JobType;
    status: JobStatus;
    started_at: string | null;
    completed_at: string | null;
    total_records: number | null;
    processed_records: number | null;
    failed_records: number | null;
    error_message?: string | null;
    created_at: string | null;
    updated_at: string | null;
}
export interface ScoreboardSyncResult {
    ok: boolean;
    jobId?: number;
    processed: number;
    failed: number;
    season: number | null;
    seasonType: 1 | 2 | 3 | null;
    week: number | null;
    missingMappings: Array<{
        espnGameId?: string;
        homeEspnId?: number;
        awayEspnId?: number;
    }>;
}
export type Day = 'SUN' | 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT';
export interface ScoreboardSchedule {
    enabled: boolean;
    days: Day[];
    hour: number;
    minute: number;
    timezone: string;
    mode?: 'by-date';
}
declare class ApiService {
    private api;
    constructor(instance?: AxiosInstance);
    get<T>(url: string, params?: any): Promise<AxiosResponse<T>>;
    post<T>(url: string, data?: any): Promise<AxiosResponse<T>>;
    put<T>(url: string, data: any): Promise<AxiosResponse<T>>;
    patch<T>(url: string, data: any): Promise<AxiosResponse<T>>;
    delete<T>(url: string): Promise<AxiosResponse<T>>;
    getAll<T>(endpoint: string, params?: any): Promise<T[]>;
    getById<T>(endpoint: string, id: number): Promise<T>;
    create<T>(endpoint: string, payload: Omit<T, 'id'>): Promise<T>;
    update<T>(endpoint: string, id: number, payload: Partial<T>): Promise<T>;
    remove(endpoint: string, id: number): Promise<void>;
    listJobs(limit?: number): Promise<JobRow[]>;
    getJob(id: number): Promise<JobRow>;
    kickoffTeams(): Promise<any>;
    kickoffRoster(team: string): Promise<any>;
    kickoffScoreboardByDate(date: string): Promise<unknown>;
    kickoffScoreboardByWeek(year: number, seasonType: 1 | 2 | 3, week: number): Promise<{
        id: number;
        message?: string;
    }>;
}
export declare const api: AxiosInstance;
export declare const apiService: ApiService;
export declare const ScoreboardApi: {
    refreshByDate(date: string): Promise<ScoreboardSyncResult>;
    refreshByWeek(seasonYear: number, seasonType: 1 | 2 | 3, week: number): Promise<ScoreboardSyncResult>;
    getSchedule(): Promise<ScoreboardSchedule>;
    saveSchedule(payload: ScoreboardSchedule): Promise<ScoreboardSchedule>;
    getCurrent(): Promise<{
        year: number;
        seasonType: 1 | 2 | 3;
        week: number;
    }>;
};
export declare const JobsApi: {
    list(limit?: number): Promise<JobRow[]>;
    get(id: number): Promise<JobRow>;
    kickoffTeams(): Promise<{
        id: number;
        message?: string;
    }>;
    kickoffRoster(team: string): Promise<{
        id: number;
        message?: string;
    }>;
    kickoffScoreboardByDate(date: string): Promise<unknown>;
    kickoffScoreboardByWeek(year: number, seasonType: 1 | 2 | 3, week: number): Promise<{
        id: number;
        message?: string;
    }>;
};
export {};
//# sourceMappingURL=api.d.ts.map