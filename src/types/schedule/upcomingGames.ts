// src/types/schedule/upcomingGames.ts

export type GameStatus =
  | 'Scheduled'
  | 'In Progress'
  | 'Final'
  | 'Postponed'

export type PrimetimeType = 'TNF' | 'SNF' | 'MNF' | null

export interface UpcomingGameDto {
  id: number

  date: string
  dateFormatted: {
    day: string
    time: string
  }

  homeTeamId: number
  homeTeamName: string
  homeLogo: string
  homeScore: number | null
  homeWinner: boolean
  teamColorHome: string

  awayTeamId: number
  awayTeamName: string
  awayLogo: string
  awayScore: number | null
  awayWinner: boolean
  teamColorAway: string

  status: GameStatus
  statusDetail: string

  isPrimetime: boolean
  primetimeType: PrimetimeType
}
