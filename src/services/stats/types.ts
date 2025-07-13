// src/services/teamStats/types.ts
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

