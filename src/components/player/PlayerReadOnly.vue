<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { usePlayerStore } from '@/stores/playerStore'
import { playerAwardService } from '@/services/playerAwardService'
import { playerTeamService } from '@/services/playerTeamService'
import type { PlayerAward, PlayerTeam } from '@/types'
import Card from 'primevue/card'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import { resolveTeamLogo } from '@/util/resolveTeamLogo'

const playerStore = usePlayerStore()
const player = computed(() => playerStore.currentPlayer)
const awards = ref<PlayerAward[]>([])
const teams = ref<PlayerTeam[]>([])
const loadingRelationships = ref(false)
const awardDialogVisible = ref(false)
const editingAwardId = ref<number | null>(null)
const currentYear = new Date().getFullYear()
const awardYears = Array.from({ length: currentYear - 2012 + 1 }, (_, index) => currentYear - index)
const awardForm = reactive({ awardName: '', yearAwarded: currentYear })

const loadRelationships = async (): Promise<void> => {
  if (!player.value?.id) return
  loadingRelationships.value = true
  try {
    const [playerAwards, playerTeams] = await Promise.all([
      playerAwardService.getByPlayerId(player.value.id),
      playerTeamService.getPlayerHistory(player.value.id),
    ])
    awards.value = playerAwards
    teams.value = playerTeams
  } finally {
    loadingRelationships.value = false
  }
}

const openCreateAward = (): void => {
  editingAwardId.value = null
  awardForm.awardName = ''
  awardForm.yearAwarded = currentYear
  awardDialogVisible.value = true
}

const openEditAward = (award: PlayerAward): void => {
  editingAwardId.value = award.id ?? null
  awardForm.awardName = award.awardName ?? ''
  awardForm.yearAwarded = award.yearAwarded ?? currentYear
  awardDialogVisible.value = true
}

const saveAward = async (): Promise<void> => {
  if (!player.value?.id || !awardForm.awardName.trim()) return
  const payload = {
    playerId: player.value.id,
    awardName: awardForm.awardName.trim(),
    yearAwarded: awardForm.yearAwarded,
  }
  if (editingAwardId.value) {
    await playerAwardService.update(editingAwardId.value, payload)
  } else {
    await playerAwardService.create(payload)
  }
  awardDialogVisible.value = false
  await loadRelationships()
}

const removeAward = async (award: PlayerAward): Promise<void> => {
  if (!award.id || !confirm(`Remove ${award.awardName ?? 'this award'}?`)) return
  await playerAwardService.delete(award.id)
  await loadRelationships()
}

const teamDisplayName = (playerTeam: PlayerTeam): string => {
  const team = playerTeam.team
  if (!team) return `Team ${playerTeam.teamId}`

  const name = team.name.trim()
  const city = team.city.trim()
  if (!city || name.toLowerCase().startsWith(`${city.toLowerCase()} `)) return name

  return `${city} ${name}`
}

const teamLogo = (playerTeam: PlayerTeam): string =>
  resolveTeamLogo(
    playerTeam.team?.fullName,
    playerTeam.team?.name,
    playerTeam.team?.abbreviation,
    teamDisplayName(playerTeam),
  )

const yearRange = (team: PlayerTeam): string => {
  const start = team.startYear ?? 'Unknown'
  const end = team.currentTeam ? 'Present' : (team.endYear ?? 'Unknown')
  return `${start} - ${end}`
}

onMounted(loadRelationships)
watch(() => player.value?.id, loadRelationships)
</script>

<template>
  <Card v-if="player" class="player-details">
    <template #title>{{ player.firstName }} {{ player.lastName }}</template>
    <template #content>
      <div class="player-info-grid">
        <section class="info-section">
          <h3>Basic Information</h3>
          <div class="info-row"><span class="label">Position:</span><span>{{ player.position }}</span></div>
          <div class="info-row"><span class="label">Age:</span><span>{{ player.age }}</span></div>
          <div class="info-row"><span class="label">Height:</span><span>{{ player.height }}&quot;</span></div>
          <div class="info-row"><span class="label">Weight:</span><span>{{ player.weight }} lbs</span></div>
        </section>
        <section class="info-section">
          <h3>Background</h3>
          <div class="info-row"><span class="label">University:</span><span>{{ player.university }}</span></div>
          <div class="info-row"><span class="label">Hometown:</span><span>{{ player.homeCity }}, {{ player.homeState }}</span></div>
          <div class="info-row"><span class="label">Year Entered League:</span><span>{{ player.yearEnteredLeague }}</span></div>
        </section>
      </div>

      <Accordion class="relationships-accordion">
        <AccordionTab header="Teams">
          <DataTable :value="teams" :loading="loadingRelationships" emptyMessage="No NFL team history found">
            <Column header="Team" sortable>
              <template #body="{ data }">
                <div class="team-cell">
                  <img
                    class="team-logo"
                    :src="teamLogo(data)"
                    :alt="`${teamDisplayName(data)} logo`"
                  />
                  <span>{{ teamDisplayName(data) }}</span>
                </div>
              </template>
            </Column>
            <Column field="jerseyNumber" header="Jersey" sortable />
            <Column header="Years" sortable><template #body="{ data }">{{ yearRange(data) }}</template></Column>
            <Column field="currentTeam" header="Current" sortable>
              <template #body="{ data }">{{ data.currentTeam ? 'Yes' : 'No' }}</template>
            </Column>
          </DataTable>
        </AccordionTab>

        <AccordionTab header="Player Awards">
          <div class="tab-toolbar">
            <Button label="Add Award" icon="pi pi-plus" @click="openCreateAward" />
          </div>
          <DataTable :value="awards" :loading="loadingRelationships" emptyMessage="No awards recorded">
            <Column field="awardName" header="Award" sortable />
            <Column field="yearAwarded" header="Year" sortable />
            <Column header="Actions">
              <template #body="{ data }">
                <div class="action-buttons">
                  <Button icon="pi pi-pencil" severity="warning" text rounded @click="openEditAward(data)" />
                  <Button icon="pi pi-trash" severity="danger" text rounded @click="removeAward(data)" />
                </div>
              </template>
            </Column>
          </DataTable>
        </AccordionTab>
      </Accordion>
    </template>
  </Card>

  <Dialog v-model:visible="awardDialogVisible" modal :header="editingAwardId ? 'Update Player Award' : 'Add Player Award'" class="award-dialog">
    <div class="award-form">
      <label for="awardName">Award</label>
      <InputText id="awardName" v-model="awardForm.awardName" autofocus />
      <label for="yearAwarded">Year</label>
      <Dropdown
        id="yearAwarded"
        v-model="awardForm.yearAwarded"
        :options="awardYears"
        placeholder="Select award year"
      />
    </div>
    <template #footer>
      <Button label="Cancel" severity="secondary" text @click="awardDialogVisible = false" />
      <Button label="Save" icon="pi pi-check" :disabled="!awardForm.awardName.trim()" @click="saveAward" />
    </template>
  </Dialog>
</template>

<style scoped>
.player-details { max-width: 1000px; margin: 0 auto; }
.player-info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-bottom: 2rem; }
.info-section h3 { margin-bottom: 1rem; border-bottom: 2px solid var(--surface-border); padding-bottom: .5rem; }
.info-row { display: flex; justify-content: space-between; margin-bottom: .5rem; padding: .25rem 0; }
.label { font-weight: 700; }
.relationships-accordion { margin-top: 2rem; }
.tab-toolbar { display: flex; justify-content: flex-end; margin-bottom: 1rem; }
.action-buttons { display: flex; gap: .25rem; }
.team-cell { display: flex; align-items: center; gap: .75rem; }
.team-logo { width: 40px; height: 40px; object-fit: contain; flex: 0 0 40px; }
.award-form { display: grid; gap: .75rem; min-width: 22rem; }
:deep(.award-dialog) { border-radius: 12px; }
</style>
