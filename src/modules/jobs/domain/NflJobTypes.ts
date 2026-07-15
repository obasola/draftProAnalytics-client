export const NFL_SEASON_TYPE = {
  PRESEASON: 1,
  REGULAR_SEASON: 2,
  POSTSEASON: 3,
} as const;

export type NflSeasonType = (typeof NFL_SEASON_TYPE)[keyof typeof NFL_SEASON_TYPE];

export const DPA_JOB_TYPE = {
  LOAD_NFL_SEASON_SCHEDULE: 'LOAD_NFL_SEASON_SCHEDULE',
  IMPORT_NFL_GAME_SCORES: 'IMPORT_NFL_GAME_SCORES',
  PROCESS_JOB_QUEUE: 'PROCESS_JOB_QUEUE',
  LOAD_ESPN_DRAFT_CLASS_PLAYERS: 'LOAD_ESPN_DRAFT_CLASS_PLAYERS',
  LOAD_ESPN_DRAFT_RESULTS: 'LOAD_ESPN_DRAFT_RESULTS',
} as const;

export type DpaJobType = (typeof DPA_JOB_TYPE)[keyof typeof DPA_JOB_TYPE];

export const DPA_JOB_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELED: 'canceled',
} as const;

export type DpaJobStatus = (typeof DPA_JOB_STATUS)[keyof typeof DPA_JOB_STATUS];

export interface LoadNflSeasonScheduleCommand {
  readonly seasonYear: number;
  readonly seasonTypes: readonly NflSeasonType[];
  readonly requestedByPersonId?: number;
}

export interface ImportNflGameScoresCommand {
  readonly seasonYear: number;
  readonly seasonType: NflSeasonType;
  readonly week: number;
  readonly requestedByPersonId?: number;
}

export interface LoadEspnDraftClassPlayersCommand { readonly draftYear: number; readonly requestedByPersonId?: number; }
export interface LoadEspnDraftResultsCommand extends LoadEspnDraftClassPlayersCommand { readonly activateMembership: boolean; }

export interface ProcessJobQueueCommand {
  readonly take: number;
}

export type DpaJobPayload =
  | LoadNflSeasonScheduleCommand
  | ImportNflGameScoresCommand
  | LoadEspnDraftClassPlayersCommand
  | LoadEspnDraftResultsCommand
  | Record<string, unknown>
  | null;

export type DpaJobResult = Record<string, unknown> | readonly unknown[] | string | number | boolean | null;

export interface DpaJobSummary {
  readonly id: number;
  readonly type: string;
  readonly status: DpaJobStatus | string;
  readonly payload: DpaJobPayload;
  readonly createdAt: string;
  readonly startedAt: string | null;
  readonly finishedAt: string | null;
  readonly cancelAt: string | null;
  readonly cancelReason: string | null;
  readonly resultCode: string | null;
  readonly resultJson: DpaJobResult;
  readonly errorMessage: string | null;
  readonly progressPercent: number;
  readonly totalItems: number;
  readonly processedItems: number;
  readonly requestedByPersonId: number | null;
}

export interface DpaJobLogEntry {
  readonly id: number;
  readonly jobId: number;
  readonly level: string;
  readonly message: string;
  readonly contextJson: DpaJobResult;
  readonly createdAt: string;
}

export interface DpaJobListQuery {
  readonly status?: DpaJobStatus;
  readonly type?: DpaJobType;
  readonly limit?: number;
}

export interface ProcessJobQueueResult {
  readonly processedJobIds: readonly number[];
  readonly completed: number;
  readonly failed: number;
  readonly canceled: number;
}

export interface SeasonTypeOption {
  readonly label: string;
  readonly value: NflSeasonType;
}

export interface WeekOption {
  readonly label: string;
  readonly value: number;
}
