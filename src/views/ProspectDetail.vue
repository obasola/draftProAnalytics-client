<!-- src/views/ProspectDetail.vue -->
<script setup lang="ts">
import { onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProspectStore } from '@/stores/prospectStore'
import AppLayout from '@/components/ui/AppLayout.vue'
import ProspectList from '@/components/prospect/ProspectList.vue'
import ProspectReadOnly from '@/components/prospect/ProspectReadOnly.vue'
import ProspectCreateForm from '@/components/prospect/ProspectCreateForm.vue'
import ProspectEditForm from '@/components/prospect/ProspectEditForm.vue'

const route = useRoute()
const router = useRouter()
const prospectStore = useProspectStore()

const prospectId = computed(() => {
  const id = route.params.id
  return id ? parseInt(id as string) : null
})

const mode = computed(() => {
  return (route.query.mode as string) || 'read'
})

onMounted(async () => {
  prospectStore.setMode(mode.value as any)
  if (prospectId.value) {
    await prospectStore.fetchById(prospectId.value)
  }
})

watch(
  () => route.query.mode,
  (newMode) => {
    if (newMode) {
      prospectStore.setMode(newMode as any)
    }
  }
)

watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      await prospectStore.fetchById(parseInt(newId as string))
    } else {
      prospectStore.clearCurrent()
    }
  }
)
</script>

<template>
  
    <div class="prospect-detail-view">
      <!-- Show list when no ID -->
      <ProspectList v-if="!prospectId" />

      <!-- Show create form -->
      <ProspectCreateForm v-else-if="mode === 'create'" />

      <!-- Show edit form -->
      <ProspectEditForm v-else-if="mode === 'edit'" />

      <!-- Show read-only view -->
      <ProspectReadOnly v-else />
    </div>
  
</template>

<style scoped>
.prospect-detail-view {
  width: 100%;
}
</style>