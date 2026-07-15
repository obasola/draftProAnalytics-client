// src/modules/jobs/application/DpaJobsApi.ts
import axios, { type AxiosInstance } from 'axios';
import type {
  DpaJobListQuery,
  DpaJobLogEntry,
  DpaJobSummary,
  ImportNflGameScoresCommand,
  LoadNflSeasonScheduleCommand,
  LoadEspnDraftClassPlayersCommand,
  LoadEspnDraftResultsCommand,
  EnrichPlayerTeamPositionsCommand,
  LoadEspnTeamRostersCommand,
  ProcessJobQueueCommand,
  ProcessJobQueueResult,
} from '../domain/NflJobTypes';

const resolveApiBaseUrl = (): string => {
  const viteBaseUrl = import.meta.env.VITE_API_BASE_URL;

  if (typeof viteBaseUrl === 'string' && viteBaseUrl.trim() !== '') {
    return viteBaseUrl.trim();
  }

  return '/api';
};

const httpClient: AxiosInstance = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

export class DpaJobsApi {
  public async enqueueLoadNflSeasonSchedule(command: LoadNflSeasonScheduleCommand): Promise<DpaJobSummary> {
    const response = await httpClient.post<DpaJobSummary>('/jobs/imports/nfl-season-schedule', command);
    return response.data;
  }

  public async enqueueImportNflGameScores(command: ImportNflGameScoresCommand): Promise<DpaJobSummary> {
    const response = await httpClient.post<DpaJobSummary>('/jobs/imports/nfl-game-scores', command);
    return response.data;
  }

  public async enqueueLoadEspnDraftClassPlayers(command: LoadEspnDraftClassPlayersCommand): Promise<DpaJobSummary> { const response = await httpClient.post<DpaJobSummary>('/jobs/imports/espn-draft-class-players', command); return response.data; }
  public async enqueueLoadEspnDraftResults(command: LoadEspnDraftResultsCommand): Promise<DpaJobSummary> { const response = await httpClient.post<DpaJobSummary>('/jobs/imports/espn-draft-results', command); return response.data; }
  public async enqueueEnrichPlayerTeamPositions(command: EnrichPlayerTeamPositionsCommand): Promise<DpaJobSummary> { const response = await httpClient.post<DpaJobSummary>('/jobs/imports/player-team-positions', command); return response.data; }
  public async enqueueLoadEspnTeamRosters(command: LoadEspnTeamRostersCommand): Promise<DpaJobSummary> { const response = await httpClient.post<DpaJobSummary>('/jobs/imports/espn-team-rosters', command); return response.data; }

  public async processJobQueue(command: ProcessJobQueueCommand): Promise<ProcessJobQueueResult> {
    const response = await httpClient.post<ProcessJobQueueResult>('/jobs/queue/process', command);
    return response.data;
  }

  public async listJobs(query: DpaJobListQuery): Promise<readonly DpaJobSummary[]> {
    const response = await httpClient.get<readonly DpaJobSummary[]>('/jobs', {
      params: {
        status: query.status,
        type: query.type,
        limit: query.limit ?? 50,
      },
    });

    return response.data;
  }

  public async readJob(jobId: number): Promise<DpaJobSummary> {
    const response = await httpClient.get<DpaJobSummary>(`/jobs/${jobId}`);
    return response.data;
  }

  public async readJobLogs(jobId: number): Promise<readonly DpaJobLogEntry[]> {
    const response = await httpClient.get<readonly DpaJobLogEntry[]>(`/jobs/${jobId}/logs`);
    return response.data;
  }

  public async cancelJob(jobId: number, reason: string): Promise<void> {
    await httpClient.post<void>(`/jobs/${jobId}/cancel`, { reason });
  }
}

export const dpaJobsApi = new DpaJobsApi();
