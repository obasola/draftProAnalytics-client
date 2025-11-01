<template>
  <div class="draft-selection-form">
    <div class="header">
      <h2>{{ isEditMode ? 'Edit Draft Selection' : 'Record Draft Pick' }}</h2>
    </div>

    <div class="card">
      <form @submit.prevent="saveDraftSelection">
        <div class="p-fluid">
          <div class="p-field">
            <label for="pickNumber">Pick Number*</label>
            <InputNumber
              id="pickNumber"
              v-model="draftSelection.pickNumber"
              :disabled="loading"
              :min="1"
              required
            />
            <small v-if="pickNumberError" class="p-error">{{ pickNumberError }}</small>
          </div>

          <div class="p-field">
            <label for="team">Team*</label>
            <Dropdown
              id="team"
              v-model="draftSelection.teamId"
              :options="teams"
              optionLabel="name"
              optionValue="id"
              placeholder="Select a Team"
              :disabled="loading"
              required
            />
            <small v-if="teamError" class="p-error">{{ teamError }}</small>
          </div>

          <div class="p-field">
            <label for="player">Player*</label>
            <Dropdown
              id="player"
              v-model="draftSelection.playerId"
              :options="players"
              optionLabel="fullName"
              optionValue="id"
              placeholder="Select a Player"
              :disabled="loading"
              @change="handlePlayerChange"
              required
            />
            <small v-if="playerError" class="p-error">{{ playerError }}</small>
          </div>

          <div class="p-field">
            <label for="position">Position*</label>
            <Dropdown
              id="position"
              v-model="draftSelection.position"
              :options="positions"
              placeholder="Select a Position"
              :disabled="loading || positionDisabled"
              required
            />
            <small v-if="positionError" class="p-error">{{ positionError }}</small>
          </div>

          <div class="p-field">
            <label for="college">College</label>
            <InputText
              id="college"
              v-model="draftSelection.college"
              :disabled="true"
              placeholder="Auto-filled from player data"
            />
          </div>

          <div class="form-buttons">
            <Button
              label="Cancel"
              icon="pi pi-times"
              class="p-button-text"
              @click="navigateBack"
              :disabled="loading"
              type="button"
            />
            <Button
              :label="isEditMode ? 'Save' : 'Record Pick'"
              icon="pi pi-check"
              class="p-button-success"
              @click="saveDraftSelection"
              type="submit"
              :loading="loading"
            />
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import { useDraftSelectionStore } from '@/stores/draftSelection';
import type { DraftSelection } from '@/types/DraftSelection';
import { POSITIONS } from '@/enums/Position';
import { Player } from '@/types';

// Store, router, and toast
const draftSelectionStore = useDraftSelectionStore();
const route = useRoute();
const router = useRouter();
const toast = useToast();

// Draft selection data
const draftSelection = reactive<Partial<DraftSelection>>({
  pickNumber: 0,
  teamId: undefined,
  playerId: undefined,
  position: '',
  college: '',
  draftYear: new Date().getFullYear()
});

// Form validation
const pickNumberError = ref('');
const teamError = ref('');
const playerError = ref('');
const positionError = ref('');

// UI state
const positionDisabled = ref(false);
const loading = ref(false);

// Get isEditMode based on route params
const isEditMode = computed(() => {
  return route.params.id !== undefined && route.params.id !== 'create';
});

// Format players for dropdown
const players = computed(() => {
  return draftSelectionStore.players.map((player: Player) => ({
    ...player,
    fullName: `${player.firstName} ${player.lastName}`
  }));
});

// Get teams from store
const teams = computed(() => draftSelectionStore.teams);

// Sort positions alphabetically
const positions = computed(() => [...POSITIONS].sort());

// Load data when component mounts
onMounted(async () => {
  loading.value = true;
  try {
    // Fetch dependencies (players, teams)
    await draftSelectionStore.fetchDependencies();

    // If in edit mode, load the draft selection
    if (isEditMode.value && route.params.id) {
      const id = parseInt(route.params.id as string);
      const selection = await draftSelectionStore.fetchDraftSelectionById(id);

      if (selection) {
        // Populate form with data
        draftSelection.id = selection.id;
        draftSelection.pickNumber = selection.pickNumber;
        draftSelection.teamId = selection.teamId;
        draftSelection.playerId = selection.playerId;
        draftSelection.position = selection.position;
        draftSelection.college = selection.college;
        draftSelection.draftYear = selection.draftYear;

        // Check if position should be disabled
        if (draftSelection.playerId) {
          handlePlayerChange();
        }
      } else {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Draft selection not found',
          life: 3000
        });
        navigateBack();
      }
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load data',
      life: 3000
    });
  } finally {
    loading.value = false;
  }
});

// Handle player selection change
const handlePlayerChange = () => {
  if (draftSelection.playerId) {
    const selectedPlayer = draftSelectionStore.getPlayerById(draftSelection.playerId);

    if (selectedPlayer) {
      // Auto-fill college from player data
      draftSelection.college = selectedPlayer.university || '';

      // If player has a position, use it and disable the dropdown
      if (selectedPlayer.position) {
        draftSelection.position = selectedPlayer.position;
        positionDisabled.value = true;
      } else {
        positionDisabled.value = false;
      }
    }
  } else {
    // Reset fields if no player selected
    draftSelection.college = '';
    positionDisabled.value = false;
  }
};

// Form validation
const validateForm = (): boolean => {
  let isValid = true;

  // Reset errors
  pickNumberError.value = '';
  teamError.value = '';
  playerError.value = '';
  positionError.value = '';

  // Validate pick number
  if (!draftSelection.pickNumber || draftSelection.pickNumber <= 0) {
    pickNumberError.value = 'Pick number is required and must be positive';
    isValid = false;
  }

  // Validate team
  if (!draftSelection.teamId) {
    teamError.value = 'Team is required';
    isValid = false;
  }

  // Validate player
  if (!draftSelection.playerId) {
    playerError.value = 'Player is required';
    isValid = false;
  }

  // Validate position
  if (!draftSelection.position) {
    positionError.value = 'Position is required';
    isValid = false;
  }

  return isValid;
};

// Save draft selection
// The updated save method in DraftSelectionForm.vue
const saveDraftSelection = async () => {
  if (!validateForm()) {
    toast.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Please correct the form errors',
      life: 3000
    });
    return;
  }

  loading.value = true;

  try {
    // Calculate the draft round based on pick number if not provided
    if (!draftSelection.draftRound && draftSelection.pickNumber) {
      draftSelection.draftRound = Math.ceil(draftSelection.pickNumber / 32);
    }

    // Set draft year to current year if not specified
    if (!draftSelection.draftYear) {
      draftSelection.draftYear = new Date().getFullYear();
    }

    // Map our form data to match the expected server-side format
    const draftSelectionData = {
      pickNumber: draftSelection.pickNumber,
      draftRound: draftSelection.draftRound,
      draftYear: draftSelection.draftYear,
      teamId: draftSelection.teamId,
      playerId: draftSelection.playerId,
      position: draftSelection.position,
      college: draftSelection.college
    };

    if (isEditMode.value && draftSelection.id) {
      // Update existing draft selection
      await draftSelectionStore.updateDraftSelection(draftSelection.id, draftSelectionData);

      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: `Draft pick #${draftSelection.pickNumber} updated successfully`,
        life: 3000
      });
    } else {
      // Create new draft selection - this will also create the PlayerTeam relationship
      await draftSelectionStore.createDraftSelection(draftSelectionData);

      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: `Draft pick #${draftSelection.pickNumber} recorded successfully`,
        life: 3000
      });
    }

    // Navigate back to list
    navigateBack();
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || `Failed to ${isEditMode.value ? 'update' : 'create'} draft selection`,
      life: 3000
    });
    console.error('Draft selection error:', error);
  } finally {
    loading.value = false;
  }
};

// Navigation
const navigateBack = () => {
  router.push('/draft-selections');
};
</script>

<style scoped>
.draft-selection-form {
  padding: 1rem;
}

.header {
  margin-bottom: 1rem;
}

.card {
  background: #ffffff;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 1px -1px rgba(0, 0, 0, 0.2),
              0 1px 1px 0 rgba(0, 0, 0, 0.14),
              0 1px 3px 0 rgba(0, 0, 0, 0.12);
}

.p-field {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 2rem;
}

.p-error {
  color: #f44336;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
</style>
