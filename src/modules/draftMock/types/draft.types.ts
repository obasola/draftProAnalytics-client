// Domain Types following DDD principles

export type DraftMode = 'solo' | 'multiplayer';
export type Conference = 'AFC' | 'NFC';
export type Position = 'QB' | 'RB' | 'WR' | 'TE' | 'OT' | 'OG' | 'OC' | 'DT' | 'EDGE' | 'LB' | 'CB' | 'S' | 'K' | 'P';

export interface Team {
  id: string;
  abbreviation: string;
  name: string;
  conference: Conference;
  division: string;
  logoUrl: string;
  colors: {
    primary: string;
    secondary: string;
  };
}

export interface Player {
  id: string;
  name: string;
  position: Position;
  college: string;
  rank: number;
  height: string;
  weight: number;
  isDrafted: boolean;
  draftedBy?: string;
  draftedRound?: number;
  draftedPick?: number;
}

export interface DraftPick {
  round: number;
  pick: number;
  overallPick: number;
  teamId: string;
  playerId?: string;
  timestamp?: Date;
}

export interface DraftSettings {
  rounds: number;
  draftSpeed: 'slow' | 'normal' | 'fast';
  playersList: 'PFSN' | 'Consensus' | 'ESPN' | 'PFF' | 'The Athletic';
  autoPickEnabled: boolean;
}

export interface DraftRoom {
  id: string;
  name: string;
  hostId: string;
  type: 'public' | 'private';
  password?: string;
  maxPlayers: number;
  currentPlayers: number;
  status: 'waiting' | 'in-progress' | 'completed';
  settings: DraftSettings;
}

export interface TradeOffer {
  id: string;
  fromTeamId: string;
  toTeamId: string;
  offeredPicks: DraftPick[];
  requestedPicks: DraftPick[];
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: Date;
}

export interface DraftState {
  mode: DraftMode;
  isStarted: boolean;
  isPaused: boolean;
  currentPick: DraftPick | null;
  selectedTeams: string[];
  completedPicks: DraftPick[];
  settings: DraftSettings;
}