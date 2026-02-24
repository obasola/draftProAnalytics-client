// src/modules/draft-analysis/types/analyze-pattern.types.ts
export enum PositionGroup {
  QUARTERBACK = 'QB',
  OFFENSIVE_LINE = 'OL',
  DEFENSIVE_LINE = 'DL',
  WIDE_RECEIVER = 'WR',
  RUNNING_BACK = 'RB',
  TIGHT_END = 'TE',
  LINEBACKER = 'LB',
  DEFENSIVE_BACK = 'DB',
  SPECIAL_TEAMS = 'ST'
}

export interface AnalyzeTeamDraftPatternRequestDto {
  teamId: string;
  regimeStartYear: number;
  generalManager: string;
  headCoach: string;
}

export interface PositionMetricsDto {
  position: PositionGroup;
  totalPicks: number;
  successfulPicks: number;
  successRate: number;
  averageRound: number;
  preferredRounds: number[];
  competency: 'Elite' | 'Good' | 'Average' | 'Poor' | 'Terrible';
  systemFitBias: boolean;
}

export interface AnalyzeTeamDraftPatternResponseDto {
  teamId: string;
  regimeStartYear: number;
  regimeEndYear: number | null;
  generalManager: string;
  headCoach: string;
  positionMetrics: PositionMetricsDto[];
  bestDraftingPositions: PositionGroup[];
  worstDraftingPositions: PositionGroup[];
  overallSuccessRate: number;
  totalPicksAnalyzed: number;
}