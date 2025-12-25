// ============================================
// File: src/modules/mocks/components/DraftSettingsPanel.vue
// ============================================

<template>
  <div class="draft-settings-panel">
    <div class="panel-header">
      <h3 class="panel-title">Draft Settings</h3>
    </div>

    <div class="settings-form">
      <!-- Number of Rounds -->
      <div class="form-field">
        <label for="rounds">Number of Rounds</label>
        <div class="number-input-group">
          <Button 
            icon="pi pi-minus" 
            @click="decrementRounds"
            :disabled="localSettings.rounds <= 1"
            size="small"
            outlined
          />
          <InputNumber 
            id="rounds"
            v-model="localSettings.rounds"
            :min="1"
            :max="7"
            show-buttons
            button-layout="horizontal"
          />
          <Button 
            icon="pi pi-plus" 
            @click="incrementRounds"
            :disabled="localSettings.rounds >= 7"
            size="small"
            outlined
          />
        </div>
      </div>

      <!-- Draft Speed -->
      <div class="form-field">
        <label for="speed">Draft Speed</label>
        <Dropdown 
          id="speed"
          v-model="localSettings.draftSpeed"
          :options="speedOptions"
          option-label="label"
          option-value="value"
          placeholder="Select Speed"
        />
      </div>

      <!-- Players List Source -->
      <div class="form-field">
        <label for="playersList">Players List</label>
        <Dropdown 
          id="playersList"
          v-model="localSettings.playersList"
          :options="playersListOptions"
          placeholder="Select Source"
        />
      </div>

      <!-- Auto Pick -->
      <div class="form-field">
        <div class="checkbox-field">
          <Checkbox 
            id="autoPick"
            v-model="localSettings.autoPickEnabled"
            binary
          />
          <label for="autoPick">Enable Auto-Pick</label>
        </div>
      </div>
    </div>

    <!-- Start Button -->
    <Button 
      label="Enter Solo Draft"
      icon="pi pi-play"
      class="start-button"
      @click="handleStartDraft"
      :disabled="!canStartDraft"
      severity="success"
      size="large"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import Button from 'primevue/button';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import Checkbox from 'primevue/checkbox';
import { DraftSettings } from '../draftTypes';

// Props
interface Props {
  settings: DraftSettings;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  'update:settings': [value: DraftSettings];
  'start-draft': [];
}>();

// Local state
const localSettings = ref<DraftSettings>({ ...props.settings });

// Options
const speedOptions = [
  { label: 'Slow', value: 'slow' },
  { label: 'Normal', value: 'normal' },
  { label: 'Fast', value: 'fast' }
];

const playersListOptions = ['PFSN', 'Consensus', 'ESPN', 'PFF', 'The Athletic'];

// Computed
const canStartDraft = computed(() => {
  return localSettings.value.rounds > 0;
});

// Watch for changes and emit
watch(localSettings, (newSettings) => {
  emit('update:settings', newSettings);
}, { deep: true });

// Methods
const incrementRounds = (): void => {
  if (localSettings.value.rounds < 7) {
    localSettings.value.rounds++;
  }
};

const decrementRounds = (): void => {
  if (localSettings.value.rounds > 1) {
    localSettings.value.rounds--;
  }
};

const handleStartDraft = (): void => {
  emit('start-draft');
};
</script>

<style scoped lang="scss">
.draft-settings-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.panel-header {
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e5e7eb;
}

.panel-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-weight: 600;
    font-size: 0.875rem;
    color: #374151;
  }
}

.number-input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  :deep(.p-inputnumber) {
    flex: 1;
  }
}

.checkbox-field {
  display: flex;
  align-items: center;
  gap: 0.75rem;

  label {
    font-weight: 500;
    margin: 0;
  }
}

.start-button {
  width: 100%;
  padding: 0.75rem;
  font-weight: 600;
}
</style>

