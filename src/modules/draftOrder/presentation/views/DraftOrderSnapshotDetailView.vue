<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue"
import { useRoute } from "vue-router"
import { useDraftOrderStore } from "@/modules/draftOrder/presentation/store/draftOrderStore"
import type { DraftOrderEntryDto } from "@/modules/draftOrder/application/dtos"

import Card from "primevue/card"
import DataTable from "primevue/datatable"
import Column from "primevue/column"
import Message from "primevue/message"
import Button from "primevue/button"
import TimezoneSelector from "@/modules/draftOrder/presentation/components/TimezoneSelector.vue"
import TeamNeedsPlaceholder from "@/modules/draftOrder/presentation/components/TeamNeedsPlaceholder.vue"

import {
  getTeamLogoInfo,
  getTeamShortName as getShortName,
  type TeamRef,
} from "@/util/teamLogo"

const store = useDraftOrderStore()
const route = useRoute()

const snapshotId = computed<number>(() => Number(route.params.id))

const selectedTeamId = computed<number | null>(() => {
  const v = route.query.teamId
  if (typeof v !== "string") return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
})

const selectedTeamName = computed<string | null>(() => {
  const e = store.detail?.entries.find((x) => x.teamId === selectedTeamId.value)
  return e?.team?.name ?? null
})

const tableRef = ref<InstanceType<typeof DataTable> | null>(null)

function rowClass(entry: DraftOrderEntryDto): string {
  if (!selectedTeamId.value) return ""
  return entry.teamId === selectedTeamId.value ? "is-selected-team" : ""
}

function computedAtLabel(): string {
  if (!store.detail) return ""
  return store.computedAtFormatted(store.detail.computedAt)
}

async function load(): Promise<void> {
  if (!Number.isFinite(snapshotId.value)) return
  await store.fetchSnapshotDetail(snapshotId.value)

  // attempt to scroll to selected team row (best effort)
  if (selectedTeamId.value) {
    await nextTick()
    const el = document.querySelector(`[data-team-id="${selectedTeamId.value}"]`)
    if (el instanceof HTMLElement) el.scrollIntoView({ behavior: "smooth", block: "center" })
  }
}

type LogoTeam = { name: string; conference?: string }

const AFC = new Set([
  "BAL","BUF","CIN","CLE","DEN","HOU","IND","JAX","KC","LV","LAC","MIA","NE","NYJ","PIT","TEN",
])

const NFC = new Set([
  "ARI","ATL","CAR","CHI","DAL","DET","GB","LAR","MIN","NO","NYG","PHI","SEA","SF","TB","WAS",
])

function inferConferenceFromAbbr(abbr: string | null | undefined): "AFC" | "NFC" | "" {
  const a = String(abbr ?? "").trim().toUpperCase()
  if (AFC.has(a)) return "AFC"
  if (NFC.has(a)) return "NFC"
  return ""
}
const AFC_SHORT = new Set([
  "Ravens","Bills","Bengals","Browns","Broncos","Texans","Colts","Jaguars",
  "Chiefs","Raiders","Chargers","Dolphins","Patriots","Jets","Steelers","Titans",
])

const NFC_SHORT = new Set([
  "Cardinals","Falcons","Panthers","Bears","Cowboys","Lions","Packers","Rams",
  "Vikings","Saints","Giants","Eagles","49ers","Seahawks","Buccaneers","Commanders",
])

function inferConferenceFromTeamName(teamName: string): "AFC" | "NFC" | "" {
  const shortName = getShortName(teamName)
  if (AFC_SHORT.has(shortName)) return "AFC"
  if (NFC_SHORT.has(shortName)) return "NFC"
  return ""
}

function getEntryLogoUrl(entry: DraftOrderEntryDto): string {
  const conference = inferConferenceFromTeamName(entry.team.name)
  const info = getTeamLogoInfo({ name: entry.team.name, conference } as TeamRef)
  return info.logoUrl
}


function getEntryShortName(entry: DraftOrderEntryDto): string {
  return getShortName(entry.team.name)
}


watch(
  () => route.fullPath,
  async () => {
    await load()
  },
)

onMounted(async () => {
  await load()
})
</script>

<template>
  <div class="page draft-order-detail p-4">
    <div class="flex align-items-center justify-content-between mb-3">
      <h2 class="text-xl font-bold">Draft Order Snapshot</h2>
      <TimezoneSelector :modelValue="store.tzMode" @update:modelValue="store.setTimezoneMode" />
    </div>

    <div v-if="store.detail" class="grid">
      <div class="col-12 lg:col-8">
        <Card>
          <template #title>Snapshot #{{ store.detail.id }}</template>
          <template #content>
            <div class="flex flex-wrap gap-3 mb-3">
              <Message severity="info" :closable="false">
                Computed At: <b>{{ computedAtLabel() }}</b>
              </Message>
              <Message severity="info" :closable="false">
                Mode: <b>{{ store.detail.mode }}</b>
              </Message>
              <Message v-if="store.detail.strategy" severity="info" :closable="false">
                Strategy: <b>{{ store.detail.strategy }}</b>
              </Message>
              <Message severity="info" :closable="false">
                Season: <b>{{ store.detail.seasonYear }}</b> / Type <b>{{ store.detail.seasonType }}</b>
                <span v-if="store.detail.throughWeek !== null"> / Week <b>{{ store.detail.throughWeek }}</b></span>
              </Message>
            </div>

            <Message v-if="selectedTeamId" severity="success" :closable="false" class="mb-3">
              Highlighting teamId: <b>{{ selectedTeamId }}</b>
              <span v-if="selectedTeamName"> — <b>{{ selectedTeamName }}</b></span>
            </Message>

            <DataTable
              ref="tableRef"
              :value="store.detail.entries"
              :loading="store.loadingDetail"
              dataKey="teamId"
              responsiveLayout="scroll"
              sortField="draftSlot"
              :sortOrder="1"
              :rowClass="rowClass"
            >
              <Column field="draftSlot" header="Slot" style="width: 90px" />
              <Column header="Team" style="width: 260px">
                <template #body="{ data }">
                  <div class="flex align-items-center gap-2" :data-team-id="(data as DraftOrderEntryDto).teamId">
                    <img
                      :src="getEntryLogoUrl(data as DraftOrderEntryDto)"
                      class="team-icon"
                      :alt="(data as DraftOrderEntryDto).team.name"
                    />
                    <span class="team-name">&nbsp;&nbsp;{{ (data as DraftOrderEntryDto).team.name }}</span>
                  </div>
                </template>
              </Column>

              <Column header="W-L-T" style="width: 140px">
                <template #body="{ data }">
                  <span>
                    {{ (data as DraftOrderEntryDto).wins }}-{{ (data as DraftOrderEntryDto).losses }}-{{ (data as DraftOrderEntryDto).ties }}
                  </span>
                </template>
              </Column>
              <Column field="winPct" header="Win%" style="width: 120px" />
              <Column field="sos" header="SoS" style="width: 120px" />
              <Column field="pointsFor" header="PF" style="width: 110px" />
              <Column field="pointsAgainst" header="PA" style="width: 110px" />
              <Column header="Audits" style="width: 110px">
                <template #body="{ data }">
                  {{ ((data as DraftOrderEntryDto).audits?.length ?? 0) }}
                </template>
              </Column>
            </DataTable>
          </template>
        </Card>
      </div>

      <div class="col-12 lg:col-4">
        <TeamNeedsPlaceholder :teamName="selectedTeamName" />
      </div>
    </div>

    <div v-else>
      <Message severity="warn" :closable="false">Loading snapshot...</Message>
    </div>
  </div>
</template>

<style scoped>
:deep(.is-selected-team) {
  outline: 2px solid rgba(0, 0, 0, 0.25);
  box-shadow: inset 0 0 0 9999px rgba(255, 193, 7, 0.18);
}
.team-icon {
  width: 58px;
  height: 58px;
  object-fit: contain;
  vertical-align: middle;
}

.team-name {
  font-weight: 700;
}

</style>
