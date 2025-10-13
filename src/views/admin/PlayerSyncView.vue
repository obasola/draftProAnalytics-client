<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">Player Sync Admin</h2>
    <div class="flex items-center gap-3 mb-3">
      <Button
        label="Sync All Players"
        icon="pi pi-refresh"
        :loading="store.syncing"
        @click="store.syncAll"
      />
      <InputNumber v-model="teamEspnId" placeholder="Team ESPN ID" />
      <Button
        label="Sync Team Players"
        icon="pi pi-users"
        :loading="store.syncing"
        @click="() => store.syncTeam(teamEspnId)"
      />
    </div>

    <Card v-if="store.summary" class="mb-4">
      <template #title>Summary</template>
      <template #content>
        <div v-if="store.summary.teams">
          <p>Teams processed: {{ store.summary.teams }}</p>
          <p>Players synced: {{ store.summary.players }}</p>
        </div>
        <div v-else>
          <p>Players synced: {{ store.summary.players }}</p>
        </div>
      </template>
    </Card>

    <Card>
      <template #title>Logs</template>
      <template #content>
        <pre class="text-sm whitespace-pre-wrap">
{{ store.logs.join('\n') }}
        </pre>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePlayerSyncStore } from '@/stores/playerSyncStore'

const store = usePlayerSyncStore()
const teamEspnId = ref<number | null>(null)
</script>
