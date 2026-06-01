<script setup lang="ts">
import Card from 'primevue/card'
import Tag from 'primevue/tag'

const props = defineProps<{
  needsAddressed: string[]
  needsUnaddressed: string[]
}>()
</script>

<template>
  <Card>
    <template #title>Needs Check</template>
    <template #content>
      <div class="needs-section">
        <h3>Addressed</h3>
        <div v-if="props.needsAddressed.length > 0" class="need-tags">
          <Tag
            v-for="need in props.needsAddressed"
            :key="need"
            :value="need"
            severity="success"
          />
        </div>
        <p v-else class="empty-copy">No addressed needs have been marked yet.</p>
      </div>

      <div class="needs-section">
        <h3>Still Open</h3>
        <div v-if="props.needsUnaddressed.length > 0" class="need-tags">
          <Tag
            v-for="need in props.needsUnaddressed"
            :key="need"
            :value="need"
            severity="warning"
          />
        </div>
        <p v-else class="empty-copy">No unaddressed needs have been marked yet.</p>
      </div>
    </template>
  </Card>
</template>

<style scoped>
.needs-section + .needs-section {
  margin-top: 1rem;
}

h3 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
}

.need-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.empty-copy {
  margin: 0;
  color: var(--text-color-secondary);
}
</style>
