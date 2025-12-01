// src/util/schedule/upcomingGamesHelpers.ts
// -----------------------------------------------------
// Consumes BACKEND NormalizedGameDTO
// Produces FRONTEND UpcomingGameUI (with scoring info)
// -----------------------------------------------------

import { DateTime } from 'luxon';
import { resolveTeamLogo } from '@/util/resolveTeamLogo';
import type {
  NormalizedGameDTO,
  ScoringPlayDTO,
} from '@/util/schedule/scheduleTypes';

// -----------------------------------------------------
// FRONTEND DTO / UI MODEL
// -----------------------------------------------------
export interface UpcomingGameDto {
  id: number;
  dateFormatted: {
    day: string;
    time: string;
  };

  homeTeamName: string;
  awayTeamName: string;
  homeLogo: string;
  awayLogo: string;
  homeScore: number | null;
  awayScore: number | null;

  status: 'Scheduled' | 'In Progress' | 'Final' | 'Postponed';
  statusDetail: string;

  isPrimetime: boolean;
  primetimeType: 'TNF' | 'SNF' | 'MNF' | null;

  teamColorHome: string;
  teamColorAway: string;

  // NEW: short blurb + full list
  scoringSummaryShort: string | null;
  scoringDetails: string[];
}

export type UpcomingGameUI = UpcomingGameDto;

// -----------------------------------------------------
// Helpers
// -----------------------------------------------------
function toDateFormatted(dateIso: string | null): { day: string; time: string } {
  if (!dateIso) {
    return { day: '', time: '' };
  }

  const dt = DateTime.fromISO(dateIso);
  if (!dt.isValid) {
    return { day: '', time: '' };
  }

  return {
    day: dt.toFormat('ccc L/d'), // e.g. "Sun 11/30"
    time: dt.toFormat('h:mm a'), // e.g. "7:15 PM"
  };
}

function mapScoringPlaysToDetails(plays: ScoringPlayDTO[] | undefined): string[] {
  if (!plays || !plays.length) {
    return [];
  }

  return plays.map((p) => {
    const parts: string[] = [];

    // "Q3 10:21"
    if (p.period > 0 || p.clockDisplay) {
      const qLabel = p.period > 0 ? `Q${p.period}` : '';
      const timeLabel = p.clockDisplay || '';
      const when = [qLabel, timeLabel].filter(Boolean).join(' ');
      if (when) {
        parts.push(when);
      }
    }

    // Play text
    if (p.text) {
      parts.push(p.text);
    }

    // "(Score: 21–17)"
    if (p.homeScore != null || p.awayScore != null) {
      parts.push(`(Score: ${p.awayScore ?? '-'}–${p.homeScore ?? '-'})`);
    }

    return parts.join(' — ');
  });
}

// -----------------------------------------------------
// MAIN MAPPER: server DTO → UI model
// -----------------------------------------------------
export function mapUpcomingGamesToUI(events: NormalizedGameDTO[]): UpcomingGameUI[] {
  return events.map((e) => {
    const dateFormatted = e.dateFormatted ?? toDateFormatted(e.date);

    const homeLogo =
      e.homeLogoLocal || e.homeLogoEspn || resolveTeamLogo(e.homeTeamName);
    const awayLogo =
      e.awayLogoLocal || e.awayLogoEspn || resolveTeamLogo(e.awayTeamName);

    const scoringDetails = mapScoringPlaysToDetails(e.scoringPlays);
    const scoringSummaryShort =
      e.scoringSummaryShort ||
      (scoringDetails.length ? scoringDetails[scoringDetails.length - 1] : null);

    const dto: UpcomingGameDto = {
      id: e.id,
      dateFormatted,

      homeTeamName: e.homeTeamName,
      awayTeamName: e.awayTeamName,
      homeLogo,
      awayLogo,
      homeScore: e.homeScore,
      awayScore: e.awayScore,

      status: e.status,
      statusDetail: e.statusDetail,

      isPrimetime: e.isPrimetime,
      primetimeType: e.primetimeType,

      teamColorHome: e.teamColorHome,
      teamColorAway: e.teamColorAway,

      scoringSummaryShort,
      scoringDetails,
    };

    return dto;
  });
}
