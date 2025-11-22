// src/util/schedule/upcomingGamesHelpers.ts
//------------------------------------------------------
// This file consumes BACKEND NormalizedGameDTO
// and produces FRONTEND UpcomingGameUI
//------------------------------------------------------

import type { GameStatus, PrimetimeType } from '@/types/schedule/upcomingGames'

//------------------------------------------------------
// TYPES (FROM BACKEND)
//------------------------------------------------------
export interface NormalizedGameDTO {
  id: number

  date: string | null
  dateFormatted: { day: string; time: string }

  homeTeamId: number | null
  homeTeamName: string
  homeLogoLocal: string
  homeLogoEspn: string | null
  homeScore: number | null
  homeWinner: boolean
  teamColorHome: string

  awayTeamId: number | null
  awayTeamName: string
  awayLogoLocal: string
  awayLogoEspn: string | null
  awayScore: number | null
  awayWinner: boolean
  teamColorAway: string

  status: GameStatus
  statusDetail: string

  isPrimetime: boolean
  primetimeType: PrimetimeType
}

//------------------------------------------------------
// FRONTEND DTO
//------------------------------------------------------
export interface UpcomingGameDto {
  id: number

  date: string | null
  dateFormatted: { day: string; time: string }

  homeTeamId: number | null
  homeTeamName: string
  homeLogo: string
  homeScore: number | null
  homeWinner: boolean
  teamColorHome: string

  awayTeamId: number | null
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

//------------------------------------------------------
// UI MODEL
//------------------------------------------------------
export interface UpcomingGameUI extends UpcomingGameDto {
  homeIsWinner: boolean
  awayIsWinner: boolean
  statusClass: string
}

//------------------------------------------------------
// UTILS
//------------------------------------------------------
export function getWinner(h: number | null, a: number | null): 'home' | 'away' | null {
  if (h == null || a == null) return null
  if (h > a) return 'home'
  if (a > h) return 'away'
  return null
}

//------------------------------------------------------
// MAIN NORMALIZER: server DTO → client DTO
//------------------------------------------------------
export function normalizeToUpcomingDto(game: NormalizedGameDTO): UpcomingGameDto {
  return {
    id: game.id,

    date: game.date,
    dateFormatted: game.dateFormatted,

    homeTeamId: game.homeTeamId,
    homeTeamName: game.homeTeamName,
    homeLogo: game.homeLogoLocal,       // 👈 LOCAL LOGO
    homeScore: game.homeScore,
    homeWinner: game.homeWinner,
    teamColorHome: game.teamColorHome,

    awayTeamId: game.awayTeamId,
    awayTeamName: game.awayTeamName,
    awayLogo: game.awayLogoLocal,       // 👈 LOCAL LOGO
    awayScore: game.awayScore,
    awayWinner: game.awayWinner,
    teamColorAway: game.teamColorAway,

    status: game.status,
    statusDetail: game.statusDetail,

    isPrimetime: game.isPrimetime,
    primetimeType: game.primetimeType,
  }
}

//------------------------------------------------------
// UI MAPPER
//------------------------------------------------------
export function toUpcomingGameUI(dto: UpcomingGameDto): UpcomingGameUI {
  const w = getWinner(dto.homeScore, dto.awayScore)

  const statusClass =
    dto.status === 'Final'
      ? 'final'
      : dto.status === 'In Progress'
      ? 'in-progress'
      : 'scheduled'

  return {
    ...dto,
    homeIsWinner: w === 'home',
    awayIsWinner: w === 'away',
    statusClass,
  }
}

//------------------------------------------------------
// MAP MANY GAMES
//------------------------------------------------------
export function mapUpcomingGamesToUI(list: NormalizedGameDTO[]): UpcomingGameUI[] {
  return list.map(ev => toUpcomingGameUI(normalizeToUpcomingDto(ev)))
}
