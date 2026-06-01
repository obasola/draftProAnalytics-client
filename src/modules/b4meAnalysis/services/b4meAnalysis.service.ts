import axios from 'axios';
import type {
  B4MeEvaluationResponse,
  B4MeScoringMode
} from '../types/b4meAnalysis';

export type B4MeSearchRequest = {
  playerName: string | null;
  draftYear: number | null;
  scoringMode: B4MeScoringMode;
  includeMethodology: boolean;
  includeTeamContextPlaceholder: boolean;
  enableCompetitionDiscount: boolean;
  enableInjuryAvailabilityAdjustment: boolean;
  enableQbOffenseContextAdjustment: boolean;
  enableSampleSizeAdjustment: boolean;
  enableArchetypeConfidenceAdjustment: boolean;
  enableCoachabilityAdjustment: boolean;
  enableRfaAdjustment: boolean;
  enableRvaAdjustment: boolean;
};

export async function searchB4MeProspects(
  request: B4MeSearchRequest
): Promise<B4MeEvaluationResponse> {
  const response = await axios.get<B4MeEvaluationResponse>('/api/b4me/prospects', {
    params: request
  });

  return response.data;
}