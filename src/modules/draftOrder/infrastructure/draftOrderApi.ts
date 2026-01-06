import { apiService } from "@/services/api"
import type {
  DraftOrderSnapshotDetailDto,
  DraftOrderSnapshotListItemDto,
  DraftOrderSnapshotListQuery,
  JobQueuedDto,
  PagedResult,
  SeasonType,
} from "@/modules/draftOrder/application/dtos"
import type { DraftOrderMode } from "@/modules/draftOrder/domain/types"

type QueryValue = string | number | boolean | null | undefined
type QueryParams = Record<string, QueryValue>

function toQueryString(params: QueryParams): string {
  const usp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue
    usp.set(k, String(v))
  }
  const s = usp.toString()
  return s.length ? `?${s}` : ""
}

function normalizePaged<T>(data: unknown, pageDefault = 1, pageSizeDefault = 20): PagedResult<T> {
  // supports either: T[] OR { items, page, pageSize, total }
  if (Array.isArray(data)) {
    return { items: data as T[], page: pageDefault, pageSize: data.length, total: data.length }
  }

  if (typeof data === "object" && data !== null) {
    const obj = data as Partial<PagedResult<T>>
    if (Array.isArray(obj.items)) {
      return {
        items: obj.items,
        page: typeof obj.page === "number" ? obj.page : pageDefault,
        pageSize: typeof obj.pageSize === "number" ? obj.pageSize : pageSizeDefault,
        total: typeof obj.total === "number" ? obj.total : obj.items.length,
      }
    }
  }

  return { items: [], page: pageDefault, pageSize: pageSizeDefault, total: 0 }
}

export const draftOrderApi = {
  async listSnapshots(query: DraftOrderSnapshotListQuery): Promise<PagedResult<DraftOrderSnapshotListItemDto>> {
    // Your ApiService.get(url, params) passes params as axios config params, so use that here.
    const params = {
      mode: query.mode,
      strategy: query.strategy,
      seasonYear: query.seasonYear,
      seasonType: query.seasonType,
      throughWeek: query.throughWeek,
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
    }

    const res = await apiService.get<unknown>(`/draft-order/snapshots`, params)
    return normalizePaged<DraftOrderSnapshotListItemDto>(res.data, params.page, params.pageSize)
  },

  async getSnapshotById(id: number): Promise<DraftOrderSnapshotDetailDto> {
    const res = await apiService.get<DraftOrderSnapshotDetailDto>(`/draft-order/snapshots/${id}`)
    return res.data
  },

  async computeNow(
    mode: DraftOrderMode,
    args: {
      seasonYear: number
      seasonType: SeasonType
      throughWeek?: number | null
      strategy?: string | null
    },
  ): Promise<DraftOrderSnapshotDetailDto> {
    const qs = toQueryString({
      seasonYear: args.seasonYear,
      seasonType: args.seasonType,
      throughWeek: args.throughWeek ?? undefined,
      strategy: mode === "projection" ? (args.strategy ?? undefined) : undefined,
    })

    const path =
      mode === "current"
        ? `/draft-order/compute/current${qs}`
        : `/draft-order/compute/projection${qs}`

    const res = await apiService.post<DraftOrderSnapshotDetailDto>(path, {})
    return res.data
  },

  async queueJob(
    mode: DraftOrderMode,
    args: {
      seasonYear: number
      seasonType: SeasonType
      throughWeek?: number | null
      strategy?: string | null
    },
  ): Promise<JobQueuedDto> {
    const qs = toQueryString({
      seasonYear: args.seasonYear,
      seasonType: args.seasonType,
      throughWeek: args.throughWeek ?? undefined,
      strategy: mode === "projection" ? (args.strategy ?? undefined) : undefined,
    })

    const path =
      mode === "current"
        ? `/draft-order/jobs/current${qs}`
        : `/draft-order/jobs/projection${qs}`

    const res = await apiService.post<JobQueuedDto>(path, {})
    return res.data
  },
} as const
