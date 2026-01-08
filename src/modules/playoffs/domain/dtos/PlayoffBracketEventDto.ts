// src/modules/playoffs/stores/dto/PlayoffBracketEventDto.ts
export type PlayoffRound = 'WILD_CARD' | 'DIVISIONAL' | 'CONFERENCE' | 'SUPER_BOWL'
export type PlayoffConference = 'AFC' | 'NFC'

export interface PlayoffBracketEventDto {
  id: number

  date: string | null
  dateFormatted: { day: string; time: string } | null

  status: string
  statusDetail?: string | null

  homeTeamId: number | null // ESPN team id (or -1 for TBD)
  awayTeamId: number | null
  homeTeamName: string
  awayTeamName: string

  homeLogoLocal: string
  awayLogoLocal: string
  homeLogoEspn: string | null
  awayLogoEspn: string | null

  homeScore: number | null
  awayScore: number | null
  homeWinner: boolean
  awayWinner: boolean

  isPlayoff: boolean
  playoffRound: PlayoffRound | null
  playoffConference: PlayoffConference | null

  homeSeed: number | null
  awaySeed: number | null

  homeTeamAbbrev: string | null
  awayTeamAbbrev: string | null

  homeTeamDbId: number | null // your DB Team.id
  awayTeamDbId: number | null
}
