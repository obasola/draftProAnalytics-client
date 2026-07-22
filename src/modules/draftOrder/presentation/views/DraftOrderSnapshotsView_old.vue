<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useRoute } from "vue-router"
import { useDraftOrderStore } from "@/modules/draftOrder/presentation/store/draftOrderStore"
import type { DraftOrderAuditDto, DraftOrderEntryDto } from "@/modules/draftOrder/application/dtos"

import Button from "primevue/button"
import Column from "primevue/column"
import DataTable from "primevue/datatable"
import Dropdown from "primevue/dropdown"
import Message from "primevue/message"

interface NumberOption {
  label: string
  value: number
}

const store = useDraftOrderStore()
const route = useRoute()
const computing = ref(false)
const errorMessage = ref<string | null>(null)

const currentYear = new Date().getFullYear()
const seasonOptions: NumberOption[] = Array.from({ length: 12 }, (_, index) => {
  const year = currentYear - index
  return { label: String(year), value: year }
})
const weekOptions: NumberOption[] = Array.from({ length: 18 }, (_, index) => ({
  label: `Week ${index + 1}`,
  value: index + 1,
}))

const selectedTeamId = computed<number | null>(() => {
  const raw = route.query.teamId
  if (typeof raw !== "string") return null
  const parsed = Number(raw)
  return Number.isInteger(parsed) ? parsed : null
})

const rows = computed<DraftOrderEntryDto[]>(() => store.detail?.entries ?? [])

function formatPercentage(value: string): string {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed.toFixed(3) : value
}

function record(row: DraftOrderEntryDto): string {
  return `${row.wins}-${row.losses}-${row.ties}`
}

function tiebreakSummary(row: DraftOrderEntryDto): string {
  const audits = row.audits as DraftOrderAuditDto[]
  const nflAudit = audits.find((audit) => audit.ruleCode === "NFL_TIEBREAK_CHAIN")
  if (nflAudit) return "NFL tiebreak chain applied as needed"
  const sosAudit = audits.find((audit) => audit.ruleCode === "SOS")
  return sosAudit ? "Strength of schedule" : "Record"
}

function rowClass(row: DraftOrderEntryDto): string | undefined {
  return selectedTeamId.value === row.teamId ? "selected-team-row" : undefined
}

async function calculateDraftOrder(): Promise<void> {
  computing.value = true
  errorMessage.value = null
  store.mode = "current"
  store.seasonType = 2

  try {
    await store.computeNow()
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : "Unable to calculate the draft order."
  } finally {
    computing.value = false
  }
}

onMounted(async () => {
  const year = Number(route.query.seasonYear)
  const week = Number(route.query.throughWeek)
  if (Number.isInteger(year)) store.seasonYear = year
  if (Number.isInteger(week) && week >= 1 && week <= 18) store.throughWeek = week
  await calculateDraftOrder()
})
</script>

<template>
  <div class="page draft-order p-4">
    <div class="mb-3">
      <h2 class="text-2xl font-bold mb-1">NFL Draft Order</h2>
      <p class="m-0 text-color-secondary">
        Provisional order through the selected regular-season week. Lower winning percentage selects first;
        tied records use strength of schedule and the remaining NFL tiebreak sequence.
      </p>
    </div>

    <div class="surface-card border-round p-3 mb-3">
      <div class="draft-order-controls">
        <div class="flex flex-column gap-1">
          <label class="font-semibold" for="draft-season">Season</label>
          <Dropdown
            id="draft-season"
            v-model="store.seasonYear"
            :options="seasonOptions"
            optionLabel="label"
            optionValue="value"
            class="w-10rem"
          />
        </div>

        <div class="flex flex-column gap-1">
          <label class="font-semibold" for="draft-week">Thru Week</label>
          <Dropdown
            id="draft-week"
            v-model="store.throughWeek"
            :options="weekOptions"
            optionLabel="label"
            optionValue="value"
            class="w-10rem"
          />
        </div>

        <Button
          label="Calculate Draft Order"
          icon="pi pi-calculator"
          :loading="computing"
          @click="calculateDraftOrder"
        />
      </div>
    </div>

    <Message v-if="errorMessage" severity="error" :closable="false" class="mb-3">
      {{ errorMessage }}
    </Message>

    <Message v-else-if="!computing && rows.length !== 32" severity="warn" :closable="false" class="mb-3">
      The calculation returned {{ rows.length }} teams. The Team table must contain exactly 32 NFL clubs.
    </Message>

    <DataTable
      :value="rows"
      :loading="computing"
      dataKey="teamId"
      stripedRows
      responsiveLayout="scroll"
      :rowClass="rowClass"
      sortField="draftSlot"
      :sortOrder="1"
    >
      <Column field="draftSlot" header="Pick" sortable style="width: 6rem">
        <template #body="{ data }">
          <span class="font-bold">#{{ (data as DraftOrderEntryDto).draftSlot }}</span>
        </template>
      </Column>
      <Column field="team.name" header="Team" sortable>
        <template #body="{ data }">
          <div class="flex align-items-center gap-2">
            <span class="font-semibold">{{ (data as DraftOrderEntryDto).team.name }}</span>
            <span class="text-color-secondary">{{ (data as DraftOrderEntryDto).team.abbreviation }}</span>
          </div>
        </template>
      </Column>
      <Column header="Record" sortable sortField="winPct" style="width: 8rem">
        <template #body="{ data }">{{ record(data as DraftOrderEntryDto) }}</template>
      </Column>
      <Column field="winPct" header="Win %" sortable style="width: 8rem">
        <template #body="{ data }">{{ formatPercentage((data as DraftOrderEntryDto).winPct) }}</template>
      </Column>
      <Column field="sos" header="SOS" sortable style="width: 8rem">
        <template #body="{ data }">{{ formatPercentage((data as DraftOrderEntryDto).sos) }}</template>
      </Column>
      <Column field="pointsFor" header="PF" sortable style="width: 6rem" />
      <Column field="pointsAgainst" header="PA" sortable style="width: 6rem" />
      <Column header="Ranking Basis" style="min-width: 14rem">
        <template #body="{ data }">{{ tiebreakSummary(data as DraftOrderEntryDto) }}</template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped>
:deep(.selected-team-row) {
  font-weight: 700;
  outline: 2px solid var(--primary-color);
  outline-offset: -2px;
}

.draft-order-controls {
  display: flex;
  flex-wrap: nowrap;
  align-items: flex-end;
  justify-content: flex-start;
  gap: 0.7em;
}
</style>
