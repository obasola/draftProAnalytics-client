<!-- src/views/DraftPickDetail.vue -->
<script setup lang="ts">
import { onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDraftPickStore } from '@/stores/draftPickStore'
import AppLayout from '@/components/ui/AppLayout.vue'
import DraftPickList from '@/components/draftPick/DraftPickList.vue'
import DraftPickReadOnly from '@/components/draftPick/DraftPickReadOnly.vue'
import DraftPickCreateForm from '@/components/draftPick/DraftPickCreateForm.vue'
import DraftPickEditForm from '@/components/draftPick/DraftPickEditForm.vue'

const route = useRoute()
const router = useRouter()
const draftPickStore = useDraftPickStore()

const draftPickId = computed(() => {
  const id = route.params.id
  return id ? parseInt(id as string) : null
})

const mode = computed(() => {
  return (route.query.mode as string) || 'read'
})

onMounted(async () => {
  draftPickStore.setMode(mode.value as any)
  if (draftPickId.value) {
    await draftPickStore.fetchById(draftPickId.value)
  }
})

watch(
  () => route.query.mode,
  (newMode) => {
    if (newMode) {
      draftPickStore.setMode(newMode as any)
    }
  }
)

watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      await draftPickStore.fetchById(parseInt(newId as string))
    } else {
      draftPickStore.clearCurrent()
    }
  }
)
</script>

<template>

    <div class="draftpick-detail-view">
      <!-- Show list when no ID -->
      <DraftPickList v-if="!draftPickId" />

      <!-- Show create form -->
      <DraftPickCreateForm v-else-if="mode === 'create'" />

      <!-- Show edit form -->
      <DraftPickEditForm v-else-if="mode === 'edit'" />

      <!-- Show read-only view -->
      <DraftPickReadOnly v-else />
    </div>
 
</template>

<style scoped>
.draftpick-detail-view {
  width: 100%;
}
</style>