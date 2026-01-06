<script setup lang="ts">
import Dropdown from "primevue/dropdown"
import type { TimezoneMode } from "@/modules/draftOrder/domain/types"

export interface TimezoneOption {
  label: string
  value: TimezoneMode
}

const props = defineProps<{
  modelValue: TimezoneMode
}>()

const emit = defineEmits<{
  (e: "update:modelValue", v: TimezoneMode): void
}>()

const options: TimezoneOption[] = [
  { label: "Local", value: "local" },
  { label: "UTC", value: "UTC" },
  { label: "Chicago", value: "America/Chicago" },
]
</script>

<template>
  <div class="flex align-items-center gap-2">
    <span class="font-semibold">Timezone</span>
    <Dropdown
      :modelValue="props.modelValue"
      :options="options"
      optionLabel="label"
      optionValue="value"
      class="w-12rem"
      @update:modelValue="(v) => emit('update:modelValue', v as TimezoneMode)"
    />
  </div>
</template>
