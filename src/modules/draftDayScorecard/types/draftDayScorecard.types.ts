export type DraftEventStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'

export type DraftPickStatus =
  | 'SCHEDULED'
  | 'ON_CLOCK'
  | 'PICKED'
  | 'TRADED'
  | 'FORFEITED'
  | 'SKIPPED'

export type NeedPriority = 'HIGH' | 'MEDIUM' | 'LOW'

export interface DraftEventDto {
  id: number
  draftYear: number
  name: string
  leagueCode: string
  status: DraftEventStatus
  startsAt: string | null
  endsAt: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface DraftPickDto {
  id: number
  draftEventId: number | null
  draftYear: number
  round: number
  pickNumber: number
  overallPick: number | null

  currentTeamId: number
  currentTeamName: string | null
  currentTeamAbbreviation: string | null
  currentTeamLogoUrl?: string | null

  originalTeamId: number | null
  originalTeamName: string | null
  originalTeamAbbreviation: string | null

  prospectId: number | null
  playerId: number | null
  playerName: string | null
  playerFirstName?: string | null
  playerLastName?: string | null
  headshotUrl?: string | null

  used: boolean
  status: DraftPickStatus

  isCompensatory: boolean
  acquiredViaTrade: boolean
  selectedAt: string | null

  position: string | null
  college: string | null

  pickGrade: string | null
  valueGrade: string | null
  needsFitGrade: string | null

  pickScore?: number | null
  valueScore?: number | null
  talentScore?: number | null
  needsFitScore?: number | null
  positionalPremiumScore?: number | null
  boardDisciplineScore?: number | null

  projectedTalentRank?: number | null
  dpaBoardRank?: number | null
  valueDelta?: number | null

  quickAnalysis?: string | null
  scoutNotes?: string | null
  analystNotes: string | null
  tradeNotes: string | null
}

export interface DraftScorecardDto {
  draftEvent: DraftEventDto
  picks: DraftPickDto[]
}

export interface DraftPositionCountDto {
  position: string
  count: number
  wasNeed: boolean
  needPriority: NeedPriority | null
}

export interface DraftTeamReportCardDto {
  draftYear: number
  draftEventId: number
  teamId: number
  teamName: string
  teamAbbreviation: string
  teamLogoUrl: string | null

  overallGrade: string | null
  overallScore: number | null

  valueScore: number | null
  talentScore: number | null
  needsFitScore: number | null
  positionalPremiumScore: number | null
  boardDisciplineScore: number | null

  summary: string | null
  bestPickSummary: string | null
  questionablePickSummary: string | null

  needsAddressed: string[]
  needsUnaddressed: string[]

  positionCounts: DraftPositionCountDto[]
  picks: DraftPickDto[]
}

export interface CreateDraftEventRequestDto {
  draftYear: number
  name: string
  leagueCode: string
  startsAt: string | null
  endsAt?: string | null
}

export interface SeedDraftPicksRequestDto {
  mode: 'MANUAL_STANDARD_7_ROUNDS' | 'EMPTY_EVENT'
}

export interface UpdateDraftPickRequestDto {
  draftEventId?: number | null
  draftYear?: number
  round?: number
  pickNumber?: number
  overallPick?: number | null
  currentTeamId?: number
  originalTeamId?: number | null
  prospectId?: number | null
  playerId?: number | null
  used?: boolean
  status?: DraftPickStatus
  isCompensatory?: boolean
  acquiredViaTrade?: boolean
  selectedAt?: string | null
  position?: string | null
  college?: string | null
  pickGrade?: string | null
  valueGrade?: string | null
  needsFitGrade?: string | null
  analystNotes?: string | null
  tradeNotes?: string | null
}

export interface CompleteDraftPickRequestDto {
  prospectId?: number | null
  playerId?: number | null
  playerFirstName?: string | null
  playerLastName?: string | null
  position?: string | null
  college?: string | null
  pickGrade?: string | null
  valueGrade?: string | null
  needsFitGrade?: string | null
  analystNotes?: string | null
}

export interface IDraftScorecardFilters {
  teamId: number | null
  round: number | null
  status: DraftPickStatus | null
  position: string | null
  searchText: string
  grade: string | null
}

export interface DraftTeamSummary {
  teamId: number
  teamName: string
  teamAbbreviation: string
  teamLogoUrl: string | null
  draftYear: number
  draftEventId: number
  overallGrade: string | null
  overallScore: number | null
  picksMade: number
  totalPicks: number
  positionCounts: DraftPositionCountDto[]
}

export interface SelectOption<TValue extends string | number | null> {
  label: string
  value: TValue
}
