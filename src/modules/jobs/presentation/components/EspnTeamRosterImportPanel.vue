<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Checkbox from 'primevue/checkbox';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import Message from 'primevue/message';

import { teamService } from '@/services/teamService';
import type { LoadEspnTeamRostersCommand, RosterImportMode } from '../../domain/NflJobTypes';
import { useDpaJobsStore } from '../stores/useDpaJobsStore';

interface TeamOption {
  readonly id: number;
  readonly name: string;
}

const emit = defineEmits<{ readonly 'job-submitted': [jobId: number] }>();
const store = useDpaJobsStore();
const currentYear = new Date().getFullYear();

const seasonYear = ref(currentYear);
const selectedTeamId = ref<number | null>(null);
const importMode = ref<RosterImportMode>('CURRENT');
const reconcileCurrentRoster = ref(false);
const teamOptions = ref<readonly TeamOption[]>([]);
const loadingTeams = ref(false);
const message = ref<string | null>(null);
const localError = ref<string | null>(null);

const importModeOptions: readonly { readonly label: string; readonly value: RosterImportMode }[] = [
  { label: 'Current roster', value: 'CURRENT' },
  { label: 'Historical season roster', value: 'HISTORICAL' },
];

const validYear = computed(() => (
  Number.isInteger(seasonYear.value)
  && seasonYear.value >= 1920
  && seasonYear.value <= currentYear + 1
));

const canReconcile = computed(() => importMode.value === 'CURRENT');
const canLoadSelectedTeam = computed(() => validYear.value && selectedTeamId.value !== null);
const canLoadAllTeams = computed(() => validYear.value && teamOptions.value.length > 0);

const clearMessages = (): void => {
  message.value = null;
  localError.value = null;
  store.clearError();
};

const loadTeams = async (): Promise<void> => {
  loadingTeams.value = true;
  localError.value = null;

  try {
    const teams = await teamService.getTeamNames();
    teamOptions.value = teams
      .filter((team) => team.id > 0)
      .sort((left, right) => left.name.localeCompare(right.name));
  } catch (error) {
    localError.value = error instanceof Error ? error.message : 'Unable to load teams.';
  } finally {
    loadingTeams.value = false;
  }
};

const buildCommand = (teamId?: number): LoadEspnTeamRostersCommand => ({
  seasonYear: seasonYear.value,
  ...(teamId !== undefined ? { teamId } : {}),
  importMode: importMode.value,
  reconcileCurrentRoster: canReconcile.value && reconcileCurrentRoster.value,
});

const loadSelectedTeam = async (): Promise<void> => {
  if (!canLoadSelectedTeam.value || selectedTeamId.value === null) return;

  clearMessages();
  const job = await store.enqueueLoadEspnTeamRosters(buildCommand(selectedTeamId.value));
  const selectedTeam = teamOptions.value.find((team) => team.id === selectedTeamId.value);
  message.value = `Queued ${selectedTeam?.name ?? 'team'} roster import job #${job.id}.`;
  emit('job-submitted', job.id);
};

const loadAllTeams = async (): Promise<void> => {
  if (!canLoadAllTeams.value) return;

  clearMessages();
  const confirmed = window.confirm(
    `Queue an ESPN ${importMode.value.toLowerCase()} roster import for all teams for ${seasonYear.value}?`,
  );

  if (!confirmed) return;

  const job = await store.enqueueLoadEspnTeamRosters(buildCommand());
  message.value = `Queued all-team roster import job #${job.id}.`;
  emit('job-submitted', job.id);
};

const handleImportModeChange = (): void => {
  if (!canReconcile.value) {
    reconcileCurrentRoster.value = false;
  }
};

onMounted(loadTeams);
</script>

<template>
  <Card>
    <template #title>ESPN Team Roster Import</template>
    <template #subtitle>
      Load a complete roster for one team or all teams. This creates missing players and maintains PlayerTeam assignments.
    </template>

    <template #content>
      <div class="form-grid">
        <div class="field">
          <label for="rosterSeasonYear">Season Year</label>
          <InputNumber
            id="rosterSeasonYear"
            v-model="seasonYear"
            :min="1920"
            :max="currentYear + 1"
            :use-grouping="false"
          />
        </div>

        <div class="field">
          <label for="rosterImportMode">Import Mode</label>
          <Dropdown
            id="rosterImportMode"
            v-model="importMode"
            :options="importModeOptions"
            option-label="label"
            option-value="value"
            @change="handleImportModeChange"
          />
        </div>

        <div class="field team-field">
          <label for="rosterTeam">Team</label>
          <Dropdown
            id="rosterTeam"
            v-model="selectedTeamId"
            :options="teamOptions"
            option-label="name"
            option-value="id"
            placeholder="Select a team"
            filter
            show-clear
            :loading="loadingTeams"
          />
        </div>

        <div class="check-row">
          <Checkbox
            input-id="reconcileCurrentRoster"
            v-model="reconcileCurrentRoster"
            binary
            :disabled="!canReconcile"
          />
          <label for="reconcileCurrentRoster">
            Deactivate current team memberships not returned by ESPN
          </label>
        </div>

        <Message v-if="importMode === 'HISTORICAL'" severity="info" :closable="false">
          Historical imports do not alter a player's current team assignment. Reconciliation is disabled.
        </Message>

        <Message v-if="message" severity="success" :closable="false">{{ message }}</Message>
        <Message v-if="localError" severity="error" :closable="false">{{ localError }}</Message>
        <Message v-if="store.errorMessage" severity="error" :closable="false">{{ store.errorMessage }}</Message>

        <div class="actions">
          <Button
            label="Load Selected Team Roster"
            icon="pi pi-users"
            :disabled="!canLoadSelectedTeam"
            :loading="store.submitting"
            @click="loadSelectedTeam"
          />
          <Button
            label="Load All Team Rosters"
            icon="pi pi-cloud-download"
            severity="secondary"
            :disabled="!canLoadAllTeams"
            :loading="store.submitting"
            @click="loadAllTeams"
          />
          <Button
            label="Refresh Teams"
            icon="pi pi-refresh"
            text
            :loading="loadingTeams"
            @click="loadTeams"
          />
        </div>
      </div>
    </template>
  </Card>
</template>

<style scoped>
.form-grid {
  display: grid;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  max-width: 22rem;
}

.team-field {
  max-width: 30rem;
}

.check-row,
.actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.actions {
  flex-wrap: wrap;
}
</style>
