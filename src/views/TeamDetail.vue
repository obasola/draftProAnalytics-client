<!-- sports_mgmt_app_client/src/views/TeamDetail.vue -->
<script setup lang="ts">
import { onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTeamStore } from '@/stores/teamStore'

// PrimeVue (add these)
import Button from 'primevue/button'

import TeamList from '@/components/team/TeamList.vue'
import TeamReadOnly from '@/components/team/TeamReadOnly.vue'
import TeamCreateForm from '@/components/team/TeamCreateForm.vue'
import TeamEditForm from '@/components/team/TeamEditForm.vue'

const route = useRoute()
const router = useRouter()
const teamStore = useTeamStore()

const teamId = computed<number | null>(() => {
  const id = route.params.id
  return id ? parseInt(id as string, 10) : null
})

const mode = computed<string>(() => {
  return (route.query.mode as string) || 'read'
})

// ✅ This is where router.push belongs
async function goToTeamNeeds(): Promise<void> {
  if (!teamId.value) return

  await router.push({
    name: 'TeamNeeds',
    // IMPORTANT: param name must match your TeamNeeds route definition
    // If TeamNeeds route is /teams/:teamId/needs → use { teamId: teamId.value }
    params: { teamId: teamId.value },
  })
}

onMounted(async () => {
  teamStore.setMode(mode.value as any)
  if (teamId.value) {
    await teamStore.fetchById(teamId.value)
  }
})

watch(
  () => route.query.mode,
  (newMode) => {
    if (newMode) {
      teamStore.setMode(newMode as any)
    }
  }
)

watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      await teamStore.fetchById(parseInt(newId as string, 10))
    } else {
      teamStore.clearCurrent()
    }
  }
)
</script>

<template>
  <div class="team-detail-view-expanded">
    <!-- ✅ Add a small action bar when a team is selected -->
    <div v-if="teamId" class="team-actions">
      <Button
        label="Team Needs"
        icon="pi pi-list-check"
        size="small"
        @click="goToTeamNeeds"
      />
    </div>

    <!-- Show list when no ID -->
    <TeamList v-if="!teamId" />

    <!-- Show create form -->
    <TeamCreateForm v-else-if="mode === 'create'" />

    <!-- Show edit form -->
    <TeamEditForm v-else-if="mode === 'edit'" />

    <!-- Show read-only view -->
    <TeamReadOnly v-else />
  </div>
</template>

<style scoped>
.team-detail-view-expanded {
  width: 98%;
  margin: 0 auto;
  max-width: none;
  padding: 0.5rem;
  box-sizing: border-box;
}

.team-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.5rem;
}

/* Ensure child components also expand */
.team-detail-view-expanded :deep(.team-details),
.team-detail-view-expanded :deep(.team-list),
.team-detail-view-expanded :deep(.team-form) {
  max-width: none !important;
  width: 100% !important;
  margin: 0 !important;
}

/* Adjust card padding for better spacing */
.team-detail-view-expanded :deep(.p-card) {
  width: 100%;
  box-sizing: border-box;
}

/* Ensure grids expand properly */
.team-detail-view-expanded :deep(.team-info-grid) {
  width: 100%;
  box-sizing: border-box;
}

/* Keep data tables responsive and full width */
.team-detail-view-expanded :deep(.p-datatable) {
  width: 100%;
  box-sizing: border-box;
}

/* Ensure accordions expand */
.team-detail-view-expanded :deep(.relationships-accordion) {
  width: 100%;
}

/* Ensure sections use full available width */
.team-detail-view-expanded :deep(.players-section),
.team-detail-view-expanded :deep(.info-section) {
  width: 100%;
  box-sizing: border-box;
}
</style>
