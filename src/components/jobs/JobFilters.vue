
// ──────────────────────────────────────────
// src/components/jobs/JobFilters.vue
// ──────────────────────────────────────────
export const __components_jobs_JobFilters_vue = `
<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  statuses: string[];
  types: string[];
  status: string;
  type: string;
}>();
const emit = defineEmits<{ (e: 'update', v: { status?: string; type?: string }): void }>();

const model = computed({
  get: () => ({ status: props.status, type: props.type }),
  set: (v: { status?: string; type?: string }) => emit('update', v),
});
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <Dropdown :options="props.statuses" :modelValue="model.status" placeholder="Status"
              @change="emit('update', { status: $event.value, type: props.type })" />
    <Dropdown :options="props.types" :modelValue="model.type" placeholder="Type"
              @change="emit('update', { status: props.status, type: $event.value })" />
  </div>
</template>
`;

