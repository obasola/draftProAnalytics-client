// src/modules/draft-analysis/types/grade-pick.types.ts

export interface GradeDraftPickRequestDto {
  teamId: number;
  year: number;
  round: number;
  pick: number;
  position: string;
  consensusRanking: number;
}

export interface DraftGradeDto {
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  score: number;
  reasoning: string[];
  warnings: string[];
  expectedSuccess: number;
  historicalSuccessRate: number;
  positionalAlignment: number;
  draftValue: number;
}

export interface GradeDraftPickResponseDto {
  grade: DraftGradeDto;
  teamPattern: {
    generalManager: string;
    headCoach: string;
    overallSuccessRate: number;
  };
  positionMetrics: {
    position: string;
    totalPicks: number;
    successRate: number;
    competencyLevel: string;
    systemFitBias: boolean;
  };
}

export interface GradeBreakdown {
  historicalSuccessWeight: number;
  positionalAlignmentWeight: number;
  draftValueWeight: number;
  systemBiasPenalty: number;
  recentDraftsPenalty: number;
  finalScore: number;
}

export interface ValueAnalysis {
  consensusRank: number;
  actualPick: number;
  difference: number;
  isReach: boolean;
  isValue: boolean;
  valueDescription: string;
}

export interface WarningDetail {
  type: 'REACH' | 'POOR_HISTORY' | 'SYSTEM_BIAS' | 'RECENT_DRAFTS' | 'VALUE';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
}