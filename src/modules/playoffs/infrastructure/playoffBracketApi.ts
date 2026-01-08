import { apiService } from '@/services/api'
import type { PlayoffBracketEventDto } from '@/modules/playoffs/domain/dtos/PlayoffBracketEventDto'

interface PlayoffBracketResponse {
  success: boolean
  seasonYear: number
  seasonType: number
  weeks: number[]
  events: PlayoffBracketEventDto[]
}

function normalizeEvents(payload: unknown): PlayoffBracketEventDto[] {
  if (!payload || typeof payload !== 'object') return []
  const obj = payload as Record<string, unknown>

  const events = obj.events
  if (Array.isArray(events)) return events as PlayoffBracketEventDto[]

  const data = obj.data
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>
    if (Array.isArray(d.events)) return d.events as PlayoffBracketEventDto[]
  }

  return []
}

export async function fetchPlayoffBracket(
  seasonYear: number,
  seasonType: 1 | 2 | 3 = 3,
  week?: number
): Promise<PlayoffBracketEventDto[]> {
  const params: Record<string, number> = { seasonYear, seasonType }
  if (typeof week === 'number') params.week = week

  const res = await apiService.get<PlayoffBracketResponse | unknown>(
    '/schedules/playoffBracket',
    params
  )
  const payload = (res as { data?: unknown }).data ?? res
  return normalizeEvents(payload)
}
