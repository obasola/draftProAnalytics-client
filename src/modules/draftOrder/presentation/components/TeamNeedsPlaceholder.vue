<script setup lang="ts">
import Card from "primevue/card"
import Button from "primevue/button"
import Message from "primevue/message"
import { useRouter } from "vue-router"

const router = useRouter()

defineProps<{
  teamName?: string | null
}>()

function goTeamNeeds(): void {
  void router.push("/team-needs")
}
</script>

<template>
  <Card>
    <template #title>Team Needs</template>
    <template #content>
      <Message severity="info" :closable="false">
        Placeholder: this panel is intentionally scaffolded so we can swap in the final Team Needs logic later.
      </Message>

      <div class="mt-3 flex align-items-center justify-content-between">
        <div class="opacity-80">
          <span v-if="teamName">Selected team: <b>{{ teamName }}</b></span>
          <span v-else>Select a team row to scope needs.</span>
        </div>
        <Button label="Open Team Needs" icon="pi pi-external-link" outlined @click="goTeamNeeds" />
      </div>
    </template>
  </Card>
</template>
