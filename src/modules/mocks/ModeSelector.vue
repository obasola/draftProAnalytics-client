<template>
  <div class="mode-selector">
    <SelectButton 
      v-model="selectedMode"
      :options="modeOptions"
      option-label="label"
      option-value="value"
      @update:model-value="handleModeChange"
    >
      <template #option="{ option }">
        <i :class="option.icon" />
        <span class="ml-2">{{ option.label }}</span>
      </template>
    </SelectButton>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import SelectButton from 'primevue/selectbutton';
import type { DraftMode } from '@/types/draft.types';

// Props
interface Props {
  mode: DraftMode;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  'update:mode': [value: DraftMode];
  'mode-change': [value: DraftMode];
}>();

// State
const selectedMode = ref<DraftMode>(props.mode);

// Mode options
const modeOptions = [
  { 
    label: 'Solo', 
    value: 'solo' as DraftMode,
    icon: 'pi pi-user'
  },
  { 
    label: 'Multiplayer', 
    value: 'multiplayer' as DraftMode,
    icon: 'pi pi-users'
  }
];

// Watch for prop changes
watch(() => props.mode, (newMode) => {
  selectedMode.value = newMode;
});

// Methods
const handleModeChange = (newMode: DraftMode): void => {
  emit('update:mode', newMode);
  emit('mode-change', newMode);
};
</script>

<style scoped lang="scss">
.mode-selector {
  :deep(.p-selectbutton) {
    .p-button {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.3);
      color: white;
      
      &:hover {
        background: rgba(255, 255, 255, 0.3);
      }
      
      &.p-highlight {
        background: white;
        color: #667eea;
        border-color: white;
      }
    }
  }
}
</style>
