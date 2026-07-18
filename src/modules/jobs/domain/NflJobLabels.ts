import { DPA_JOB_STATUS, DPA_JOB_TYPE, NFL_SEASON_TYPE } from './NflJobTypes';
import type { DpaJobStatus, DpaJobType, NflSeasonType, SeasonTypeOption, WeekOption } from './NflJobTypes';

export const seasonTypeOptions: readonly SeasonTypeOption[] = [
  { label: 'Preseason', value: NFL_SEASON_TYPE.PRESEASON },
  { label: 'Regular Season', value: NFL_SEASON_TYPE.REGULAR_SEASON },
  { label: 'Postseason', value: NFL_SEASON_TYPE.POSTSEASON },
];

export const regularSeasonWeekOptions: readonly WeekOption[] = Array.from({ length: 18 }, (_, index) => ({
  label: `Week ${index + 1}`,
  value: index + 1,
}));

export const preseasonWeekOptions: readonly WeekOption[] = Array.from({ length: 4 }, (_, index) => ({
  label: `Pre ${index + 1}`,
  value: index + 1,
}));

export const postseasonWeekOptions: readonly WeekOption[] = [
  { label: 'Wild Card', value: 1 },
  { label: 'Divisional', value: 2 },
  { label: 'Conference Championship', value: 3 },
  { label: 'Super Bowl', value: 4 },
  { label: 'Postseason Week 5', value: 5 },
];

export const getWeekOptionsForSeasonType = (seasonType: NflSeasonType): readonly WeekOption[] => {
  if (seasonType === NFL_SEASON_TYPE.PRESEASON) {
    return preseasonWeekOptions;
  }

  if (seasonType === NFL_SEASON_TYPE.POSTSEASON) {
    return postseasonWeekOptions;
  }

  return regularSeasonWeekOptions;
};

export const getSeasonTypeLabel = (seasonType: NflSeasonType): string => {
  const option = seasonTypeOptions.find((currentOption) => currentOption.value === seasonType);
  return option?.label ?? `Season Type ${seasonType}`;
};

export const getJobTypeLabel = (jobType: string): string => {
  if (jobType === DPA_JOB_TYPE.LOAD_NFL_SEASON_SCHEDULE) {
    return 'Load NFL Season Schedule';
  }

  if (jobType === DPA_JOB_TYPE.IMPORT_NFL_GAME_SCORES) {
    return 'Import NFL Game Scores';
  }

  if (jobType === DPA_JOB_TYPE.LOAD_ESPN_DRAFT_CLASS_PLAYERS) return 'Load ESPN Draft Class Players';
  if (jobType === DPA_JOB_TYPE.LOAD_ESPN_DRAFT_RESULTS) return 'Load ESPN Draft Results';
  if (jobType === DPA_JOB_TYPE.ENRICH_PLAYER_TEAM_POSITIONS) return 'Enrich PlayerTeam Positions';
  if (jobType === DPA_JOB_TYPE.SYNC_ESPN_DRAFT_PICKS_TO_DPA) return 'Sync ESPN Draft Picks to DPA';
  if (jobType === DPA_JOB_TYPE.LOAD_ESPN_TEAM_ROSTERS) return 'Load ESPN Team Rosters';
  if (jobType === DPA_JOB_TYPE.SYNC_POSTSEASON_RESULTS_FROM_GAMES) return 'Sync Postseason Results from Games';

  if (jobType === DPA_JOB_TYPE.PROCESS_JOB_QUEUE) {
    return 'Process Job Queue';
  }

  return jobType;
};

export const getStatusSeverity = (status: string): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' => {
  if (status === DPA_JOB_STATUS.COMPLETED) {
    return 'success';
  }

  if (status === DPA_JOB_STATUS.IN_PROGRESS) {
    return 'info';
  }

  if (status === DPA_JOB_STATUS.PENDING) {
    return 'warning';
  }

  if (status === DPA_JOB_STATUS.FAILED) {
    return 'danger';
  }

  if (status === DPA_JOB_STATUS.CANCELED) {
    return 'secondary';
  }

  return 'contrast';
};

export const dpaJobStatusOptions: readonly { readonly label: string; readonly value: DpaJobStatus }[] = [
  { label: 'Pending', value: DPA_JOB_STATUS.PENDING },
  { label: 'Running', value: DPA_JOB_STATUS.IN_PROGRESS },
  { label: 'Completed', value: DPA_JOB_STATUS.COMPLETED },
  { label: 'Failed', value: DPA_JOB_STATUS.FAILED },
  { label: 'Canceled', value: DPA_JOB_STATUS.CANCELED },
];

export const dpaJobTypeOptions: readonly { readonly label: string; readonly value: DpaJobType }[] = [
  { label: 'Load NFL Season Schedule', value: DPA_JOB_TYPE.LOAD_NFL_SEASON_SCHEDULE },
  { label: 'Import NFL Game Scores', value: DPA_JOB_TYPE.IMPORT_NFL_GAME_SCORES },
  { label: 'Load ESPN Draft Class Players', value: DPA_JOB_TYPE.LOAD_ESPN_DRAFT_CLASS_PLAYERS },
  { label: 'Load ESPN Draft Results', value: DPA_JOB_TYPE.LOAD_ESPN_DRAFT_RESULTS },
  { label: 'Enrich PlayerTeam Positions', value: DPA_JOB_TYPE.ENRICH_PLAYER_TEAM_POSITIONS },
  { label: 'Sync ESPN Draft Picks to DPA', value: DPA_JOB_TYPE.SYNC_ESPN_DRAFT_PICKS_TO_DPA },
  { label: 'Load ESPN Team Rosters', value: DPA_JOB_TYPE.LOAD_ESPN_TEAM_ROSTERS },
  { label: 'Sync Postseason Results from Games', value: DPA_JOB_TYPE.SYNC_POSTSEASON_RESULTS_FROM_GAMES },
];
