<!-- sports_mgmt_app_client/src/modules/draftSimulator/presentation/views/DraftLobbyView.vue -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/services/api'
import { useThemeStore } from '@/stores/theme.store'
import { getTeamLogoInfo, type TeamRef } from '@/util/teamLogo'

import Card from 'primevue/card'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import InputSwitch from 'primevue/inputswitch'
import Divider from 'primevue/divider'
import Message from 'primevue/message'

type DraftSpeed = 1 | 2 | 3

interface TeamOption {
  id: number
  name: string
  abbreviation: string | null
  conference: string | null
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
  draftYear: number
  rounds: number
  draftSpeed: number
  rankingSource: string
  allowTrades: boolean
  cpuCpuTrades: boolean
  status: string
  currentOverallPick: number
  userTeamIds: number[]
}

const router = useRouter()
const themeStore = useThemeStore()

const loading = ref(false)
const error = ref<string | null>(null)

const model = ref<CreateSimulationRequest>({
  draftYear: new Date().getFullYear() + 1, // default "next draft year"
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

const rankingOptions: Array<{ label: string; value: string }> = [
  { label: 'Default Board', value: 'DEFAULT' },
]

const teams = computed<TeamOption[]>(() => {
  // themeStore.teams shape varies; normalize hard to keep types strict
  return (themeStore.teams ?? []).map((t: any) => ({
    id: Number(t.id),
    name: String(t.name ?? ''),
    abbreviation: (t.abbreviation ?? null) as string | null,
    conference: (t.conference ?? null) as string | null,
  }))
})

const selectedTeamId = computed<number | null>(() => (model.value.userTeamIds[0] ?? null))

const selectedTeam = computed<TeamOption | null>(() => {
  const id = selectedTeamId.value
  if (!id) return null
  return teams.value.find(t => t.id === id) ?? null
})

function teamLogoUrl(team: TeamOption | null): string {
  if (!team?.name || !team.conference) return ''
  const ref: TeamRef = { name: team.name, conference: team.conference }
  const info = getTeamLogoInfo(ref)
  return info.logoUrl
}

const selectedTeamLogo = computed(() => teamLogoUrl(selectedTeam.value))
const selectedTeamLabel = computed(() => {
  const t = selectedTeam.value
  if (!t) return 'Select a team'
  return t.abbreviation ? `${t.name} (${t.abbreviation})` : t.name
})

function setUserTeam(teamId: number | null): void {
  model.value.userTeamIds = teamId ? [teamId] : []
}

async function startMock(): Promise<void> {
  error.value = null

  if (!selectedTeamId.value) {
    error.value = 'Pick a team first.'
    return
  }

  loading.value = true
  try {
    // 1) create
    const createRes = await api.post<DraftStateDto>('/draft-simulator/simulations', model.value)
    const simId = createRes.data.simulationId

    // 2) start
    await api.post(`/draft-simulator/simulations/${simId}/start`, {})

    // 3) enter room
    await router.push(`/draft-simulator/${simId}`)
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Failed to start mock draft.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  // If your theme store has a loader, call it here; otherwise it’s safe to no-op.
  // Example if you have it:
  // if (typeof themeStore.loadTeams === 'function') await themeStore.loadTeams()
})
</script>

<template>
  <div class="draft-lobby">
    <!-- Hero -->
    <Card class="hero">
      <template #content>
        <div class="hero-row">
          <div class="hero-left">
            <div class="hero-kicker">Mock Draft Simulator</div>
            <div class="hero-title">Run the room. Build your board. Beat the run.</div>
            <div class="hero-sub">
              PFN-style flow with your data + TeamNeeds intelligence. Start a new simulation in seconds.
            </div>

            <div class="hero-cta">
              <Button
                label="Start Mock Draft"
                icon="pi pi-play"
                :loading="loading"
                class="p-button-lg"
                @click="startMock"
              />
              <div class="hero-note">
                You’ll enter the draft room immediately after setup.
              </div>
            </div>
          </div>

          <div class="hero-right">
            <div class="team-chip">
              <img v-if="selectedTeamLogo" :src="selectedTeamLogo" class="team-logo" alt="Team logo" />
              <div v-else class="team-logo team-logo--empty">🏈</div>
              <div class="team-chip-text">
                <div class="team-chip-label">Your Team</div>
                <div class="team-chip-value">{{ selectedTeamLabel }}</div>
              </div>
            </div>

            <Divider />

            <div class="quick-summary">
              <div class="qs-row">
                <span class="qs-k">Year</span>
                <span class="qs-v">{{ model.draftYear }}</span>
              </div>
              <div class="qs-row">
                <span class="qs-k">Rounds</span>
                <span class="qs-v">{{ model.rounds }}</span>
              </div>
              <div class="qs-row">
                <span class="qs-k">Speed</span>
                <span class="qs-v">
                  {{ speedOptions.find(s => s.value === model.draftSpeed)?.label ?? model.draftSpeed }}
                </span>
              </div>
              <div class="qs-row">
                <span class="qs-k">Trades</span>
                <span class="qs-v">{{ model.allowTrades ? 'On' : 'Off' }}</span>
              </div>
            </div>
          </div>
        </div>

        <Message v-if="error" severity="error" class="mt-3">{{ error }}</Message>
      </template>
    </Card>

    <!-- Main grid -->
    <div class="grid">
      <!-- Left: Setup -->
      <Card class="panel">
        <template #title>Set Up Your Draft</template>
        <template #content>
          <div class="form">
            <div class="field">
              <label class="lbl">Team</label>
              <Dropdown
                :modelValue="selectedTeamId"
                :options="teams"
                optionLabel="name"
                optionValue="id"
                placeholder="Select a team…"
                class="w-full"
                @update:modelValue="setUserTeam"
              >
                <!-- selected value -->
                <template #value="slotProps">
                  <div v-if="slotProps.value" class="team-opt">
                    <img
                      :src="teamLogoUrl(teams.find(t => t.id === slotProps.value) ?? null)"
                      class="team-opt-logo"
                      alt="logo"
                    />
                    <span class="team-opt-text">
                      {{ (teams.find(t => t.id === slotProps.value)?.abbreviation ?? teams.find(t => t.id === slotProps.value)?.name) }}
                    </span>
                  </div>
                  <span v-else class="opacity-70">Select a team…</span>
                </template>

                <!-- dropdown rows -->
                <template #option="slotProps">
                  <div class="team-opt">
                    <img :src="teamLogoUrl(slotProps.option)" class="team-opt-logo" alt="logo" />
                    <div class="team-opt-text">
                      <div class="team-opt-name">{{ slotProps.option.name }}</div>
                      <div class="team-opt-sub">
                        {{ slotProps.option.abbreviation ?? '—' }} • {{ slotProps.option.conference ?? '—' }}
                      </div>
                    </div>
                  </div>
                </template>
              </Dropdown>
            </div>

            <div class="row2">
              <div class="field">
                <label class="lbl">Draft Year</label>
                <InputNumber v-model="model.draftYear" :min="2020" :max="2100" class="w-full" />
              </div>

              <div class="field">
                <label class="lbl">Rounds</label>
                <InputNumber v-model="model.rounds" :min="1" :max="7" class="w-full" />
              </div>
            </div>

            <div class="row2">
              <div class="field">
                <label class="lbl">Speed</label>
                <Dropdown v-model="model.draftSpeed" :options="speedOptions" optionLabel="label" optionValue="value" class="w-full" />
              </div>

              <div class="field">
                <label class="lbl">Board</label>
                <Dropdown v-model="model.rankingSource" :options="rankingOptions" optionLabel="label" optionValue="value" class="w-full" />
              </div>
            </div>

            <Divider />

            <div class="toggles">
              <div class="toggle-row">
                <div class="toggle-text">
                  <div class="toggle-title">Allow Trades</div>
                  <div class="toggle-sub">Enable pick trading during the simulation.</div>
                </div>
                <InputSwitch v-model="model.allowTrades" />
              </div>

              <div class="toggle-row" :class="{ 'is-disabled': !model.allowTrades }">
                <div class="toggle-text">
                  <div class="toggle-title">CPU–CPU Trades</div>
                  <div class="toggle-sub">Let teams trade with each other (more chaotic).</div>
                </div>
                <InputSwitch v-model="model.cpuCpuTrades" :disabled="!model.allowTrades" />
              </div>
            </div>

            <Divider />

            <Button
              label="Start Mock Draft"
              icon="pi pi-play"
              :loading="loading"
              class="w-full p-button-lg"
              @click="startMock"
            />
          </div>
        </template>
      </Card>

      <!-- Right: Info / PFN-ish explainer -->
      <Card class="panel">
        <template #title>How It Works</template>
        <template #content>
          <div class="how">
            <div class="how-item">
              <div class="how-badge">1</div>
              <div class="how-body">
                <div class="how-title">You’re on the clock</div>
                <div class="how-sub">When your team picks, “Draft” buttons activate automatically.</div>
              </div>
            </div>

            <div class="how-item">
              <div class="how-badge">2</div>
              <div class="how-body">
                <div class="how-title">Needs-aware suggestions</div>
                <div class="how-sub">Your Team Needs panel adjusts as you draft positions.</div>
              </div>
            </div>

            <div class="how-item">
              <div class="how-badge">3</div>
              <div class="how-body">
                <div class="how-title">Runs and scarcity</div>
                <div class="how-sub">Next phase: warnings when positions start flying off the board.</div>
              </div>
            </div>

            <Divider />

            <div class="fineprint">
              Logos load from <code>/public/logos/afc</code> and <code>/public/logos/nfc</code>.
              If a logo doesn’t appear, verify the filename matches the team short name used by your helper.
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.draft-lobby {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* PFN-ish hero */
.hero {
  border-radius: 16px;
  overflow: hidden;
}
.hero :deep(.p-card-body) {
  padding: 1.25rem;
}
.hero-row {
  display: grid;
  grid-template-columns: 1.4fr 0.9fr;
  gap: 1.25rem;
}
.hero-kicker {
  font-size: 0.85rem;
  opacity: 0.8;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.hero-title {
  font-size: 1.6rem;
  font-weight: 800;
  margin-top: 0.25rem;
  line-height: 1.15;
}
.hero-sub {
  margin-top: 0.5rem;
  opacity: 0.85;
  max-width: 52ch;
}
.hero-cta {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.hero-note {
  font-size: 0.85rem;
  opacity: 0.75;
}

.team-chip {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}
.team-logo {
  width: 44px;
  height: 44px;
  object-fit: contain;
  border-radius: 10px;
  background: rgba(255,255,255,0.08);
  padding: 6px;
}
.team-logo--empty {
  display: grid;
  place-items: center;
}
.team-chip-label {
  font-size: 0.85rem;
  opacity: 0.75;
}
.team-chip-value {
  font-weight: 700;
}

.quick-summary {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.qs-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
}
.qs-k { opacity: 0.75; }
.qs-v { font-weight: 700; }

/* panels grid */
.grid {
  display: grid;
  grid-template-columns: 1.2fr 0.9fr;
  gap: 1rem;
}
.panel {
  border-radius: 16px;
}

/* form */
.form {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.lbl {
  font-size: 0.85rem;
  opacity: 0.8;
}
.row2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.team-opt {
  display: flex;
  gap: 0.6rem;
  align-items: center;
}
.team-opt-logo {
  width: 28px;
  height: 28px;
  object-fit: contain;
  border-radius: 8px;
  background: rgba(255,255,255,0.08);
  padding: 4px;
}
.team-opt-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}
.team-opt-name {
  font-weight: 700;
}
.team-opt-sub {
  font-size: 0.8rem;
  opacity: 0.75;
}

/* toggles */
.toggles {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.toggle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}
.toggle-text {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.toggle-title { font-weight: 700; }
.toggle-sub { font-size: 0.85rem; opacity: 0.75; }
.is-disabled { opacity: 0.6; }

/* info */
.how {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}
.how-item {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}
.how-badge {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-weight: 800;
  background: rgba(255,255,255,0.12);
}
.how-title { font-weight: 800; }
.how-sub { font-size: 0.9rem; opacity: 0.8; }
.fineprint { font-size: 0.85rem; opacity: 0.75; }

@media (max-width: 1100px) {
  .hero-row, .grid { grid-template-columns: 1fr; }
  .hero-cta { flex-direction: column; align-items: flex-start; }
}
</style>
