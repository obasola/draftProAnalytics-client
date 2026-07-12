import type { JobStatus } from '../../domain/job.types';

export type PrimeSeverity = 'success' | 'info' | 'warning' | 'danger' | 'secondary';

export const getJobStatusSeverity = (status: JobStatus): PrimeSeverity => {
  switch (status) {
    case 'COMPLETED':
      return 'success';
    case 'RUNNING':
      return 'info';
    case 'PENDING':
    case 'QUEUED':
      return 'warning';
    case 'FAILED':
      return 'danger';
    case 'CANCELLED':
    case 'UNKNOWN':
      return 'secondary';
    default:
      return 'secondary';
  }
};

export const getJobTypeLabel = (type: string): string => {
  switch (type) {
    case 'IMPORT_NFL_SCHEDULE':
      return 'Import NFL Schedule';
    case 'IMPORT_SCORES_WEEK':
      return 'Import Weekly Scores';
    case 'PF_DRAFT_SCRAPER':
      return 'Pro Football Draft Scraper';
    case 'ESPN_PLAYER_IMPORT':
      return 'ESPN Player Import';
    case 'NFL_STATS_IMPORT':
      return 'NFL Stats Import';
    default:
      return type;
  }
};

export const formatOptionalDate = (value: string | null | undefined): string => {
  if (!value) {
    return 'N/A';
  }

  return new Date(value).toLocaleString();
};
