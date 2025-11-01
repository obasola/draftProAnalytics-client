<template>
  <div class="draft-settings">
    <div class="settings-header">
      <h2>Draft Settings</h2>
    </div>

    <div class="settings-content">
      <!-- Current Round Selection -->
      <div class="setting-group">
        <label class="setting-label">Starting Round</label>
        <select 
          :value="currentRound" 
          @change="updateCurrentRound"
          class="form-select"
        >
          <option v-for="round in 7" :key="round" :value="round">
            Round {{ round }}
          </option>
        </select>
        <small class="setting-help">Choose which round to start tracking from</small>
      </div>

      <!-- Team Selection Summary -->
      <div class="setting-group">
        <label class="setting-label">Selected Teams</label>
        <div class="team-summary">
          <div class="summary-stat">
            <span class="stat-number">{{ selectedTeamsCount }}</span>
            <span class="stat-label">teams selected</span>
          </div>
        </div>
        <small class="setting-help">
          {{ selectedTeamsCount === 0 ? 'Select at least one team to continue' : 'Teams to track during the draft' }}
        </small>
      </div>

      <!-- Draft Mode Selection -->
      <div class="setting-group">
        <label class="setting-label">Draft Mode</label>
        <div class="radio-group">
          <label class="radio-option">
            <input 
              type="radio" 
              value="live" 
              v-model="draftMode"
              class="form-check-input"
            >
            <span>Live Draft</span>
          </label>
          <label class="radio-option">
            <input 
              type="radio" 
              value="simulation" 
              v-model="draftMode"
              class="form-check-input"
            >
            <span>Simulation</span>
          </label>
        </div>
        <small class="setting-help">Choose between live draft tracking or simulation mode</small>
      </div>

      <!-- Quick Actions -->
      <div class="setting-group">
        <label class="setting-label">Quick Actions</label>
        <div class="quick-actions">
          <button 
            @click="selectAllTeams"
            class="btn btn-outline-secondary btn-sm"
            :disabled="selectedTeamsCount === 32"
          >
            Select All
          </button>
          <button 
            @click="selectConference('AFC')"
            class="btn btn-outline-secondary btn-sm"
          >
            AFC Only
          </button>
          <button 
            @click="selectConference('NFC')"
            class="btn btn-outline-secondary btn-sm"
          >
            NFC Only
          </button>
        </div>
      </div>
    </div>

    <!-- Submit Button -->
    <div class="settings-footer">
      <button 
        @click="$emit('submit')"
        class="btn btn-primary btn-lg w-100"
        :disabled="selectedTeamsCount === 0"
      >
        <span v-if="selectedTeamsCount === 0">Select Teams to Continue</span>
        <span v-else>Start Draft Tracker</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  currentRound: number
  selectedTeamsCount: number
}

const props = defineProps<Props>()

const draftMode = ref<'live' | 'simulation'>('live')

const emit = defineEmits<{
  'update:currentRound': [round: number]
  submit: []
  selectAll: []
  selectConference: [conference: 'AFC' | 'NFC']
}>()

const updateCurrentRound = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:currentRound', parseInt(target.value))
}

const selectAllTeams = () => {
  emit('selectAll')
}

const selectConference = (conference: 'AFC' | 'NFC') => {
  emit('selectConference', conference)
}
</script>

<style scoped>
.draft-settings {
  background: #222;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.settings-header {
  background: #2a2a2a;
  padding: 1.5rem;
  border-bottom: 1px solid #333;
}

.settings-header h2 {
  color: #fff;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.settings-content {
  padding: 1.5rem;
}

.setting-group {
  margin-bottom: 2rem;
}

.setting-group:last-child {
  margin-bottom: 0;
}

.setting-label {
  display: block;
  color: #fff;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.form-select {
  width: 100%;
  padding: 0.75rem;
  background: #333;
  border: 1px solid #555;
  border-radius: 6px;
  color: #fff;
  font-size: 0.9rem;
}

.form-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.team-summary {
  background: #333;
  border-radius: 6px;
  padding: 1rem;
  text-align: center;
}

.summary-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #28a745;
}

.stat-label {
  color: #aaa;
  font-size: 0.8rem;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #fff;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.radio-option:hover {
  background: #333;
}

.form-check-input {
  background: #333;
  border: 1px solid #555;
}

.form-check-input:checked {
  background: #007bff;
  border-color: #007bff;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.setting-help {
  color: #aaa;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: block;
}

.settings-footer {
  padding: 1.5rem;
  border-top: 1px solid #333;
  background: #2a2a2a;
}

.btn {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  transition: all 0.2s;
  cursor: pointer;
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-outline-secondary {
  background: transparent;
  color: #aaa;
  border: 1px solid #555;
}

.btn-outline-secondary:hover:not(:disabled) {
  background: #555;
  color: #fff;
}

.btn-sm {
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
}

.btn-lg {
  padding: 1rem 1.5rem;
  font-size: 1rem;
}

.w-100 {
  width: 100%;
}
</style>