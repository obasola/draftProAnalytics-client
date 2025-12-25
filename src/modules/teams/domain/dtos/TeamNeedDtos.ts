export interface TeamNeedDto {
  id: number;
  teamId: number;
  position: string;
  priority: number;
  draftYear: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface TeamNeedSuggestionDto {
  position: string;
  priority: number;
  draftYear: number | null;
  reasons: string[];
  rosterCount: number;
  avgAge: number | null;
  expiringCount: number;
}

export interface TeamNeedsPageDto {
  teamId: number;
  evaluationYear: number;
  persistedNeeds: TeamNeedDto[];
  suggestions: TeamNeedSuggestionDto[];
}


