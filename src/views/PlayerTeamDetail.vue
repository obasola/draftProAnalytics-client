<!-- src/views/PlayerTeamDetail.vue -->
<script setup lang="ts">
import { onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlayerTeamStore } from '@/stores/playerTeamStore'
import AppLayout from '@/components/ui/AppLayout.vue'
import PlayerTeamList from '@/components/playerTeam/PlayerTeamList.vue'
import PlayerTeamReadOnly from '@/components/playerTeam/PlayerTeamReadOnly.vue'
import PlayerTeamCreateForm from '@/components/playerTeam/PlayerTeamCreateForm.vue'
import PlayerTeamEditForm from '@/components/playerTeam/PlayerTeamEditForm.vue'

const route = useRoute()
const router = useRouter()
const playerTeamStore = usePlayerTeamStore()

const playerTeamId = computed(() => {
  const id = route.params.id
  return id ? parseInt(id as string) : null
})

const mode = computed(() => {
  return (route.query.mode as string) || 'read'
})

onMounted(async () => {
  playerTeamStore.setMode(mode.value as any)
  if (playerTeamId.value) {
    try {
      await playerTeamStore.fetchById(playerTeamId.value)
    } catch (error) {
      // Handle error - maybe redirect to list if record not found
      console.error('Failed to load player team:', error)
      router.push('/player-teams')
    }
  }
})

watch(
  () => route.query.mode,
  (newMode) => {
    if (newMode) {
      playerTeamStore.setMode(newMode as any)
    }
  }
)

watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      try {
        await playerTeamStore.fetchById(parseInt(newId as string))
      } catch (error) {
        console.error('Failed to load player team:', error)
        router.push('/player-teams')
      }
    } else {
      playerTeamStore.clearCurrent()
    }
  }
)
</script>

<template>
  
    <div class="playerteam-detail-view">
      <!-- Show list when no ID -->
      <PlayerTeamList v-if="!playerTeamId" />

      <!-- Show create form -->
      <PlayerTeamCreateForm v-else-if="mode === 'create'" />

      <!-- Show edit form -->
      <PlayerTeamEditForm v-else-if="mode === 'edit'" />

      <!-- Show read-only view -->
      <PlayerTeamReadOnly v-else />
    </div>
  
</template>

<style scoped>
.playerteam-detail-view {
  width: 100%;
}
</style>