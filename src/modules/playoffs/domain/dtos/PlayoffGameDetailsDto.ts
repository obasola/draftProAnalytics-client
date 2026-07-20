export interface PlayoffGameTeamDetailsDto {
  readonly id: string | null
  readonly abbreviation: string
  readonly displayName: string
  readonly logoUrl: string | null
  readonly score: number | null
  readonly winner: boolean
  readonly record: string | null
  readonly linescores: number[]
}

export interface PlayoffGameStatRowDto {
  readonly label: string
  readonly away: string
  readonly home: string
}

export interface PlayoffGameLeaderRowDto {
  readonly category: string
  readonly away: string | null
  readonly home: string | null
}

export interface PlayoffGamePlayDto {
  readonly period: number | null
  readonly clock: string | null
  readonly text: string
  readonly awayScore: number | null
  readonly homeScore: number | null
}

export interface PlayoffGameDetailsDto {
  readonly gameId: number
  readonly espnEventId: string
  readonly seasonYear: number
  readonly playoffRound: string | null
  readonly playoffConference: string | null
  readonly playoffGameName: string | null
  readonly title: string
  readonly date: string | null
  readonly venue: string | null
  readonly location: string | null
  readonly status: string
  readonly awayTeam: PlayoffGameTeamDetailsDto
  readonly homeTeam: PlayoffGameTeamDetailsDto
  readonly teamStats: PlayoffGameStatRowDto[]
  readonly leaders: PlayoffGameLeaderRowDto[]
  readonly scoringPlays: PlayoffGamePlayDto[]
  readonly recentPlays: PlayoffGamePlayDto[]
}
