<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useDraftOrderStore } from "@/modules/draftOrder/presentation/store/draftOrderStore"
import type { DraftOrderSnapshotListItemDto, SeasonType } from "@/modules/draftOrder/application/dtos"
import type { DraftOrderMode } from "@/modules/draftOrder/domain/types"

import DataTable from "primevue/datatable"
import Column from "primevue/column"
import Button from "primevue/button"
import Dropdown from "primevue/dropdown"
import InputNumber from "primevue/inputnumber"
import InputText from "primevue/inputtext"
import Message from "primevue/message"
import TimezoneSelector from "@/modules/draftOrder/presentation/components/TimezoneSelector.vue"

type ModeOption = { label: string; value: DraftOrderMode }
type SeasonTypeOption = { label: string; value: SeasonType }

const store = useDraftOrderStore()
const route = useRoute()
const router = useRouter()

const seasonTypes: SeasonTypeOption[] = [
  { label: "Preseason", value: 1 },
  { label: "Regular", value: 2 },
  { label: "Postseason", value: 3 },
]

const modeOptions: ModeOption[] = [
  { label: "Current", value: "current" },
  { label: "Projection", value: "projection" },
]

const selectedTeamId = computed<number | null>(() => {
  const v = route.query.teamId
  if (typeof v !== "string") return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
})

const selectedTeamDraftSlot = ref<number | null>(null)
const selectedTeamSnapshotId = ref<number | null>(null)

async function refresh(): Promise<void> {
  store.resetPaging()
  await store.fetchSnapshots()

  // optional: if teamId is provided, resolve its slot using newest snapshot (first row)
  selectedTeamDraftSlot.value = null
  selectedTeamSnapshotId.value = null

  if (selectedTeamId.value && store.list.length > 0) {
    const newest = store.list[0]
    selectedTeamSnapshotId.value = newest.id
    try {
      await store.fetchSnapshotDetail(newest.id)
      const entry = store.detail?.entries.find((e) => e.teamId === selectedTeamId.value) ?? null
      selectedTeamDraftSlot.value = entry?.draftSlot ?? null
    } catch {
      selectedTeamDraftSlot.value = null
    }
  }
}

function goDetail(row: DraftOrderSnapshotListItemDto): void {
  const q: Record<string, string> = {}
  if (selectedTeamId.value) q.teamId = String(selectedTeamId.value)
  void router.push({ path: `/draft-order/snapshots/${row.id}`, query: q })
}

async function onComputeSync(): Promise<void> {
  const snap = await store.computeNow()
  void router.push({
    path: `/draft-order/snapshots/${snap.id}`,
    query: selectedTeamId.value ? { teamId: String(selectedTeamId.value) } : undefined,
  })
}

async function onQueueJob(): Promise<void> {
  const jobId = await store.queueJob()
  // keep you on this page, but make it easy to jump to job monitor
  void jobId
}

function openJob(): void {
  if (!store.lastQueuedJobId) return
  void router.push(`/jobs/${store.lastQueuedJobId}`)
}

function computedAtCell(row: DraftOrderSnapshotListItemDto): string {
  return store.computedAtFormatted(row.computedAt)
}

watch(
  () => route.query,
  async () => {
    // if someone deep-links with teamId/season filters in query later, this keeps it responsive
    await refresh()
  },
)

onMounted(async () => {
  // allow deep-link overrides for season filters
  const qYear = route.query.seasonYear
  const qType = route.query.seasonType
  const qWeek = route.query.throughWeek
  const qMode = route.query.mode
  const qStrat = route.query.strategy

  if (typeof qYear === "string") {
    const y = Number(qYear)
    if (Number.isFinite(y)) store.seasonYear = y
  }
  if (typeof qType === "string") {
    const t = Number(qType)
    if (t === 1 || t === 2 || t === 3) store.seasonType = t
  }
  if (typeof qWeek === "string") {
    const w = Number(qWeek)
    store.throughWeek = Number.isFinite(w) ? w : store.throughWeek
  }
  if (typeof qMode === "string" && (qMode === "current" || qMode === "projection")) {
    store.mode = qMode
  }
  if (typeof qStrat === "string" && qStrat.length) {
    store.strategy = qStrat
  }

  await refresh()
})

const showStrategy = computed(() => store.canUseStrategy)
</script>

<template>
  <div class="page draft-order p-4">
    <div class="flex align-items-center justify-content-between mb-3">
      <h2 class="text-xl font-bold">Draft Order</h2>
      <TimezoneSelector :modelValue="store.tzMode" @update:modelValue="store.setTimezoneMode" />
    </div>

    <div class="grid">
      <div class="col-12">
        <div class="p-3 surface-card border-round">
          <div class="flex flex-wrap gap-3 align-items-end">
            <div class="flex flex-column gap-1">
              <label class="font-semibold">Season Year</label>
              <InputNumber v-model="store.seasonYear" :useGrouping="false" inputClass="w-10rem" />
            </div>

            <div class="flex flex-column gap-1">
              <label class="font-semibold">Season Type</label>
              <Dropdown v-model="store.seasonType" :options="seasonTypes" optionLabel="label" optionValue="value" class="w-12rem" />
            </div>

            <div class="flex flex-column gap-1">
              <label class="font-semibold">Through Week</label>
              <InputNumber v-model="store.throughWeek" :useGrouping="false" inputClass="w-10rem" />
            </div>

            <div class="flex flex-column gap-1">
              <label class="font-semibold">Mode</label>
              <Dropdown v-model="store.mode" :options="modeOptions" optionLabel="label" optionValue="value" class="w-12rem" />
            </div>

            <div v-if="showStrategy" class="flex flex-column gap-1">
              <label class="font-semibold">Strategy</label>
              <InputText v-model="store.strategy" class="w-12rem" placeholder="baseline" />
            </div>

            <div class="flex gap-2 ml-auto">
              <Button label="Refresh" icon="pi pi-refresh" outlined :loading="store.loadingList" @click="refresh" />
              <Button label="Compute Now (Sync)" icon="pi pi-bolt" :loading="store.loadingList" @click="onComputeSync" />
              <Button label="Queue Job (Async)" icon="pi pi-clock" severity="secondary" :loading="store.loadingList" @click="onQueueJob" />
            </div>
          </div>

          <div class="mt-3" v-if="store.lastQueuedJobId">
            <Message severity="info" :closable="true">
              Job queued: <b>{{ store.lastQueuedJobId }}</b>
              <Button class="ml-2" size="small" label="Open Job" icon="pi pi-external-link" outlined @click="openJob" />
            </Message>
          </div>

          <div class="mt-3" v-if="selectedTeamId">
            <Message severity="success" :closable="false">
              Deep-link teamId: <b>{{ selectedTeamId }}</b>
              <span v-if="selectedTeamDraftSlot !== null">
                — Draft Slot (newest snapshot #{{ selectedTeamSnapshotId }}): <b>#{{ selectedTeamDraftSlot }}</b>
              </span>
              <span v-else class="opacity-80">— Select a snapshot to see slot.</span>
            </Message>
          </div>
        </div>
      </div>

      <div class="col-12 mt-3">
        <DataTable
          :value="store.list"
          :loading="store.loadingList"
          dataKey="id"
          responsiveLayout="scroll"
          selectionMode="single"
          @rowSelect="(e) => goDetail(e.data as DraftOrderSnapshotListItemDto)"
        >
          <Column field="id" header="Id" style="width: 90px" />
          <Column header="Computed At">
            <template #body="{ data }">
              {{ computedAtCell(data as DraftOrderSnapshotListItemDto) }}
            </template>
          </Column>
          <Column field="mode" header="Mode" style="width: 120px" />
          <Column field="strategy" header="Strategy" style="width: 160px" />
          <Column field="seasonYear" header="Year" style="width: 110px" />
          <Column field="seasonType" header="Type" style="width: 110px" />
          <Column field="throughWeek" header="Week" style="width: 110px" />
          <Column field="entryCount" header="Entries" style="width: 110px" />
          <Column field="source" header="Source" style="width: 140px" />
          <Column field="jobId" header="JobId" style="width: 160px" />
        </DataTable>
      </div>
    </div>
  </div>
</template>
