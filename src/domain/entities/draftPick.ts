export interface DraftPick {
  id: number;
  round: number;
  pickNumber: number;
  draftYear: number;
  currentTeamId: number;
  prospectId?: number | null;
  playerId?: number | null;
  used: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  originalTeam?: number | null;
  position?: string | null;
  college?: string | null;
}

export interface DraftPickWithRelations {
  draftYear: number;
  round: number;
  pickNumber: number;
  player: string | null;
  team: string;
  position: string | null;
}

export interface CreateDraftPickData {
  round: number;
  pickNumber: number;
  draftYear: number;
  currentTeamId: number;
  prospectId?: number | null;
  playerId?: number | null;
  used?: boolean;
  originalTeam?: number | null;
  position?: string | null;
  college?: string | null;
}

export interface UpdateDraftPickData {
  round?: number;
  pickNumber?: number;
  draftYear?: number;
  currentTeamId?: number;
  prospectId?: number | null;
  playerId?: number | null;
  used?: boolean;
  originalTeam?: number | null;
  position?: string | null;
  college?: string | null;
}