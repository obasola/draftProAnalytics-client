<!-- src/views/PlayerAwardDetail.vue -->
<script setup lang="ts">
import { onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlayerAwardStore } from '@/stores/playerAwardStore'
import AppLayout from '@/components/ui/AppLayout.vue'
import PlayerAwardList from '@/components/playerAward/PlayerAwardList.vue'
import PlayerAwardReadOnly from '@/components/playerAward/PlayerAwardReadOnly.vue'
import PlayerAwardCreateForm from '@/components/playerAward/PlayerAwardCreateForm.vue'
import PlayerAwardEditForm from '@/components/playerAward/PlayerAwardEditForm.vue'

const route = useRoute()
const router = useRouter()
const playerAwardStore = usePlayerAwardStore()

const playerAwardId = computed(() => {
  const id = route.params.id
  return id ? parseInt(id as string) : null
})

const mode = computed(() => {
  return (route.query.mode as string) || 'read'
})

onMounted(async () => {
  playerAwardStore.setMode(mode.value as any)
  if (playerAwardId.value) {
    await playerAwardStore.fetchById(playerAwardId.value)
  }
})

watch(
  () => route.query.mode,
  (newMode) => {
    if (newMode) {
      playerAwardStore.setMode(newMode as any)
    }
  }
)

watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      await playerAwardStore.fetchById(parseInt(newId as string))
    } else {
      playerAwardStore.clearCurrent()
    }
  }
)
</script>

<template>

    <div class="player-award-detail-view">
      <!-- Show list when no ID -->
      <PlayerAwardList v-if="!playerAwardId" />

      <!-- Show create form -->
      <PlayerAwardCreateForm v-else-if="mode === 'create'" />

      <!-- Show edit form -->
      <PlayerAwardEditForm v-else-if="mode === 'edit'" />

      <!-- Show read-only view -->
      <PlayerAwardReadOnly v-else />
    </div>
  
</template>

<style scoped>
.player-award-detail-view {
  width: 100%;
}
</style>