import { api } from '@/services/api'
import type {
  CompleteDraftPickRequestDto,
  CreateDraftEventRequestDto,
  DraftEventDto,
  DraftScorecardDto,
  DraftTeamReportCardDto,
  SeedDraftPicksRequestDto,
  UpdateDraftPickRequestDto,
} from '../types/draftDayScorecard.types'

const baseUrl = '/draft-day-scorecard'

export async function createDraftEvent(
  request: CreateDraftEventRequestDto,
): Promise<DraftEventDto> {
  const response = await api.post<DraftEventDto>(`${baseUrl}/events`, request)
  return response.data
}

export async function fetchDraftEvents(): Promise<DraftEventDto[]> {
  const response = await api.get<DraftEventDto[]>(`${baseUrl}/events`)
  return response.data
}

export async function fetchDraftEvent(draftEventId: number): Promise<DraftEventDto> {
  const response = await api.get<DraftEventDto>(`${baseUrl}/events/${draftEventId}`)
  return response.data
}

export async function fetchDraftScorecard(draftEventId: number): Promise<DraftScorecardDto> {
  const response = await api.get<DraftScorecardDto>(
    `${baseUrl}/events/${draftEventId}/scorecard`,
  )
  return response.data
}

export async function fetchTeamDraftReportCard(
  draftEventId: number,
  teamId: number,
): Promise<DraftTeamReportCardDto> {
  const response = await api.get<DraftTeamReportCardDto>(
    `${baseUrl}/events/${draftEventId}/teams/${teamId}`,
  )
  return response.data
}

export async function seedDraftPicks(
  draftEventId: number,
  request: SeedDraftPicksRequestDto,
): Promise<DraftScorecardDto> {
  const response = await api.post<DraftScorecardDto>(
    `${baseUrl}/events/${draftEventId}/seed-picks`,
    request,
  )
  return response.data
}

export async function updateDraftPick(
  draftPickId: number,
  request: UpdateDraftPickRequestDto,
): Promise<void> {
  await api.put<void>(`${baseUrl}/picks/${draftPickId}`, request)
}

export async function markDraftPickOnClock(draftPickId: number): Promise<void> {
  await api.patch<void>(`${baseUrl}/picks/${draftPickId}/on-clock`)
}

export async function completeDraftPick(
  draftPickId: number,
  request: CompleteDraftPickRequestDto,
): Promise<void> {
  await api.patch<void>(`${baseUrl}/picks/${draftPickId}/complete`, request)
}
