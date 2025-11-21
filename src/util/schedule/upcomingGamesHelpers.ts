// src/util/schedule/upcomingGamesHelpers.ts

import type { UpcomingGameDto } from '@/types/schedule/upcomingGames'
import { getWinner } from './upcomingGamesHelper'

/**
 * UI Model:
 * Extends UpcomingGameDto with convenience booleans + css class
 */
export interface UpcomingGameUI extends UpcomingGameDto {
  homeIsWinner: boolean
  awayIsWinner: boolean
  statusClass: string
}

/**
 * Convert DTO → UI Model
 * This keeps the View extremely clean.
 */
export function toUpcomingGameUI(dto: UpcomingGameDto): UpcomingGameUI {
  const winner = getWinner(dto.homeScore, dto.awayScore)

  const statusClass = dto.status
    .toLowerCase()
    .replace(' ', '')        // "In Progress" → "inprogress"
    .replace('-', '')

  return {
    ...dto,

    homeIsWinner: winner === 'home',
    awayIsWinner: winner === 'away',

    statusClass
  }
}

/**
 * Convert many DTOs → UI models
 */
export function mapUpcomingGamesToUI(list: UpcomingGameDto[]): UpcomingGameUI[] {
  return list.map(toUpcomingGameUI)
}
