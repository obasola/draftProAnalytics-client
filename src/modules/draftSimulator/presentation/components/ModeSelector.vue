<template>
  <div class="mode-selector">
    <SelectButton
      v-model="selectedMode"
      :options="modeOptions"
      optionLabel="label"
      optionValue="value"
      @update:modelValue="handleModeChange"
    >
      <template #option="{ option }">
        <i :class="option.icon" />
        <span class="ml-2">{{ option.label }}</span>
      </template>
    </SelectButton>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import SelectButton from 'primevue/selectbutton'

export type DraftMode = 'solo' | 'multiplayer'

interface Props {
  mode: DraftMode
}
const props = defineProps<Props>()

const emit = defineEmits<{
  'update:mode': [value: DraftMode]
  'mode-change': [value: DraftMode]
}>()

const selectedMode = ref<DraftMode>(props.mode)

const modeOptions: Array<{ label: string; value: DraftMode; icon: string }> = [
  { label: 'Solo', value: 'solo', icon: 'pi pi-user' },
  { label: 'Multiplayer', value: 'multiplayer', icon: 'pi pi-users' },
]

watch(
  () => props.mode,
  (m) => { selectedMode.value = m }
)

function handleModeChange(newMode: DraftMode): void {
  emit('update:mode', newMode)
  emit('mode-change', newMode)
}
</script>

<style scoped>
.mode-selector :deep(.p-selectbutton .p-button) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  color: white;
}
.mode-selector :deep(.p-selectbutton .p-button:hover) {
  background: rgba(255, 255, 255, 0.3);
}
.mode-selector :deep(.p-selectbutton .p-button.p-highlight) {
  background: white;
  color: #667eea;
  border-color: white;
}
</style>
