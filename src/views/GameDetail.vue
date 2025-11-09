<!-- src/views/GameDetail.vue -->
<script setup lang="ts">
import { onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore'
import AppLayout from '@/components/ui/AppLayout.vue'
import GameList from '@/components/game/GameList.vue'
import GameReadOnly from '@/components/game/GameReadOnly.vue'
import GameCreateForm from '@/components/game/GameCreateForm.vue'
import GameEditForm from '@/components/game/GameEditForm.vue'

const route = useRoute()
const router = useRouter()
const gameStore = useGameStore()

const gameId = computed(() => {
  const id = route.params.id
  return id ? parseInt(id as string) : null
})

const mode = computed(() => {
  return (route.query.mode as string) || 'read'
})

onMounted(async () => {
  gameStore.setMode(mode.value as any)
  if (gameId.value) {
    await gameStore.fetchById(gameId.value)
  }
})

watch(
  () => route.query.mode,
  (newMode) => {
    if (newMode) {
      gameStore.setMode(newMode as any)
    }
  }
)

watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      await gameStore.fetchById(parseInt(newId as string))
    } else {
      gameStore.clearCurrent()
    }
  }
)
</script>

<template>

    <div class="game-detail-view">
      <!-- Show list when no ID -->
      <GameList v-if="!gameId" />

      <!-- Show create form -->
      <GameCreateForm v-else-if="mode === 'create'" />

      <!-- Show edit form -->
      <GameEditForm v-else-if="mode === 'edit'" />

      <!-- Show read-only view -->
      <GameReadOnly v-else />
    </div>
  
</template>

<style scoped>
.schedule-view {
  min-height: 100vh;
  background: #f8f9fa;
}

.view-header {
  background: white;
  border-bottom: 1px solid #dee2e6;
  padding: 1.5rem 2rem;
  margin-bottom: 0;
}

.view-header h1 {
  margin: 0 0 0.5rem 0;
  color: #212529;
  font-size: 2rem;
  font-weight: 600;
}

.breadcrumb {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #6c757d;
}

.breadcrumb-link {
  color: #007bff;
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-link:hover {
  color: #0056b3;
  text-decoration: underline;
}

.breadcrumb-separator {
  margin: 0 0.5rem;
  color: #6c757d;
}

.breadcrumb-current {
  color: #495057;
  font-weight: 500;
}

.view-content {
  padding: 0;
  max-width: 100%;
}

/* Responsive design */
@media (max-width: 768px) {
  .view-header {
    padding: 1rem;
  }
  
  .view-header h1 {
    font-size: 1.5rem;
  }
  
  .view-content {
    padding: 0;
  }
}
</style>