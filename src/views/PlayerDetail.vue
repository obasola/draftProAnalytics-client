<!-- src/views/PlayerDetail.vue -->
<script setup lang="ts">
import { onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/playerStore'
import AppLayout from '@/components/ui/AppLayout.vue'
import PlayerList from '@/components/player/PlayerList.vue'
import PlayerReadOnly from '@/components/player/PlayerReadOnly.vue'
import PlayerCreateForm from '@/components/player/PlayerCreateForm.vue'
import PlayerEditForm from '@/components/player/PlayerEditForm.vue'

const route = useRoute()
const router = useRouter()
const playerStore = usePlayerStore()

const playerId = computed(() => {
  const id = route.params.id
  return id ? parseInt(id as string) : null
})

const mode = computed(() => {
  return (route.query.mode as string) || 'read'
})

onMounted(async () => {
  playerStore.setMode(mode.value as any)
  if (playerId.value) {
    await playerStore.fetchById(playerId.value)
  }
})

watch(
  () => route.query.mode,
  (newMode) => {
    if (newMode) {
      playerStore.setMode(newMode as any)
    }
  }
)

watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      await playerStore.fetchById(parseInt(newId as string))
    } else {
      playerStore.clearCurrent()
    }
  }
)
</script>

<template>
  
    <div class="player-detail-view">
      <!-- Show list when no ID -->
      <PlayerList v-if="!playerId" />

      <!-- Show create form -->
      <PlayerCreateForm v-else-if="mode === 'create'" />

      <!-- Show edit form -->
      <PlayerEditForm v-else-if="mode === 'edit'" />

      <!-- Show read-only view -->
      <PlayerReadOnly v-else />
    </div>
  
</template>

<style scoped>
.player-detail-view {
  width: 100%;
}
</style>