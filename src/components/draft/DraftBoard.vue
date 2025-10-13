### src/components/draft/DraftBoard.vue
```vue
<template>
  <div class="draft-board">
    <!-- Draft Header -->
    <div class="draft-header">
      <Card>
        <template #title>
          {{ draftState.draftYear }} NFL Draft Simulator
        </template>
        <template #content>
          <div class="flex justify-content-between align-items-center">
            <div>
              <span class="text-lg font-semibold">Round {{ draftState.currentRound }}</span>
              <span class="ml-2">Pick {{ draftState.currentPick }}</span>
            </div>
            <div v-if="currentPickInfo">
              <span class="text-sm">{{ currentPickInfo.team?.name }} on the clock</span>
              <Chip v-if="isUsersTurn" label="Your Pick!" class="ml-2" />
            </div>
            <div>
              <Button 
                @click="toggleAutoPick"
                :label="draftState.autoPickEnabled ? 'Disable Auto' : 'Enable Auto'"
                size="small"
              />
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Main Draft Interface -->
    <div class="grid">
      <!-- Prospect Board -->
      <div class="col-8">
        <Card>
          <template #title>
            Available Prospects
          </template>
          <template #content>
            <DataTable 
              :value="filteredProspects" 
              :paginator="true" 
              :rows="20"
              selectionMode="single"
              @row-select="onProspectSelect"
              :loading="loading"
            >
              <Column field="firstName" header="First Name" />
              <Column field="lastName" header="Last Name" />
              <Column field="position" header="Pos" />
              <Column field="college" header="College" />
              <Column field="height" header="Height">
                <template #body="{ data }">
                  {{ formatHeight(data.height) }}
                </template>
              </Column>
              <Column field="weight" header="Weight" />
              <Column>
                <template #body="{ data }">
                  <Button 
                    v-if="isUsersTurn"
                    @click="selectProspect(data)"
                    label="Draft"
                    size="small"
                    class="p-button-success"
                  />
                </template>
              </Column>
            </DataTable>
          </template>
        </Card>
      </div>

      <!-- Draft Order & Team Info -->
      <div class="col-4">
        <Card class="mb-3">
          <template #title>
            Current Pick
          </template>
          <template #content>
            <div v-if="currentPickInfo" class="current-pick-info">
              <h4>{{ currentPickInfo.team?.name }}</h4>
              <p>Round {{ draftState.currentRound }}, Pick {{ draftState.currentPick }}</p>
              <div class="team-needs">
                <h5>Team Needs</h5>
                <Chip 
                  v-for="need in teamNeeds" 
                  :key="need"
                  :label="need"
                  class="mr-1 mb-1"
                />
              </div>
            </div>
          </template>
        </Card>

        <Card>
          <template #title>
            Draft History
          </template>
          <template #content>
            <div class="draft-history">
              <div 
                v-for="pick in recentPicks" 
                :key="pick.pickId"
                class="pick-item p-2 border-bottom-1 surface-border"
              >
                <div class="flex justify-content-between">
                  <span class="font-semibold">{{ pick.team?.name }}</span>
                  <span class="text-sm">{{ pick.roundPick }}</span>
                </div>
                <div>{{ pick.prospect?.firstName }} {{ pick.prospect?.lastName }}</div>
                <div class="text-sm text-500">{{ pick.prospect?.position }} - {{ pick.prospect?.college }}</div>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <!-- Trading Interface -->
    <TradeModal 
      v-model:visible="showTradeModal"
      :current-pick="currentPickInfo"
      @trade-proposed="onTradeProposed"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useDraftStore } from '@/stores/draftStore'
import { useTeamStore } from '@/stores/teamStore'
import type { Prospect } from '@/types'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Chip from 'primevue/chip'

const draftStore = useDraftStore()
const teamStore = useTeamStore()

const showTradeModal = ref(false)
const selectedProspect = ref<Prospect | null>(null)

// Computed
const { 
  draftState, 
  currentPickInfo, 
  isUsersTurn, 
  availableUndraftedProspects,
  completedPicks,
  loading 
} = draftStore

const filteredProspects = computed(() => {
  return availableUndraftedProspects.sort((a, b) => {
    // Simple ranking by position needs and combine metrics
    return (b.fortyTime || 999) - (a.fortyTime || 999)
  })
})

const teamNeeds = computed(() => {
  if (!currentPickInfo) return []
  return teamStore.getTeamNeeds(currentPickInfo.teamId)
})

const recentPicks = computed(() => {
  return completedPicks.slice(-10).reverse()
})

// Methods
const formatHeight = (height: number) => {
  const feet = Math.floor(height / 12)
  const inches = height % 12
  return `${feet}'${inches}"`
}

const selectProspect = async (prospect: Prospect) => {
  if (!isUsersTurn || !prospect.id) return
  
  try {
    await draftStore.makePick(prospect.id)
  } catch (error) {
    console.error('Failed to make pick:', error)
  }
}

const onProspectSelect = (event: any) => {
  selectedProspect.value = event.data
}

const toggleAutoPick = () => {
  draftState.autoPickEnabled = !draftState.autoPickEnabled
}

const onTradeProposed = () => {
  showTradeModal.value = false
}

// Auto-pick logic
watch(() => currentPickInfo, async (newPick) => {
  if (!newPick || isUsersTurn || !draftState.autoPickEnabled) return
  
  // Simulate AI pick after delay
  setTimeout(async () => {
    try {
      await draftStore.simulateAutoPick()
    } catch (error) {
      console.error('Auto-pick failed:', error)
    }
  }, 2000)
})

onMounted(async () => {
  await draftStore.initializeDraft(2025, [1]) // Initialize with user controlling team 1
})
</script>

<style scoped>
.draft-board {
  padding: 1rem;
}

.draft-header {
  margin-bottom: 1rem;
}

.current-pick-info h4 {
  margin: 0 0 0.5rem 0;
}

.team-needs h5 {
  margin: 1rem 0 0.5rem 0;
}

.draft-history {
  max-height: 400px;
  overflow-y: auto;
}

.pick-item:last-child {
  border-bottom: none;
}
</style>