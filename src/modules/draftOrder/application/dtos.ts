import type { DraftOrderMode } from "@/modules/draftOrder/domain/types"

export type SeasonType = 1 | 2 | 3

export interface DraftOrderTeamDto {
  id: number
  name: string
  abbreviation: string
}

export type DraftOrderAuditDto = Record<string, unknown>

export interface DraftOrderEntryDto {
  teamId: number
  team: DraftOrderTeamDto
  draftSlot: number
  wins: number
  losses: number
  ties: number
  winPct: string // decimals often serialized as string
  sos: string
  pointsFor: number | null
  pointsAgainst: number | null
  audits: DraftOrderAuditDto[]
}

export interface DraftOrderSnapshotListItemDto {
  id: number
  mode: DraftOrderMode
  strategy: string | null
  seasonYear: number
  seasonType: SeasonType
  throughWeek: number | null
  source: string
  inputHash: string
  computedAt: string // ISO UTC with Z
  jobId: string | null
  entryCount: number
}

export interface DraftOrderSnapshotDetailDto extends DraftOrderSnapshotListItemDto {
  entries: DraftOrderEntryDto[]
}

export interface DraftOrderSnapshotListQuery {
  mode?: DraftOrderMode
  strategy?: string
  seasonYear?: number
  seasonType?: SeasonType
  throughWeek?: number
  page?: number
  pageSize?: number
}

export interface JobQueuedDto {
  jobId: string
}

export interface PagedResult<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
}
