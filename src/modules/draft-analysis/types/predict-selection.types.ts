// src/modules/draft-analysis/types/predict-selection.types.ts

export interface PredictDraftSelectionRequestDto {
  teamId: number;
  year: number;
  round: number;
  pick: number;
}

export interface PositionPredictionDto {
  position: string;
  probability: number;
  reasoning: string[];
  teamNeedScore: number;
  historicalTendencyScore: number;
  confidenceLevel: 'High' | 'Medium' | 'Low';
}

export interface PredictDraftSelectionResponseDto {
  teamId: number;
  year: number;
  round: number;
  pick: number;
  predictions: PositionPredictionDto[];
  mostLikelyPosition: string;
  draftStrategy: 'BPA' | 'Need-Based' | 'Balanced';
  teamContext: {
    generalManager: string;
    headCoach: string;
    regimeStartYear: number;
    overallSuccessRate: number;
  };
}

export interface TeamNeedDto {
  position: string;
  severity: 'Critical' | 'High' | 'Moderate' | 'Low';
  score: number;
  reasoning: string[];
  currentDepth: {
    starters: number;
    qualityStarters: number;
    backups: number;
    averageAge: number;
  };
}

export interface PredictionFactors {
  teamNeedWeight: number;
  historicalSuccessWeight: number;
  roundPreferenceWeight: number;
  systemFitWeight: number;
  recentHistoryModifier: number;
}

export interface PositionProbabilityBreakdown {
  position: string;
  baseNeedScore: number;
  historicalScore: number;
  roundFitScore: number;
  systemFitPenalty: number;
  recentDraftsModifier: number;
  finalProbability: number;
}