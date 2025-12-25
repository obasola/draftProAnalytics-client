<template>
  <Dialog 
    v-model:visible="isVisible"
    header="Propose Trade"
    :style="{ width: '700px' }"
    :modal="true"
    :dismissable-mask="true"
  >
    <div class="trade-dialog-content">
      <!-- Team Selection -->
      <div class="team-selection">
        <div class="selection-section">
          <label>Your Team</label>
          <Dropdown 
            v-model="fromTeam"
            :options="selectedTeams"
            placeholder="Select your team"
            :disabled="selectedTeams.length === 1"
          />
        </div>

        <div class="trade-arrow">
          <i class="pi pi-arrow-right-arrow-left" />
        </div>

        <div class="selection-section">
          <label>Trade With</label>
          <Dropdown 
            v-model="toTeam"
            :options="availableTeams"
            placeholder="Select team to trade with"
          />
        </div>
      </div>

      <Divider />

      <!-- Trade Details -->
      <div class="trade-details" v-if="fromTeam && toTeam">
        <div class="trade-column">
          <h4 class="column-title">
            <i class="pi pi-send" />
            You Give
          </h4>
          <div class="picks-container">
            <div class="picks-list">
              <div 
                v-for="pick in offeredPicks" 
                :key="`offer-${pick.round}-${pick.pick}`"
                class="pick-item"
              >
                <div class="pick-info">
                  <Tag :value="`Round ${pick.round}`" severity="danger" />
                  <span>Pick {{ pick.pick }}</span>
                </div>
                <Button 
                  icon="pi pi-times"
                  class="p-button-text p-button-sm"
                  @click="removeOfferedPick(pick)"
                />
              </div>
              <div v-if="offeredPicks.length === 0" class="empty-state">
                No picks selected
              </div>
            </div>
            <Button 
              label="Add Pick"
              icon="pi pi-plus"
              @click="showPickSelector('offer')"
              outlined
              size="small"
            />
          </div>
        </div>

        <div class="trade-separator">
          <i class="pi pi-arrows-h" />
        </div>

        <div class="trade-column">
          <h4 class="column-title">
            <i class="pi pi-inbox" />
            You Receive
          </h4>
          <div class="picks-container">
            <div class="picks-list">
              <div 
                v-for="pick in requestedPicks" 
                :key="`request-${pick.round}-${pick.pick}`"
                class="pick-item"
              >
                <div class="pick-info">
                  <Tag :value="`Round ${pick.round}`" severity="success" />
                  <span>Pick {{ pick.pick }}</span>
                </div>
                <Button 
                  icon="pi pi-times"
                  class="p-button-text p-button-sm"
                  @click="removeRequestedPick(pick)"
                />
              </div>
              <div v-if="requestedPicks.length === 0" class="empty-state">
                No picks selected
              </div>
            </div>
            <Button 
              label="Add Pick"
              icon="pi pi-plus"
              @click="showPickSelector('request')"
              outlined
              size="small"
            />
          </div>
        </div>
      </div>

      <!-- Trade Value Assessment -->
      <div v-if="offeredPicks.length > 0 || requestedPicks.length > 0" class="trade-value">
        <Divider />
        <div class="value-comparison">
          <div class="value-item">
            <span class="value-label">Your Offer Value</span>
            <span class="value-amount">{{ calculateValue(offeredPicks) }}</span>
          </div>
          <div class="value-indicator">
            <i 
              :class="['pi', tradeBalanceIcon]"
              :style="{ color: tradeBalanceColor }"
            />
          </div>
          <div class="value-item">
            <span class="value-label">Their Offer Value</span>
            <span class="value-amount">{{ calculateValue(requestedPicks) }}</span>
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
          label="Propose Trade" 
          icon="pi pi-check"
          @click="handlePropose"
          :disabled="!canProposeTrade"
          severity="success"
        />
      </div>
    </template>

    <!-- Pick Selector Dialog -->
    <Dialog 
      v-model:visible="pickSelectorVisible"
      header="Select Pick"
      :style="{ width: '400px' }"
      :modal="true"
    >
      <div class="pick-selector">
        <div class="selector-field">
          <label>Round</label>
          <Dropdown 
            v-model="selectedRound"
            :options="[1, 2, 3, 4, 5, 6, 7]"
            placeholder="Select round"
          />
        </div>
        <div class="selector-field">
          <label>Pick</label>
          <Dropdown 
            v-model="selectedPickNumber"
            :options="pickNumbers"
            placeholder="Select pick"
          />
        </div>
      </div>
      <template #footer>
        <Button 
          label="Add" 
          icon="pi pi-check"
          @click="addSelectedPick"
          :disabled="!selectedRound || !selectedPickNumber"
        />
      </template>
    </Dialog>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import Tag from 'primevue/tag';
import Divider from 'primevue/divider';
import type { DraftPick, Team } from '@/types/draft.types';

// Props
interface Props {
  visible: boolean;
  teams: Team[];
  selectedTeams: string[];
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean];
  'propose-trade': [trade: any];
}>();

// State
const isVisible = ref(props.visible);
const fromTeam = ref<string>('');
const toTeam = ref<string>('');
const offeredPicks = ref<DraftPick[]>([]);
const requestedPicks = ref<DraftPick[]>([]);
const pickSelectorVisible = ref(false);
const selectedRound = ref<number | null>(null);
const selectedPickNumber = ref<number | null>(null);
const currentPickType = ref<'offer' | 'request'>('offer');

// Computed
const availableTeams = computed(() => {
  return props.teams
    .filter(team => !props.selectedTeams.includes(team.id))
    .map(team => team.id);
});

const pickNumbers = computed(() => {
  return Array.from({ length: 32 }, (_, i) => i + 1);
});

const canProposeTrade = computed(() => {
  return fromTeam.value && 
         toTeam.value && 
         (offeredPicks.value.length > 0 || requestedPicks.value.length > 0);
});

const tradeBalanceIcon = computed(() => {
  const offerValue = calculateValue(offeredPicks.value);
  const requestValue = calculateValue(requestedPicks.value);
  const diff = Math.abs(offerValue - requestValue);
  
  if (diff < 100) return 'pi-check-circle';
  if (offerValue > requestValue) return 'pi-arrow-up';
  return 'pi-arrow-down';
});

const tradeBalanceColor = computed(() => {
  const offerValue = calculateValue(offeredPicks.value);
  const requestValue = calculateValue(requestedPicks.value);
  const diff = Math.abs(offerValue - requestValue);
  
  if (diff < 100) return '#22c55e';
  return '#f59e0b';
});

// Watch
watch(() => props.visible, (newVal) => {
  isVisible.value = newVal;
});

watch(isVisible, (newVal) => {
  emit('update:visible', newVal);
  if (!newVal) {
    resetTrade();
  }
});

// Auto-select team if only one selected
watch(() => props.selectedTeams, (teams) => {
  if (teams.length === 1) {
    fromTeam.value = teams[0];
  }
}, { immediate: true });

// Methods
const calculateValue = (picks: DraftPick[]): number => {
  // Simple draft pick value calculation (can be made more sophisticated)
  return picks.reduce((total, pick) => {
    const roundValue = 1000 / pick.round;
    const pickValue = (33 - pick.pick) * 10;
    return total + roundValue + pickValue;
  }, 0);
};

const showPickSelector = (type: 'offer' | 'request'): void => {
  currentPickType.value = type;
  pickSelectorVisible.value = true;
};

const addSelectedPick = (): void => {
  if (!selectedRound.value || !selectedPickNumber.value) return;

  const newPick: DraftPick = {
    round: selectedRound.value,
    pick: selectedPickNumber.value,
    overallPick: (selectedRound.value - 1) * 32 + selectedPickNumber.value,
    teamId: currentPickType.value === 'offer' ? fromTeam.value : toTeam.value
  };

  if (currentPickType.value === 'offer') {
    offeredPicks.value.push(newPick);
  } else {
    requestedPicks.value.push(newPick);
  }

  pickSelectorVisible.value = false;
  selectedRound.value = null;
  selectedPickNumber.value = null;
};

const removeOfferedPick = (pick: DraftPick): void => {
  const index = offeredPicks.value.findIndex(
    p => p.round === pick.round && p.pick === pick.pick
  );
  if (index !== -1) {
    offeredPicks.value.splice(index, 1);
  }
};

const removeRequestedPick = (pick: DraftPick): void => {
  const index = requestedPicks.value.findIndex(
    p => p.round === pick.round && p.pick === pick.pick
  );
  if (index !== -1) {
    requestedPicks.value.splice(index, 1);
  }
};

const handlePropose = (): void => {
  emit('propose-trade', {
    fromTeamId: fromTeam.value,
    toTeamId: toTeam.value,
    offeredPicks: offeredPicks.value,
    requestedPicks: requestedPicks.value
  });
  isVisible.value = false;
};

const handleCancel = (): void => {
  isVisible.value = false;
};

const resetTrade = (): void => {
  toTeam.value = '';
  offeredPicks.value = [];
  requestedPicks.value = [];
};
</script>

<style scoped lang="scss">
.trade-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.team-selection {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1rem;
  align-items: end;
}

.selection-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-weight: 600;
    font-size: 0.875rem;
    color: #374151;
  }
}

.trade-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.trade-details {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1.5rem;
}

.trade-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.column-title {
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

.picks-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.picks-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: 100px;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 6px;
  border: 2px dashed #e5e7eb;
}

.pick-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.pick-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
  font-style: italic;
  font-size: 0.875rem;
}

.trade-separator {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #d1d5db;
}

.trade-value {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 8px;
}

.value-comparison {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1rem;
  align-items: center;
}

.value-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.value-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.value-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.value-indicator {
  font-size: 2rem;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.pick-selector {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.5rem 0;
}

.selector-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-weight: 600;
    font-size: 0.875rem;
  }
}
</style>
