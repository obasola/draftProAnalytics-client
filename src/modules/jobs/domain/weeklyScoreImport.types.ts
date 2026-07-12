export type NflSeasonType = 1 | 2 | 3;
export interface SeasonTypeOption {
  readonly label: string;
  readonly value: NflSeasonType;
  readonly defaultStartWeek: number;
  readonly defaultEndWeek: number;
}

export interface ImportWeeklyScoresRequest {
  readonly seasonYear: number;
  readonly seasonType: NflSeasonType;
  readonly week: number;
  readonly autoStart: boolean;
}
export interface ImportWeeklyScoresJobRow {
  readonly jobId: number;
  readonly seasonYear: number;
  readonly seasonType: NflSeasonType;
  readonly week: number;
  readonly status: string;
  readonly submittedAt: string;
  readonly lastCheckedAt?: string;
  readonly message?: string | null;
}
