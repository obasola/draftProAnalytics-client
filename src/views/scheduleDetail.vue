<script setup lang="ts">
import { onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useScheduleStore } from '@/stores/scheduleStore'
import AppLayout from '@/components/ui/AppLayout.vue'
import ScheduleList from '@/components/schedule/ScheduleList.vue'
import ScheduleReadOnly from '@/components/schedule/ScheduleReadOnly.vue'
import ScheduleCreateForm from '@/components/schedule/ScheduleCreateForm.vue'
import ScheduleEditForm from '@/components/schedule/ScheduleEditForm.vue'

const route = useRoute()
const router = useRouter()
const scheduleStore = useScheduleStore()

const scheduleId = computed(() => {
  const id = route.params.id
  return id ? parseInt(id as string) : null
})

const mode = computed(() => {
  return (route.query.mode as string) || 'read'
})

onMounted(async () => {
  scheduleStore.setMode(mode.value as any)
  if (scheduleId.value) {
    await scheduleStore.fetchById(scheduleId.value)
  }
})

watch(
  () => route.query.mode,
  (newMode) => {
    if (newMode) {
      scheduleStore.setMode(newMode as any)
    }
  }
)

watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      await scheduleStore.fetchById(parseInt(newId as string))
    } else {
      scheduleStore.clearCurrent()
    }
  }
)
</script>

<template>
  
    <div class="schedule-detail-view">
      <!-- Show list when no ID -->
      <ScheduleList v-if="!scheduleId" />

      <!-- Show create form -->
      <ScheduleCreateForm v-else-if="mode === 'create'" />

      <!-- Show edit form -->
      <ScheduleEditForm v-else-if="mode === 'edit'" />

      <!-- Show read-only view -->
      <ScheduleReadOnly v-else />
    </div>
  
</template>

<style scoped>
.schedule-detail-view {
  width: 100%;
}
</style>