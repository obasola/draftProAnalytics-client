export type Conference = 'NFC' | 'AFC'

export interface BracketTeamDto {
  teamId: number
  seed: number
  abbrev: string
  name: string
  conference: Conference
  logoUrl: string
}

export interface BracketGameDto {
  id: string
  round: 'WILD_CARD' | 'DIVISIONAL' | 'CONFERENCE' | 'SUPER_BOWL'
  conference: Conference | 'NFL' // NFL = super bowl
  slot: 'WC_54' | 'WC_63' | 'WC_72' | 'DIV_1vL' | 'DIV_X' | 'CONF' | 'SB'

  topTeam: BracketTeamDto | null
  bottomTeam: BracketTeamDto | null

  topScore: number | null
  bottomScore: number | null

  winnerTeamId: number | null
}

export interface PlayoffBracketDto {
  seasonYear: number
  seasonType: number
  // optional: if you support “as of week”
  week?: number

  games: BracketGameDto[]
}
