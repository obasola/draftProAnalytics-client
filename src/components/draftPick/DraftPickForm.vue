<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Card from 'primevue/card';
import Button from 'primevue/button';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Checkbox from 'primevue/checkbox';
import Message from 'primevue/message';
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from 'primevue/useconfirm';
import { useDraftPickStore } from '@/stores/draftPickStore';
import { teamService } from '@/services/teamService';
import type { CreateDraftPickData, UpdateDraftPickData } from '@/domain/entities/draftPick';

const router = useRouter();
const route = useRoute();
const confirm = useConfirm();
const draftPickStore = useDraftPickStore();

const mode = ref<'create' | 'edit' | 'read'>('create');
const originalDraftPickData = ref<any>(null);

const formData = ref<CreateDraftPickData>({
  round: 1,
  pickNumber: 1,
  draftYear: new Date().getFullYear(),
  currentTeamId: 1,
  prospectId: null,
  playerId: null,
  used: false,
  originalTeam: null,
  position: null,
  college: null,
});

const displayData = ref({
  teamName: '',
  playerName: '',
});

// Teams list
const teams = ref<{ id: number; name: string }[]>([]);
const teamOptions = computed(() => 
  teams.value.map(team => ({ label: team.name, value: team.id }))
);

const isReadOnly = computed(() => mode.value === 'read');
const isEditMode = computed(() => mode.value === 'edit');
const isCreateMode = computed(() => mode.value === 'create');

const pageTitle = computed(() => {
  if (isCreateMode.value) return 'Create Draft Pick';
  if (isEditMode.value) return 'Edit Draft Pick';
  return 'View Draft Pick';
});

const loadTeams = async (): Promise<void> => {
  try {
    teams.value = await teamService.getTeamNames();
    console.log('✅ Teams loaded:', teams.value.length);
  } catch (error) {
    console.error('❌ Failed to load teams:', error);
    draftPickStore.error = 'Failed to load teams list';
  }
};

const loadDraftPick = async (year: number, round: number, pickNumber: number): Promise<void> => {
  try {
    // Fetch the full draft pick with ID
    const picks = await draftPickStore.fetchAll({
      draftYear: year,
      round: round
    });

    const pick =  picks.find(
      (p: any) => p.draftYear === year && p.round === round && p.pickNumber === pickNumber
    );
    
    if (pick) {
      originalDraftPickData.value = { ...pick };
      formData.value = {
        round: pick.round,
        pickNumber: pick.pickNumber,
        draftYear: pick.draftYear,
        currentTeamId: pick.currentTeamId,
        prospectId: pick.prospectId,
        playerId: pick.playerId,
        used: pick.used,
        originalTeam: pick.originalTeam,
        position: pick.position,
        college: pick.college,
      };
      
      // Fetch relation data for display
      await draftPickStore.fetchByTeamAndYear(pick.currentTeamId, year);
      const relatedPick = draftPickStore.draftPicksWithRelations.find(
        (rp: any) => rp.round === round && rp.pickNumber === pickNumber
      );
      
      if (relatedPick) {
        displayData.value.teamName = relatedPick.team;
        displayData.value.playerName = relatedPick.player || 'Not selected';
      }
    }
  } catch (error) {
    console.error('❌ Failed to load draft pick:', error);
  }
};

const handleTeamChange = (event: any): void => {
  if (!isEditMode.value) return;
  
  const newTeamId = event.value;
  const oldTeamId = originalDraftPickData.value?.currentTeamId;
  
  if (newTeamId === oldTeamId) return;
  
  const oldTeamName = teams.value.find(t => t.id === oldTeamId)?.name || 'Unknown';
  const newTeamName = teams.value.find(t => t.id === newTeamId)?.name || 'Unknown';
  
  confirm.require({
    message: `You are about to change the team from "${oldTeamName}" to "${newTeamName}". This will permanently delete the original team relationship and update the draft pick assignment. Are you certain you want to proceed with this change?`,
    header: 'Confirm Team Change',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Yes, Change Team',
    rejectLabel: 'Cancel',
    acceptClass: 'p-button-danger',
    accept: () => {
      formData.value.currentTeamId = newTeamId;
      displayData.value.teamName = newTeamName;
      console.log(`✅ Team changed from ${oldTeamName} (ID: ${oldTeamId}) to ${newTeamName} (ID: ${newTeamId})`);
    },
    reject: () => {
      // Revert to original team
      formData.value.currentTeamId = oldTeamId;
      console.log('❌ Team change cancelled');
    }
  });
};

const handleSubmit = async (): Promise<void> => {
  if (isCreateMode.value) {
    const result = await draftPickStore.create(formData.value);
    if (result) {
      console.log('✅ Draft pick created successfully');
      router.push('/draftpicks');
    }
  } else if (isEditMode.value && originalDraftPickData.value) {
    const updateData: UpdateDraftPickData = {
      round: formData.value.round,
      pickNumber: formData.value.pickNumber,
      draftYear: formData.value.draftYear,
      currentTeamId: formData.value.currentTeamId,
      prospectId: formData.value.prospectId,
      playerId: formData.value.playerId,
      used: formData.value.used,
      originalTeam: formData.value.originalTeam,
      position: formData.value.position,
      college: formData.value.college,
    };
    const result = await draftPickStore.update(originalDraftPickData.value.id, updateData);
    if (result) {
      console.log('✅ Draft pick updated successfully');
      router.push('/draftpicks');
    }
  }
};

const handleCancel = (): void => {
  router.push('/draftpicks');
};

const switchToEditMode = (): void => {
  mode.value = 'edit';
  router.replace({ query: { ...route.query, mode: 'edit' } });
};

onMounted(async () => {
  // Load teams first
  await loadTeams();
  
  const queryMode = route.query.mode as string;
  if (queryMode === 'edit' || queryMode === 'read') {
    mode.value = queryMode;
  } else {
    mode.value = 'create';
  }

  const year = route.params.year as string;
  const round = route.params.round as string;
  const pickNumber = route.params.pickNumber as string;
  
  if (year && round && pickNumber) {
    await loadDraftPick(Number(year), Number(round), Number(pickNumber));
  }

  // Set initial team if provided in query
  if (route.query.teamId) {
    formData.value.currentTeamId = Number(route.query.teamId);
  }
  
  // Set display name for initial team selection
  if (formData.value.currentTeamId) {
    const team = teams.value.find(t => t.id === formData.value.currentTeamId);
    if (team) {
      displayData.value.teamName = team.name;
    }
  }
});

watch(() => route.query.mode, (newMode) => {
  if (newMode === 'edit' || newMode === 'read' || newMode === 'create') {
    mode.value = newMode;
  }
});
</script>

<template>
  <div>
    <ConfirmDialog />
    <Card class="draft-pick-form-container">
      <template #title>
        <div class="form-header">
          <h2>{{ pageTitle }}</h2>
          <Button 
            v-if="isReadOnly"
            @click="switchToEditMode" 
            icon="pi pi-pencil" 
            label="Edit"
            class="p-button-warning"
          />
        </div>
      </template>

      <template #content>
        <Message v-if="draftPickStore.error" severity="error" :closable="true">
          {{ draftPickStore.error }}
        </Message>

        <form @submit.prevent="handleSubmit" class="draft-pick-form">
          <div class="form-grid">
            <div class="form-field">
              <label for="draftYear">Draft Year *</label>
              <InputNumber 
                id="draftYear"
                v-model="formData.draftYear" 
                :disabled="isReadOnly || isEditMode"
                :min="1900"
                :max="2100"
                :useGrouping="false"
                required
              />
            </div>

            <div class="form-field">
              <label for="round">Round *</label>
              <InputNumber 
                id="round"
                v-model="formData.round" 
                :disabled="isReadOnly || isEditMode"
                :min="1"
                :max="20"
                required
              />
            </div>

            <div class="form-field">
              <label for="pickNumber">Pick Number *</label>
              <InputNumber 
                id="pickNumber"
                v-model="formData.pickNumber" 
                :disabled="isReadOnly || isEditMode"
                :min="1"
                :max="50"
                required
              />
            </div>

            <div class="form-field">
              <label for="currentTeam">Current Team *</label>
              <Dropdown 
                v-if="!isReadOnly"
                id="currentTeam"
                v-model="formData.currentTeamId"
                :options="teamOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select a team"
                @change="handleTeamChange"
                required
              />
              <InputText 
                v-else
                id="currentTeamDisplay"
                :value="displayData.teamName"
                disabled
              />
            </div>

            <div class="form-field">
              <label for="originalTeam">Original Team</label>
              <Dropdown 
                v-if="!isReadOnly"
                id="originalTeam"
                v-model="formData.originalTeam"
                :options="teamOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select original team"
              />
              <InputNumber 
                v-else
                id="originalTeamDisplay"
                :value="formData.originalTeam"
                disabled
              />
            </div>

            <div class="form-field">
              <label for="player">Player</label>
              <InputText 
                id="player"
                :value="displayData.playerName"
                disabled
              />
              <small class="field-note">Player assignments are managed separately</small>
            </div>

            <div class="form-field">
              <label for="playerId">Player ID</label>
              <InputNumber 
                id="playerId"
                v-model="formData.playerId" 
                :disabled="isReadOnly"
                :min="1"
              />
            </div>

            <div class="form-field">
              <label for="prospectId">Prospect ID</label>
              <InputNumber 
                id="prospectId"
                v-model="formData.prospectId" 
                :disabled="isReadOnly"
                :min="1"
              />
            </div>

            <div class="form-field">
              <label for="position">Position</label>
              <InputText 
                id="position"
                v-model="formData.position" 
                :disabled="isReadOnly"
                placeholder="e.g., QB, RB, WR"
              />
            </div>

            <div class="form-field">
              <label for="college">College</label>
              <InputText 
                id="college"
                v-model="formData.college" 
                :disabled="isReadOnly"
                placeholder="e.g., Alabama"
              />
            </div>

            <div class="form-field checkbox-field">
              <Checkbox 
                id="used"
                v-model="formData.used" 
                :disabled="isReadOnly"
                :binary="true"
              />
              <label for="used">Pick Used</label>
            </div>
          </div>

          <div v-if="!isReadOnly" class="form-actions">
            <Button 
              type="submit" 
              :label="isCreateMode ? 'Create' : 'Update'" 
              icon="pi pi-check"
              class="p-button-success"
              :loading="draftPickStore.loading"
            />
            <Button 
              @click="handleCancel" 
              label="Cancel" 
              icon="pi pi-times"
              class="p-button-secondary"
              :disabled="draftPickStore.loading"
            />
          </div>

          <div v-else class="form-actions">
            <Button 
              @click="handleCancel" 
              label="Back to List" 
              icon="pi pi-arrow-left"
              class="p-button-secondary"
            />
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.draft-pick-form-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.form-header h2 {
  margin: 0;
  color: var(--text-color);
}

.draft-pick-form {
  width: 100%;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field label {
  font-weight: 500;
  color: var(--text-color);
  font-size: 0.875rem;
}

.field-note {
  color: var(--text-color-secondary);
  font-size: 0.75rem;
  font-style: italic;
}

.checkbox-field {
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
}

.checkbox-field label {
  margin: 0;
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-start;
  padding-top: 1rem;
  border-top: 1px solid var(--surface-border);
}

:deep(.p-inputtext),
:deep(.p-inputnumber-input),
:deep(.p-dropdown) {
  width: 100%;
}

:deep(.p-message) {
  margin-bottom: 1rem;
}
</style>