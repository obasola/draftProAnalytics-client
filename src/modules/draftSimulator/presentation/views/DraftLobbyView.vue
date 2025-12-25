<!-- sports_mgmt_app_client/src/modules/draftSimulator/presentation/views/DraftLobbyView.vue -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/services/api'
import { useThemeStore } from '@/stores/theme.store'
import { getTeamLogoInfo, type TeamRef } from '@/util/teamLogo'

import Button from 'primevue/button'
import Card from 'primevue/card'
import Dialog from 'primevue/dialog'
import Divider from 'primevue/divider'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import InputSwitch from 'primevue/inputswitch'
import InputText from 'primevue/inputtext'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Message from 'primevue/message'
import Tag from 'primevue/tag'

type DraftMode = 'solo' | 'multiplayer'
type DraftSpeed = 1 | 2 | 3

interface TeamOption {
  id: number
  name: string
  abbreviation: string | null
  conference: 'AFC' | 'NFC' | null
}

interface CreateSimulationRequest {
  draftYear: number
  rounds: number
  draftSpeed: DraftSpeed
  rankingSource: string
  allowTrades: boolean
  cpuCpuTrades: boolean
  userTeamIds: number[]
}

interface DraftStateDto {
  simulationId: number
  status: string
}

const router = useRouter()
const themeStore = useThemeStore()

const loading = ref(false)
const error = ref<string | null>(null)

const settingsVisible = ref(false)
const draftMode = ref<DraftMode>('solo')

const model = ref<CreateSimulationRequest>({
  draftYear: new Date().getFullYear() + 1,
  rounds: 7,
  draftSpeed: 2,
  rankingSource: 'DEFAULT',
  allowTrades: true,
  cpuCpuTrades: false,
  userTeamIds: [],
})

const speedOptions: Array<{ label: string; value: DraftSpeed }> = [
  { label: 'Slow', value: 1 },
  { label: 'Normal', value: 2 },
  { label: 'Fast', value: 3 },
]

const modeOptions: Array<{ label: string; value: DraftMode }> = [
  { label: 'Solo', value: 'solo' },
  { label: 'Multiplayer (later)', value: 'multiplayer' },
]

const boardOptions: Array<{ label: string; value: string }> = [
  { label: 'Default Board', value: 'DEFAULT' },
]

const teamSearch = ref('')
const activeConfIndex = ref(0) // 0 = AFC, 1 = NFC

const teams = computed<TeamOption[]>(() => {
  const raw = (themeStore.teams ?? []) as unknown[]
  const mapped: TeamOption[] = []

  for (const item of raw) {
    const t = item as Record<string, unknown>
    const idRaw = t.id
    const nameRaw = t.name
    if (typeof nameRaw !== 'string') continue

    const id = typeof idRaw === 'number' ? idRaw : typeof idRaw === 'string' ? Number(idRaw) : NaN
    if (!Number.isFinite(id)) continue

    const abbr = typeof t.abbreviation === 'string' ? t.abbreviation : null
    const confRaw = typeof t.conference === 'string' ? t.conference.toUpperCase() : null
    const conference = confRaw === 'AFC' || confRaw === 'NFC' ? confRaw : null

    mapped.push({ id, name: nameRaw, abbreviation: abbr, conference })
  }

  return mapped
})

const selectedTeamId = computed<number | null>(() => model.value.userTeamIds[0] ?? null)

const selectedTeam = computed<TeamOption | null>(() => {
  const id = selectedTeamId.value
  if (!id) return null
  return teams.value.find(t => t.id === id) ?? null
})

function teamLogoUrl(team: TeamOption | null): string {
  if (!team?.conference) return ''
  const ref: TeamRef = { name: team.name, conference: team.conference }
  return getTeamLogoInfo(ref).logoUrl
}

const filteredTeams = computed(() => {
  const q = teamSearch.value.trim().toLowerCase()
  const conf: 'AFC' | 'NFC' = activeConfIndex.value === 0 ? 'AFC' : 'NFC'
  return teams.value.filter(t => {
    if (t.conference !== conf) return false
    if (!q) return true
    return t.name.toLowerCase().includes(q) || (t.abbreviation ?? '').toLowerCase().includes(q)
  })
})

function selectTeam(teamId: number): void {
  model.value.userTeamIds = [teamId]
  error.value = null
}

async function startDraft(): Promise<void> {
  error.value = null
  if (!selectedTeamId.value) {
    error.value = 'Select a team to control.'
    return
  }

  loading.value = true
  try {
    const created = await api.post<DraftStateDto>('/draft-simulator/simulations', model.value)
    const simId = created.data.simulationId

    await api.post(`/draft-simulator/simulations/${simId}/start`, {})

    await router.push(`/draft-simulator/${simId}`)
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Failed to start draft.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  // if your store exposes a loader, call it; otherwise no-op
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const maybe = themeStore as any
  if (typeof maybe.loadTeams === 'function') await maybe.loadTeams()
})
</script>

<template>
  <div class="mock-draft-container">
    <!-- Header (matches your MockDraftSimulator.vue structure) -->
    <header class="draft-header">
      <div class="header-content">
        <div class="header-left">
          <div class="title-row">
            <h1 class="title">NFL Mock Draft Simulator</h1>
            <Tag value="Lobby" class="ml-2" />
          </div>
          <div class="subtitle">Choose your team, tune your settings, and start drafting.</div>
        </div>

        <div class="header-actions">
          <Dropdown
            v-model="draftMode"
            :options="modeOptions"
            optionLabel="label"
            optionValue="value"
            class="mode-dd"
          />
          <Button icon="pi pi-cog" class="p-button-text" @click="settingsVisible = true" />
          <Button
            label="Start Draft"
            icon="pi pi-play"
            class="p-button-raised"
            :loading="loading"
            @click="startDraft"
          />
        </div>
      </div>
    </header>

    <Message v-if="error" severity="error" class="mx-3 mt-3">{{ error }}</Message>

    <div class="draft-body">
      <!-- Sidebar -->
      <aside class="draft-sidebar">
        <Card class="sidebar-card">
          <template #title>Team Selection</template>
          <template #content>
            <InputText v-model="teamSearch" placeholder="Search team…" class="w-full mb-2" />

            <TabView v-model:activeIndex="activeConfIndex">
              <TabPanel header="AFC">
                <div class="team-grid">
                  <button
                    v-for="t in filteredTeams"
                    :key="t.id"
                    type="button"
                    class="team-tile"
                    :class="{ active: t.id === selectedTeamId }"
                    @click="selectTeam(t.id)"
                  >
                    <img v-if="teamLogoUrl(t)" class="team-logo" :src="teamLogoUrl(t)" :alt="t.name" />
                    <div class="team-text">
                      <div class="team-abbr">{{ t.abbreviation ?? '—' }}</div>
                      <div class="team-name">{{ t.name }}</div>
                    </div>
                  </button>
                </div>
              </TabPanel>

              <TabPanel header="NFC">
                <div class="team-grid">
                  <button
                    v-for="t in filteredTeams"
                    :key="t.id"
                    type="button"
                    class="team-tile"
                    :class="{ active: t.id === selectedTeamId }"
                    @click="selectTeam(t.id)"
                  >
                    <img v-if="teamLogoUrl(t)" class="team-logo" :src="teamLogoUrl(t)" :alt="t.name" />
                    <div class="team-text">
                      <div class="team-abbr">{{ t.abbreviation ?? '—' }}</div>
                      <div class="team-name">{{ t.name }}</div>
                    </div>
                  </button>
                </div>
              </TabPanel>
            </TabView>
          </template>
        </Card>

        <Card class="sidebar-card mt-3">
          <template #title>Draft Settings</template>
          <template #content>
            <div class="settings-grid">
              <div class="field">
                <label>Draft Year</label>
                <InputNumber v-model="model.draftYear" :min="2020" :max="2100" class="w-full" />
              </div>
              <div class="field">
                <label>Rounds</label>
                <InputNumber v-model="model.rounds" :min="1" :max="7" class="w-full" />
              </div>

              <div class="field">
                <label>Speed</label>
                <Dropdown v-model="model.draftSpeed" :options="speedOptions" optionLabel="label" optionValue="value" class="w-full" />
              </div>
              <div class="field">
                <label>Board</label>
                <Dropdown v-model="model.rankingSource" :options="boardOptions" optionLabel="label" optionValue="value" class="w-full" />
              </div>
            </div>

            <Divider />

            <div class="toggle-row">
              <div>
                <div class="toggle-title">Allow Trades</div>
                <div class="toggle-sub">Enable trading during the sim.</div>
              </div>
              <InputSwitch v-model="model.allowTrades" />
            </div>

            <div class="toggle-row" :class="{ disabled: !model.allowTrades }">
              <div>
                <div class="toggle-title">CPU–CPU Trades</div>
                <div class="toggle-sub">Let teams trade with each other.</div>
              </div>
              <InputSwitch v-model="model.cpuCpuTrades" :disabled="!model.allowTrades" />
            </div>

            <Divider />

            <Button
              label="Start Draft"
              icon="pi pi-play"
              class="w-full p-button-lg"
              :loading="loading"
              @click="startDraft"
            />
          </template>
        </Card>
      </aside>

      <!-- Main -->
      <main class="draft-main">
        <Card>
          <template #title>Ready Room</template>
          <template #content>
            <div class="ready">
              <div class="selected">
                <div class="label">Selected team</div>

                <div v-if="selectedTeam" class="team-pill">
                  <img v-if="teamLogoUrl(selectedTeam)" class="pill-logo" :src="teamLogoUrl(selectedTeam)" :alt="selectedTeam.name" />
                  <div>
                    <div class="pill-name">{{ selectedTeam.name }}</div>
                    <div class="pill-sub">
                      {{ selectedTeam.abbreviation ?? '' }} • {{ selectedTeam.conference ?? '' }}
                    </div>
                  </div>
                </div>

                <div v-else class="muted">Pick a team on the left.</div>
              </div>

              <Divider />

              <div class="hint-grid">
                <div class="hint">
                  <div class="hint-title">Needs Remaining</div>
                  <div class="hint-sub">Draft room will adjust needs as you pick positions.</div>
                </div>
                <div class="hint">
                  <div class="hint-title">Run Warnings</div>
                  <div class="hint-sub">Position runs (CB/OT/etc) will surface in the team console.</div>
                </div>
                <div class="hint">
                  <div class="hint-title">Logos</div>
                  <div class="hint-sub">
                    Served from <code>/public/logos/afc</code> and <code>/public/logos/nfc</code>.
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </main>
    </div>

    <!-- Settings dialog (like your MockDraftSimulator.vue) -->
    <Dialog v-model:visible="settingsVisible" modal header="Settings" :style="{ width: '560px' }">
      <div class="dialog-body">
        <div class="field">
          <label>Draft Year</label>
          <InputNumber v-model="model.draftYear" :min="2020" :max="2100" class="w-full" />
        </div>
        <div class="field mt-2">
          <label>Rounds</label>
          <InputNumber v-model="model.rounds" :min="1" :max="7" class="w-full" />
        </div>
        <div class="field mt-2">
          <label>Speed</label>
          <Dropdown v-model="model.draftSpeed" :options="speedOptions" optionLabel="label" optionValue="value" class="w-full" />
        </div>

        <Divider />

        <div class="toggle-row">
          <div>
            <div class="toggle-title">Allow Trades</div>
            <div class="toggle-sub">Enable trading during the sim.</div>
          </div>
          <InputSwitch v-model="model.allowTrades" />
        </div>
        <div class="toggle-row" :class="{ disabled: !model.allowTrades }">
          <div>
            <div class="toggle-title">CPU–CPU Trades</div>
            <div class="toggle-sub">Let teams trade with each other.</div>
          </div>
          <InputSwitch v-model="model.cpuCpuTrades" :disabled="!model.allowTrades" />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
/* Mirrors the structure of your uploaded MockDraftSimulator.vue (translated to plain CSS) */
.mock-draft-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.draft-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.25rem;
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.12);
}

.header-content {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}

.title-row { display: flex; align-items: center; gap: 0.5rem; }
.title { margin: 0; font-size: 1.6rem; font-weight: 800; line-height: 1.1; }
.subtitle { opacity: 0.9; margin-top: 0.35rem; }

.header-actions { display: flex; align-items: center; gap: 0.5rem; }
.mode-dd { width: 220px; }

.draft-body {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 1rem;
  align-items: start;
}

.draft-sidebar {
  position: sticky;
  top: 1rem;
  align-self: start;
}

.sidebar-card { border-radius: 14px; }

.team-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
  max-height: 440px;
  overflow: auto;
  padding-right: 4px;
}

.team-tile {
  display: flex;
  gap: 0.6rem;
  align-items: center;
  width: 100%;
  text-align: left;
  border-radius: 12px;
  padding: 0.6rem;
  border: 1px solid rgba(0,0,0,0.08);
  background: rgba(255,255,255,0.75);
  cursor: pointer;
}
.team-tile:hover { background: rgba(255,255,255,0.95); }
.team-tile.active { outline: 2px solid rgba(102,126,234,0.45); }

.team-logo {
  width: 34px;
  height: 34px;
  object-fit: contain;
  border-radius: 10px;
  background: rgba(0,0,0,0.04);
  padding: 5px;
}

.team-text { display: flex; flex-direction: column; line-height: 1.1; }
.team-abbr { font-weight: 800; }
.team-name { font-size: 0.85rem; opacity: 0.8; }

.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.65rem;
}
.field label { font-size: 0.85rem; opacity: 0.8; }

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 0.6rem;
}
.toggle-title { font-weight: 800; }
.toggle-sub { font-size: 0.85rem; opacity: 0.75; }
.disabled { opacity: 0.6; }

.draft-main { min-width: 0; }
.ready { display: flex; flex-direction: column; gap: 0.75rem; }

.label { font-size: 0.85rem; opacity: 0.8; }
.team-pill { display: flex; align-items: center; gap: 0.75rem; }
.pill-logo {
  width: 44px;
  height: 44px;
  object-fit: contain;
  border-radius: 12px;
  background: rgba(0,0,0,0.04);
  padding: 6px;
}
.pill-name { font-weight: 900; font-size: 1.05rem; }
.pill-sub { font-size: 0.85rem; opacity: 0.75; }

.hint-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0,1fr));
  gap: 0.75rem;
}
.hint { border: 1px solid rgba(0,0,0,0.07); border-radius: 12px; padding: 0.75rem; background: rgba(255,255,255,0.7); }
.hint-title { font-weight: 900; }
.hint-sub { margin-top: 0.25rem; font-size: 0.9rem; opacity: 0.8; }

.muted { opacity: 0.7; }

@media (max-width: 1100px) {
  .draft-body { grid-template-columns: 1fr; }
  .draft-sidebar { position: static; }
  .settings-grid { grid-template-columns: 1fr; }
  .hint-grid { grid-template-columns: 1fr; }
}
</style>
