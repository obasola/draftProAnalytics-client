// src/types/index.ts
export interface ApiResponse<T, P = any> {
  success: boolean
  data: T
  pagination?: P
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationMeta | null
}

// Updated to match your backend structure
export interface PaginationMeta {
  page: number        // Current page (1-based)
  limit: number       // Items per page
  total: number       // Total items
  pages: number       // Total pages
}
export interface Game {
  // Game fields
  id: number;
  seasonYear: string;
  gameWeek?: number | null;
  preseason?: number | null;
  gameDate?: Date | string | null;
  homeTeamId: number;
  awayTeamId: number;
  gameLocation?: string | null;
  gameCity?: string | null;
  gameStateProvince?: string | null;
  gameCountry?: string | null;
  homeScore?: number | null;
  awayScore?: number | null;
  gameStatus?: string | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
  
  // Relations
  homeTeam: {
    id: number;
    name: string;
    city?: string | null;
    state?: string | null;
    conference?: string | null;
    division?: string | null;
    stadium?: string | null;
  };
  
  awayTeam: {
    id: number;
    name: string;
    city?: string | null;
    state?: string | null;
    conference?: string | null;
    division?: string | null;
    stadium?: string | null;
  };
}

export interface Player {
  id?: number
  firstName: string
  lastName: string
  age: number
  height: number
  weight: number
  handSize: number
  armLength: number
  homeCity: string
  homeState: string
  university: string
  yearEnteredLeague: number
  position: string
  team?: Team
  awards?: PlayerAward[]
  pick?: DraftPick
  combineScore?: CombineScore
}




export interface PlayerAward {
  id?: number | undefined
  playerId: number | undefined
  awardName: string
  awardYear: number
  awardDescription?: string
}

// src/types/playerTeam.ts
// Actual PlayerTeam interface from server
export interface PlayerTeam {
  id: number
  playerId: number
  teamId: number
  currentTeam: boolean
  startDate: Date 
  endDate: Date | undefined
}

// For create operations (omits id and handles optional endDate)
export interface CreatePlayerTeam {
  playerId: number
  teamId: number
  currentTeam: boolean
  startDate: Date
  endDate?: Date
}


export interface Prospect {
  id?: number
  firstName: string
  lastName: string
  position: string
  college: string
  height: number
  weight: number
  handSize?: number
  armLength?: number
  homeCity?: string
  homeState?: string
  fortyTime?: number
  tenYardSplit?: number
  verticalLeap?: number
  broadJump?: number
  threeCone?: number
  twentyYardShuttle?: number
  benchPress?: number
  drafted: boolean
  draftYear?: number
  teamId?: number
  draftPickId?: number
  createdAt?: Date
  updatedAt?: Date
}

export interface Team {
  id?: number
  name: string
  city: string
  state: string
  conference: string
  division: string
  stadium: string
  country: string
  scheduleId?: number
}

export interface TeamNeed {
  id: number
  teamId: number
  draftYear: Date
  position: string
  priority: number
  createdDate: Date
  updatedAt: Date
}

export interface PostSeasonResult {
  id: number
  playoffYear: number
  lastRoundReached?: string
  winLose?: string
  opponentScore?: number
  teamScore?: number
  teamId?: number
}

export interface Schedule {
  id?: number
  teamId?: number
  seasonYear: string
  oppTeamId: number
  oppTeamConference?: string
  oppTeamDivision?: string
  scheduleWeek?: number
  gameDate?: Date
  gameCity?: string
  gameStateProvince?: string
  gameCountry?: string
  gameLocation?: string
  wonLostFlag?: string
  homeOrAway?: string
  oppTeamScore?: number
  teamScore: number
  result?: string
}

export interface DraftPick {
  id?: number
  draftYear: number
  round: number
  pickNumber: number
  playerId?: number
  teamId: number | undefined
  playerFirstName?: string
  playerLastName?: string
  pickFrom: number
  pickTo: number
  combineScore: number
}

export interface DraftSelection {
  id?: number;
  draftYear: number;
  draftRound: number;
  pickNumber: number;
  playerId: number;
  teamId: number;
  teamName?: string;
  playerName?: string;
  position: string;
  college?: string;
}

export interface CombineScore {
  id?: number
  playerId: number
  fortyTime: number
  tenYardSplit: number
  verticalLeap: number
  broadJump: number
  threeCone: number
  twentyYardShuttle: number
  benchPress: number
}

// Additional types to add to src/types/index.ts

export interface TeamStats {
  overall: GameRecord
  conference: GameRecord
  division: GameRecord
}

export interface GameRecord {
  won: number
  lost: number
}

export interface GameResult {
  isWin: boolean
  teamScore: number
  opponentScore: number
  opponent: TeamInfo
}

export interface TeamInfo {
  id: number
  name: string
  conference?: string | null
  division?: string | null
  city?: string | null
  state?: string | null
  stadium?: string | null
}

export interface StatsCalculationContext {
  teamId: number
  seasonYear: string
  team: TeamInfo
}

export type CrudMode = 'read' | 'create' | 'edit' | 'delete'
