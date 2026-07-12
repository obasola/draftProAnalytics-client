export type B4MePositionGroup = 'WR' | 'ED' | 'OT' | 'DT' | 'CB';
export type B4MeScoringMode = 'BASE_ONLY' | 'BASE_PLUS_CONTEXT' | 'FULL_DECISION_SCORE';
export type B4MeValidationStatus = 'UNVALIDATED' | 'PARTIALLY_VALIDATED' | 'VALIDATED' | 'DEPRECATED';

export interface B4MeMethodologySection {
  key: string;
  title: string;
  body: string;
}

export interface B4MeMethodologyMetadata {
  frameworkVersion: string;
  positionGroupFrameworkType: string;
  methodologyLineage: string;
  validationStatus: B4MeValidationStatus;
  validationNote: string | null;
  knownLimitations: string[];
  scoringModeUsed: B4MeScoringMode;
  methodologySections: B4MeMethodologySection[];
}

export interface B4MeActiveFilterSummary {
  limitationFiltersEnabled: boolean;
  decisionViewEnabled: boolean;
  scoringMode: B4MeScoringMode;
  playerName: string | null;
  draftYear: number | null;
  positionGroup: B4MePositionGroup;
  badges: string[];
}

export interface B4MeOptionalTeamContext {
  teamCoachingGradeByGroup: string | null;
  teamDevelopmentEnvironment: string | null;
  teamUsageFitContext: string | null;
  isDeferred: boolean;
  isApplied: boolean;
  label: string;
}

export interface B4MeScoreExplanation {
  title: string;
  summary: string;
  lines: string[];
}

export interface B4MeDecisionViewDimensions {
  coachability: number;
  rfa: number;
  rva: number;
}

export interface B4MeEvaluationRow {
  prospectId: string;
  playerName: string;
  positionGroup: B4MePositionGroup;
  draftYear: number | null;
  baseScore: number;
  enhancedScore: number;
  decisionViewScore: number;
  scoreLabel: string;
  scoreExplanation: B4MeScoreExplanation;
  evaluationNotes: string | null;
  decisionViewDimensions: B4MeDecisionViewDimensions;
}

export interface B4MeEvaluationResponse {
  rows: B4MeEvaluationRow[];
  methodology: B4MeMethodologyMetadata | null;
  activeFilterSummary: B4MeActiveFilterSummary;
  optionalTeamContext: B4MeOptionalTeamContext | null;
}
