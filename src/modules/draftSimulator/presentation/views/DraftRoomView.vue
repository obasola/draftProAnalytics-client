<!-- sports_mgmt_app_client/src/modules/draftSimulator/presentation/views/DraftRoomView.vue -->
<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDraftSimulatorStore } from '../../stores/draftSimulatorStore'

import Button from 'primevue/button'
import Card from 'primevue/card'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import AppLayout from '@/components/ui/AppLayout.vue'

const route = useRoute()
const router = useRouter()
const store = useDraftSimulatorStore()

const simId = computed(() => Number(route.params.id))

type SideOption = { label: string; value: 'all' | 'offense' | 'defense' | 'st' }

const sideOptions: SideOption[] = [
  { label: 'All', value: 'all' },
  { label: 'Offense', value: 'offense' },
  { label: 'Defense', value: 'defense' },
  { label: 'S/T', value: 'st' }
]

const positionOptions = ['', 'QB', 'RB', 'WR', 'TE', 'OT', 'OG', 'C', 'DT', 'EDGE', 'LB', 'CB', 'S', 'K', 'P']

const onClockPick = computed(() => {
  const d = store.draft
  if (!d) return null
  return d.picks.find(p => p.overallPick === d.currentOverallPick) ?? null
})

const isUserOnClock = computed(() => {
  const p = onClockPick.value
  const d = store.draft
  if (!p || !d) return false
  return d.userTeamIds.includes(p.currentTeamId)
})

const onClockAbbr = computed(() => store.teamConsole?.onClock?.teamAbbr ?? store.teamConsole?.onClock?.teamId ?? null)

// ✅ Smart needs (supports new server shape OR old topNeeds shape)
type SmartNeed = {
  position: string
  priority: number
  adjustedWeight?: number
  draftedCount?: number
}

const needsForUi = computed<SmartNeed[]>(() => {
  const tc: any = store.teamConsole
  if (!tc) return []
  if (Array.isArray(tc.needsRemaining)) return tc.needsRemaining as SmartNeed[]
  if (Array.isArray(tc.topNeeds)) return tc.topNeeds as SmartNeed[]
  return []
})

onMounted(async () => {
  await store.loadDraft(simId.value)
  if (store.draft?.status === 'setup') await store.start(simId.value)
  await store.refreshProspects()
  if (!store.teamConsole) await store.refreshTeamConsole?.()
})

watch(
  () => ({ ...store.filters }),
  async () => { await store.refreshProspects() },
  { deep: true }
)

function leave(): void {
  router.push('/draft-simulator')
}
</script>

<template>

    <div class="p-4 flex flex-col gap-3">
      <div class="flex items-center justify-between gap-3">
        <div class="flex flex-col">
          <div class="text-xl font-semibold">Draft Central</div>
          <div class="text-sm opacity-80" v-if="store.draft">
            {{ store.draft.draftYear }} • Rounds {{ store.draft.rounds }} • On pick {{ store.draft.currentOverallPick }}
            <Tag v-if="isUserOnClock" value="You're on the clock" class="ml-2" />
          </div>
        </div>

        <div class="flex gap-2">
          <Button label="Sim Next" icon="pi pi-forward" :loading="store.loading" @click="store.simNext()" />
          <Button label="Leave" icon="pi pi-sign-out" severity="secondary" @click="leave" />
        </div>
      </div>

      <div class="grid gap-3" style="grid-template-columns: 1.2fr 2fr 1.2fr;">
        <!-- Left: Draft Results -->
        <Card>
          <template #title>Draft Results</template>
          <template #content>
            <DataTable :value="store.draft?.picks ?? []" size="small" scrollable scrollHeight="560px">
              <Column field="overallPick" header="#" style="width:60px" />
              <Column header="Team" style="width:90px">
                <template #body="slotProps">
                  {{ slotProps.data.currentTeamAbbr ?? slotProps.data.currentTeamId }}
                </template>
              </Column>
              <Column header="Pick">
                <template #body="slotProps">
                  <span v-if="slotProps.data.draftedProspect">
                    {{ slotProps.data.draftedProspect.fullName }} ({{ slotProps.data.draftedProspect.position }})
                  </span>
                  <span v-else class="opacity-60">—</span>
                </template>
              </Column>
            </DataTable>
          </template>
        </Card>

        <!-- Center: Player Pool + My Picks -->
        <Card>
          <template #title>Player Pool</template>
          <template #content>
            <div class="flex gap-2 mb-3 items-center">
              <InputText v-model="store.filters.q" placeholder="Search name / school..." class="w-full" />
              <Dropdown v-model="store.filters.side" :options="sideOptions" optionLabel="label" optionValue="value" />
              <Dropdown v-model="store.filters.position" :options="positionOptions" />
            </div>

            <TabView>
              <TabPanel header="Player Pool">
                <DataTable :value="store.prospects" size="small" scrollable scrollHeight="500px">
                  <Column field="overallRank" header="Rank" style="width:80px" />
                  <Column field="fullName" header="Player" />
                  <Column field="position" header="Pos" style="width:80px" />
                  <Column field="college" header="School" />
                  <Column header="Actions" style="width:140px">
                    <template #body="slotProps">
                      <Button
                        label="Draft"
                        size="small"
                        :disabled="!isUserOnClock"
                        @click="store.draftProspect(slotProps.data.id)"
                      />
                    </template>
                  </Column>
                </DataTable>
              </TabPanel>

              <TabPanel header="My Picks">
                <div class="text-sm opacity-80 mb-2">
                  Picks made by your selected team(s).
                </div>
                <DataTable
                  :value="(store.draft?.picks ?? []).filter(p => store.draft?.userTeamIds.includes(p.currentTeamId) && p.draftedProspect)"
                  size="small"
                  scrollable
                  scrollHeight="500px"
                >
                  <Column field="overallPick" header="#" style="width:60px" />
                  <Column header="Team" style="width:90px">
                    <template #body="slotProps">
                      {{ slotProps.data.currentTeamAbbr ?? slotProps.data.currentTeamId }}
                    </template>
                  </Column>
                  <Column header="Prospect">
                    <template #body="slotProps">
                      {{ slotProps.data.draftedProspect.fullName }} ({{ slotProps.data.draftedProspect.position }})
                    </template>
                  </Column>
                </DataTable>
              </TabPanel>
            </TabView>

          </template>
        </Card>

        <!-- Right: Team Console -->
        <Card>
          <template #title>Team Console</template>
          <template #content>
            <div v-if="store.teamConsole?.onClock" class="flex flex-col gap-2">
              <div class="text-sm opacity-80">On the clock</div>
              <div class="text-lg font-semibold">
                {{ onClockAbbr }}
                <span class="opacity-60 text-sm ml-2">#{{ store.teamConsole.onClock.overallPick }}</span>
              </div>

              <!-- ✅ Needs Remaining (smart) -->
              <div class="text-sm opacity-80 mt-3">Needs Remaining</div>
              <div v-if="needsForUi.length === 0" class="text-sm opacity-60">
                No TeamNeed rows found for this team/year.
              </div>
              <div v-else class="text-sm">
                <div
                  v-for="n in needsForUi"
                  :key="n.position"
                  class="flex justify-between"
                >
                  <span>{{ n.position }}</span>
                  <span class="opacity-80">
                    <span v-if="typeof n.adjustedWeight === 'number'">W{{ n.adjustedWeight }}</span>
                    <span v-else>P{{ n.priority }}</span>
                    <span v-if="n.draftedCount" class="opacity-60 ml-2">(-{{ n.draftedCount }})</span>
                  </span>
                </div>
              </div>

              <div class="text-sm opacity-80 mt-3">Next Picks</div>
              <div class="text-sm">
                <div
                  v-for="p in store.teamConsole.nextPicks"
                  :key="p.overallPick"
                  class="flex justify-between"
                >
                  <span>#{{ p.overallPick }}</span>
                  <span class="opacity-80">{{ p.teamAbbr ?? p.teamId }}</span>
                </div>
              </div>

              <div class="text-sm opacity-80 mt-3">Trades</div>
              <div class="text-sm opacity-60">
                Phase 2: Propose/Accept/Counter (UI placeholder).
              </div>
            </div>

            <div v-else class="text-sm opacity-60">Loading team console…</div>
          </template>
        </Card>
      </div>

      <div v-if="store.error" class="text-sm text-red-500">{{ store.error }}</div>
    </div>

</template>
