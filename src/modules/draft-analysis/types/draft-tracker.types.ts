// src/modules/draft-analysis/types/draft-tracker.types.ts

export enum DraftPickStatus {
  UPCOMING = 'upcoming',
  CURRENT = 'current',
  COMPLETED = 'completed',
  TRADED = 'traded'
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

export interface LiveDraftPickDto {
  id: string;
  year: number;
  round: number;
  pick: number;
  overallPick: number;
  teamId: number;
  originalTeamId: number;
  status: DraftPickStatus;
  playerName?: string;
  position?: string;
  college?: string;
  consensusRank?: number;
  grade?: DraftGradeDto;
  pickedAt?: string;
}

export interface TrackLiveDraftPickRequestDto {
  year: number;
  teamId: number;
  round: number;
  pick: number;
  playerName: string;
  position: string;
  college?: string;
  consensusRanking: number;
}

export interface TrackLiveDraftPickResponseDto {
  pick: LiveDraftPickDto;
  grade: DraftGradeDto;
}

export interface PositionBreakdownDto {
  position: string;
  count: number;
  averageGrade: number;
  bestPick?: string;
  worstPick?: string;
}

export interface DraftReportResponseDto {
  teamId: number;
  year: number;
  totalPicks: number;
  overallGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  averagePickGrade: number;
  picks: Array<{
    round: number;
    pick: number;
    playerName: string;
    position: string;
    grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
    score: number;
  }>;
  positionBreakdown: PositionBreakdownDto[];
  strengths: string[];
  concerns: string[];
  historicalComparison: {
    betterThanAverage: boolean;
    percentile: number;
    comparedToRegimeAverage: number;
  };
}

export interface GetCurrentPickResponseDto {
  currentPick?: LiveDraftPickDto;
  nextPick?: LiveDraftPickDto;
  recentPicks: LiveDraftPickDto[];
}

export interface GetTeamPicksResponseDto {
  teamId: number;
  year: number;
  picks: LiveDraftPickDto[];
  totalPicks: number;
  completedPicks: number;
}

export interface GetRoundPicksResponseDto {
  year: number;
  round: number;
  picks: LiveDraftPickDto[];
  totalPicks: number;
  completedPicks: number;
}

export interface GetAllDraftPicksResponseDto {
  year: number;
  picks: LiveDraftPickDto[];
  totalPicks: number;
  completedPicks: number;
  currentRound: number;
  currentPick: number;
}