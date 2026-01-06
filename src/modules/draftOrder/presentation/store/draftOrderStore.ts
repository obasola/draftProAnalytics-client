import { defineStore } from "pinia"
import { computed, ref } from "vue"
import type { DraftOrderMode, TimezoneMode } from "@/modules/draftOrder/domain/types"
import { formatWithTz } from "@/modules/draftOrder/domain/types"
import type {
  DraftOrderSnapshotDetailDto,
  DraftOrderSnapshotListItemDto,
  PagedResult,
  SeasonType,
} from "@/modules/draftOrder/application/dtos"
import { draftOrderApi } from "@/modules/draftOrder/infrastructure/draftOrderApi"

const LS_TZ_KEY = "dpa.tzMode"

function inferSeasonYear(now: Date): number {
  // NFL season year is typically the year the season starts.
  // Jan–Jun => previous year, Jul–Dec => current year.
  const y = now.getFullYear()
  const m = now.getMonth() // 0-based
  return m < 6 ? y - 1 : y
}

export const useDraftOrderStore = defineStore("draftOrder", () => {
  // filters
  const seasonYear = ref<number>(inferSeasonYear(new Date()))
  const seasonType = ref<SeasonType>(2)
  const throughWeek = ref<number | null>(18)
  const mode = ref<DraftOrderMode>("current")
  const strategy = ref<string>("baseline")

  // list state
  const loadingList = ref(false)
  const list = ref<DraftOrderSnapshotListItemDto[]>([])
  const total = ref<number>(0)
  const page = ref<number>(1)
  const pageSize = ref<number>(20)

  // detail state
  const loadingDetail = ref(false)
  const detail = ref<DraftOrderSnapshotDetailDto | null>(null)

  // last async job queued
  const lastQueuedJobId = ref<string | null>(null)

  // timezone preference
  const tzMode = ref<TimezoneMode>((localStorage.getItem(LS_TZ_KEY) as TimezoneMode | null) ?? "local")
  const setTimezoneMode = (v: TimezoneMode): void => {
    tzMode.value = v
    localStorage.setItem(LS_TZ_KEY, v)
  }

  const computedAtFormatted = (isoUtc: string): string => formatWithTz(isoUtc, tzMode.value)

  const canUseStrategy = computed(() => mode.value === "projection")

  async function fetchSnapshots(): Promise<void> {
    loadingList.value = true
    try {
      const q = {
        mode: mode.value,
        strategy: canUseStrategy.value ? strategy.value : undefined,
        seasonYear: seasonYear.value,
        seasonType: seasonType.value,
        throughWeek: throughWeek.value ?? undefined,
        page: page.value,
        pageSize: pageSize.value,
      }
      const res: PagedResult<DraftOrderSnapshotListItemDto> = await draftOrderApi.listSnapshots(q)
      list.value = res.items
      total.value = res.total
      page.value = res.page
      pageSize.value = res.pageSize
    } finally {
      loadingList.value = false
    }
  }

  async function fetchSnapshotDetail(id: number): Promise<void> {
    loadingDetail.value = true
    try {
      detail.value = await draftOrderApi.getSnapshotById(id)
    } finally {
      loadingDetail.value = false
    }
  }

  async function computeNow(): Promise<DraftOrderSnapshotDetailDto> {
    const snap = await draftOrderApi.computeNow(mode.value, {
      seasonYear: seasonYear.value,
      seasonType: seasonType.value,
      throughWeek: throughWeek.value,
      strategy: canUseStrategy.value ? strategy.value : null,
    })
    detail.value = snap
    await fetchSnapshots()
    return snap
  }

  async function queueJob(): Promise<string> {
    const res = await draftOrderApi.queueJob(mode.value, {
      seasonYear: seasonYear.value,
      seasonType: seasonType.value,
      throughWeek: throughWeek.value,
      strategy: canUseStrategy.value ? strategy.value : null,
    })
    lastQueuedJobId.value = res.jobId
    return res.jobId
  }

  function resetPaging(): void {
    page.value = 1
  }

  return {
    // filters
    seasonYear,
    seasonType,
    throughWeek,
    mode,
    strategy,
    canUseStrategy,

    // list
    loadingList,
    list,
    total,
    page,
    pageSize,

    // detail
    loadingDetail,
    detail,

    // async jobs
    lastQueuedJobId,

    // tz
    tzMode,
    setTimezoneMode,
    computedAtFormatted,

    // actions
    resetPaging,
    fetchSnapshots,
    fetchSnapshotDetail,
    computeNow,
    queueJob,
  }
})
