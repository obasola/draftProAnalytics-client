// src/modules/playoffs/domain/PlayoffTypes.ts
export type PlayoffRound = 'WILDCARD' | 'DIVISIONAL' | 'CONFERENCE' | 'SUPERBOWL';
export type PlayoffConference = 'AFC' | 'NFC';

export interface PlayoffMatchup {
  gameId: number | null;
  seasonYear: number;
  round: PlayoffRound;
  conference: PlayoffConference;
  slot: string;
  homeTeamId: number | null;
  awayTeamId: number | null;
  homeSeed: number | null;
  awaySeed: number | null;
  homeScore: number | null;
  awayScore: number | null;
  winnerTeamId: number | null;
  gameDate: string | null;
}

export interface PlayoffRoundGroup {
  round: 'WILDCARD' | 'DIVISIONAL' | 'CONFERENCE';
  conference: PlayoffConference;
  matchups: PlayoffMatchup[];
}

export interface PlayoffBracket {
  seasonYear: number;
  afcRounds: PlayoffRoundGroup[];
  nfcRounds: PlayoffRoundGroup[];
  superBowl: PlayoffMatchup | null;
}
