// src/types/teamNeedsAnalysis.ts

// DTOs matching backend contracts
export interface PositionNeedDto {
  position: string;
  positionGroup: string;
  needScore: number;
  priority: number;
  reasoning: string[];
}

export interface TeamNeedsAnalysisDto {
  teamId: number;
  seasonYear: number;
  analysisDate: string;
  positionNeeds: PositionNeedDto[];
  overallNeedScore: number;
  topPriorities: string[];
  metadata?: {
    rosterSize?: number;
    averageAge?: number;
    experienceLevel?: number;
    injuryCount?: number;
  };
}

export interface AllTeamsNeedsDto {
  seasonYear: number;
  teams: TeamNeedsAnalysisDto[];
  generatedAt: string;
  totalTeams: number;
}

export interface TeamNeedsDataTableRow {
  teamId: number;
  teamName?: string;
  teamAbbreviation?: string;
  overallNeedScore: number;
  topNeeds: string[];
  criticalPositions: number;
  analysisDate: string;
}

export interface PositionNeedsDataTableRow {
  teamId: number;
  teamName?: string;
  position: string;
  positionGroup: string;
  needScore: number;
  priority: number;
  reasoning: string;
}

// Request types
export interface GenerateTeamNeedsRequest {
  teamId: number;
  seasonYear: number;
  forceRefresh?: boolean;
}

export interface GenerateAllTeamsNeedsRequest {
  seasonYear: number;
  forceRefresh?: boolean;
}

export interface GetTeamNeedsRequest {
  teamId: number;
  seasonYear?: number;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}

// Helper types for UI
export type NeedSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface NeedScoreThresholds {
  critical: number;  // >= 80
  high: number;      // >= 60
  medium: number;    // >= 40
  low: number;       // < 40
}

export const NEED_SCORE_THRESHOLDS: NeedScoreThresholds = {
  critical: 80,
  high: 60,
  medium: 40,
  low: 0,
};

export function getNeedSeverity(score: number): NeedSeverity {
  if (score >= NEED_SCORE_THRESHOLDS.critical) return 'critical';
  if (score >= NEED_SCORE_THRESHOLDS.high) return 'high';
  if (score >= NEED_SCORE_THRESHOLDS.medium) return 'medium';
  return 'low';
}

export function getSeverityColor(severity: NeedSeverity): string {
  const colors: Record<NeedSeverity, string> = {
    critical: 'text-red-600',
    high: 'text-orange-600',
    medium: 'text-yellow-600',
    low: 'text-green-600',
  };
  return colors[severity];
}

export function getSeverityBadgeClass(severity: NeedSeverity): string {
  const classes: Record<NeedSeverity, string> = {
    critical: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
  };
  return classes[severity];
}