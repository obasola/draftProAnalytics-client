// ============================================
// File: src/modules/mocks/components/SettingsDialog.vue
// ============================================

<template>
  <Dialog 
    v-model:visible="isVisible"
    header="Draft Settings"
    :style="{ width: '500px' }"
    :modal="true"
    :dismissable-mask="true"
  >
    <div class="settings-dialog-content">
      <!-- General Settings Section -->
      <div class="settings-section">
        <h4 class="section-title">
          <i class="pi pi-cog" />
          General Settings
        </h4>
        
        <div class="settings-grid">
          <!-- Number of Rounds -->
          <div class="setting-item">
            <label for="dialog-rounds">Number of Rounds</label>
            <InputNumber 
              id="dialog-rounds"
              v-model="localSettings.rounds"
              :min="1"
              :max="7"
              show-buttons
            />
          </div>

          <!-- Draft Speed -->
          <div class="setting-item">
            <label for="dialog-speed">Draft Speed</label>
            <Dropdown 
              id="dialog-speed"
              v-model="localSettings.draftSpeed"
              :options="speedOptions"
              option-label="label"
              option-value="value"
            />
          </div>

          <!-- Players List -->
          <div class="setting-item">
            <label for="dialog-list">Players List Source</label>
            <Dropdown 
              id="dialog-list"
              v-model="localSettings.playersList"
              :options="playersListOptions"
            />
          </div>
        </div>
      </div>

      <!-- Features Section -->
      <Divider />
      
      <div class="settings-section">
        <h4 class="section-title">
          <i class="pi pi-sliders-h" />
          Features
        </h4>
        
        <div class="features-list">
          <div class="feature-item">
            <div class="feature-info">
              <div class="feature-name">Auto-Pick</div>
              <div class="feature-description">
                Automatically select best available player when your pick arrives
              </div>
            </div>
            <InputSwitch v-model="localSettings.autoPickEnabled" />
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <Button 
          label="Cancel" 
          icon="pi pi-times"
          @click="handleCancel"
          text
        />
        <Button 
          label="Save Settings" 
          icon="pi pi-check"
          @click="handleSave"
          severity="success"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import InputSwitch from 'primevue/inputswitch';
import Divider from 'primevue/divider';
import { DraftSettings } from '../draftTypes';

// Props
interface Props {
  visible: boolean;
  settings: DraftSettings;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean];
  'update:settings': [value: DraftSettings];
}>();

// State
const isVisible = ref(props.visible);
const localSettings = ref<DraftSettings>({ ...props.settings });

// Options
const speedOptions = [
  { label: 'Slow (90s)', value: 'slow' },
  { label: 'Normal (60s)', value: 'normal' },
  { label: 'Fast (30s)', value: 'fast' }
];

const playersListOptions = [
  'PFSN',
  'Consensus',
  'ESPN',
  'PFF',
  'The Athletic'
];

// Watch for prop changes
watch(() => props.visible, (newVal) => {
  isVisible.value = newVal;
});

watch(isVisible, (newVal) => {
  emit('update:visible', newVal);
});

watch(() => props.settings, (newSettings) => {
  localSettings.value = { ...newSettings };
}, { deep: true });

// Methods
const handleSave = (): void => {
  emit('update:settings', localSettings.value);
  isVisible.value = false;
};

const handleCancel = (): void => {
  localSettings.value = { ...props.settings };
  isVisible.value = false;
};
</script>

<style scoped lang="scss">
.settings-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 0.5rem 0;
}

.settings-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;

  i {
    color: #667eea;
  }
}

.settings-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-weight: 500;
    font-size: 0.875rem;
    color: #374151;
  }
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.feature-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  gap: 1rem;
}

.feature-info {
  flex: 1;
}

.feature-name {
  font-weight: 600;
  font-size: 0.9375rem;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.feature-description {
  font-size: 0.8125rem;
  color: #6b7280;
  line-height: 1.4;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
</style>