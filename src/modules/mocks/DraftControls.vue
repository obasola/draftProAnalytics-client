/* ===========================
   DraftControls.vue
   =========================== */

<template>
  <div class="draft-controls">
    <div class="controls-header">
      <h3>Draft Central</h3>
      <Chip :label="isPaused ? 'Paused' : 'Active'" />
    </div>

    <div class="controls-actions">
      <Button 
        :label="isPaused ? 'Resume' : 'Pause'"
        :icon="isPaused ? 'pi pi-play' : 'pi pi-pause'"
        @click="$emit('toggle-pause')"
        severity="info"
      />
      
      <Button 
        label="Trade"
        icon="pi pi-arrow-right-arrow-left"
        @click="$emit('propose-trade')"
        severity="success"
      />
      
      <Button 
        label="Restart"
        icon="pi pi-refresh"
        @click="confirmRestart"
        severity="warning"
      />
      
      <Button 
        label="Leave"
        icon="pi pi-sign-out"
        @click="confirmLeave"
        severity="danger"
      />
    </div>

    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { useConfirm } from 'primevue/useconfirm';
import Button from 'primevue/button';
import Chip from 'primevue/chip';
import ConfirmDialog from 'primevue/confirmdialog';

interface Props {
  isPaused: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  'toggle-pause': [];
  'propose-trade': [];
  'restart': [];
  'leave': [];
}>();

const confirm = useConfirm();

const confirmRestart = () => {
  confirm.require({
    message: 'Are you sure you want to restart the draft?',
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    accept: () => emit('restart')
  });
};

const confirmLeave = () => {
  confirm.require({
    message: 'Are you sure you want to leave the draft?',
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    accept: () => emit('leave')
  });
};
</script>

<style scoped lang="scss">
.draft-controls {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.controls-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  h3 {
    margin: 0;
  }
}

.controls-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
</style>


