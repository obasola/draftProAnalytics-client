export interface PlayoffTeamDto {
  id: number
  name: string
  abbreviation?: string | null
  conference?: string | null
  division?: string | null
}

export interface PlayoffGameDto {
  id: number
  seasonYear: string
  seasonType: number | null
  gameWeek: number | null
  gameDate: string

  homeTeamId: number
  awayTeamId: number

  homeTeam?: PlayoffTeamDto
  awayTeam?: PlayoffTeamDto

  homeScore?: number | null
  awayScore?: number | null
  gameStatus: string

  isPlayoff?: boolean
  playoffRound?: string | null
  playoffConference?: string | null
  homeSeed?: number | null
  awaySeed?: number | null
}
