<!-- src/views/RosterPlayerDetail.vue -->
<script setup lang="ts">
import { onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import RosterPlayerReadOnly from '../modules/roster/presentation/components/RosterPlayerReadOnly.vue'
import RosterPlayerList from '@/modules/roster/presentation/components/RosterPlayerList.vue'
import RosterPlayerCreateForm from '../modules/roster/presentation/components/RosterPlayerCreateForm.vue'
import RosterPlayerEditForm from '../modules/roster/presentation/components/RosterPlayerEditForm.vue'
import { useRosterPlayerStore } from '../modules/roster/application/stores/rosterPlayerStore'

const route = useRoute()
const router = useRouter()
const rosterPlayerStore = useRosterPlayerStore()

// Note: rosterPlayers uses string UUIDs, not numeric IDs
const rosterPlayerId = computed(() => {
  const id = route.params.id
  return id ? (id as string) : null
})

const mode = computed(() => {
  return (route.query.mode as string) || 'read'
})

onMounted(async () => {
  if (rosterPlayerId.value) {
    try {
      await rosterPlayerStore.fetchById(rosterPlayerId.value)
    } catch (error) {
      // Handle error - maybe redirect to list if record not found
      console.error('Failed to load roster player:', error)
      router.push('/roster-players')
    }
  }
})

watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      try {
        await rosterPlayerStore.fetchById(newId as string)
      } catch (error) {
        console.error('Failed to load roster player:', error)
        router.push('/roster-players')
      }
    } else {
      rosterPlayerStore.clearCurrent()
    }
  }
)
</script>

<template>
  <div class="roster-player-detail-view">
    <!-- Show list when no ID -->
    <RosterPlayerList v-if="!rosterPlayerId" />

    <!-- Show create form -->
    <RosterPlayerCreateForm v-else-if="mode === 'create'" />

    <!-- Show edit form -->
    <RosterPlayerEditForm v-else-if="mode === 'edit'" />

    <!-- Show read-only view -->
    <RosterPlayerReadOnly v-else />
  </div>
</template>

<style scoped>
.roster-player-detail-view {
  width: 100%;
}
</style>