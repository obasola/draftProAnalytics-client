// src/modules/draft-analysis/api/draft-analysis.api.ts
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import type {
  AnalyzeTeamDraftPatternRequestDto,
  AnalyzeTeamDraftPatternResponseDto
} from '../types/analyze-pattern.types';
import type {
  PredictDraftSelectionRequestDto,
  PredictDraftSelectionResponseDto
} from '../types/predict-selection.types';
import type {
  GradeDraftPickRequestDto,
  GradeDraftPickResponseDto
} from '../types/grade-pick.types';
import type {
  TrackLiveDraftPickRequestDto,
  TrackLiveDraftPickResponseDto,
  DraftReportResponseDto,
  GetCurrentPickResponseDto,
  GetTeamPicksResponseDto,
  GetRoundPicksResponseDto,
  GetAllDraftPicksResponseDto
} from '../types/draft-tracker.types';
import { logger } from '@/util/Logger';

class DraftAnalysisApi {
  private api: AxiosInstance;
  public constructor(baseURL: string = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api') ) {
    // DPA best practice: default to relative /api so dev + prod behind nginx just work    

    this.api = axios.create({
      baseURL,
      withCredentials: true,
    });
    logger.debug("baseUrl = "+baseURL)
  }
  // Pattern Analysis
  async analyzePattern(
    request: AnalyzeTeamDraftPatternRequestDto
  ): Promise<AnalyzeTeamDraftPatternResponseDto> {
    const response: AxiosResponse<AnalyzeTeamDraftPatternResponseDto> = await this.api.post(
      '/draft-analysis/analyze-pattern',
      request
    );
    return response.data;
  }

  async getPattern(teamId: number): Promise<AnalyzeTeamDraftPatternResponseDto> {
    const response: AxiosResponse<AnalyzeTeamDraftPatternResponseDto> = await this.api.get(
      `/draft-analysis/pattern/${teamId}`
    );
    return response.data;
  }

  // Draft Prediction
  async predictSelection(
    request: PredictDraftSelectionRequestDto
  ): Promise<PredictDraftSelectionResponseDto> {
    const response: AxiosResponse<PredictDraftSelectionResponseDto> = await this.api.post(
      '/draft-analysis/predict-selection',
      request
    );
    return response.data;
  }

  // Draft Grading
  async gradePick(
    request: GradeDraftPickRequestDto
  ): Promise<GradeDraftPickResponseDto> {
    const response: AxiosResponse<GradeDraftPickResponseDto> = await this.api.post(
      '/draft-analysis/grade-pick',
      request
    );
    return response.data;
  }

  // Draft Reports
  async getDraftReport(teamId: number, year: number): Promise<DraftReportResponseDto> {
    const response: AxiosResponse<DraftReportResponseDto> = await this.api.get(
      `/draft-analysis/report/${teamId}/${year}`
    );
    return response.data;
  }

  // Live Draft Tracking
  async trackPick(
    request: TrackLiveDraftPickRequestDto
  ): Promise<TrackLiveDraftPickResponseDto> {
    const response: AxiosResponse<TrackLiveDraftPickResponseDto> = await this.api.post(
      '/draft-analysis/track-pick',
      request
    );
    return response.data;
  }

  async getCurrentPick(year: number): Promise<GetCurrentPickResponseDto> {
    const response: AxiosResponse<GetCurrentPickResponseDto> = await this.api.get(
      `/${year}/current`
    );
    return response.data;
  }

  async getTeamPicks(teamId: number, year: number): Promise<GetTeamPicksResponseDto> {
    const response: AxiosResponse<GetTeamPicksResponseDto> = await this.api.get(
      `/${year}/team/${teamId}`
    );
    return response.data;
  }

  async getRoundPicks(year: number, round: number): Promise<GetRoundPicksResponseDto> {
    const response: AxiosResponse<GetRoundPicksResponseDto> = await this.api.get(
      `/${year}/round/${round}`
    );
    return response.data;
  }

  async getAllPicks(year: number): Promise<GetAllDraftPicksResponseDto> {
    const response: AxiosResponse<GetAllDraftPicksResponseDto> = await this.api.get(
      `/${year}/all`
    );
    return response.data;
  }
}

export const draftAnalysisApi = new DraftAnalysisApi();