<template>
  <div class="draft-selection-details-view">
    <div class="header">
      <h2>Draft Pick Details</h2>
      <div class="actions">
        <Button
          label="Edit"
          icon="pi pi-pencil"
          class="p-button-success mr-2"
          @click="editDraftSelection"
        />
        <Button
          label="Back to List"
          icon="pi pi-arrow-left"
          class="p-button-secondary"
          @click="navigateBack"
        />
      </div>
    </div>

    <div class="card" v-if="!loading">
      <div class="p-grid">
        <div class="p-col-12 p-md-6">
          <div class="detail-section">
            <h3>Draft Information</h3>
            <div class="detail-item">
              <label>Year:</label>
              <div>{{ draftSelection?.draftYear }}</div>
            </div>
            <div class="detail-item">
              <label>Round:</label>
              <div>{{ draftSelection?.draftRound }}</div>
            </div>
            <div class="detail-item">
              <label>Pick Number:</label>
              <div>{{ draftSelection?.pickNumber }}</div>
            </div>
          </div>
        </div>

        <div class="p-col-12 p-md-6">
          <div class="detail-section">
            <h3>Team Information</h3>
            <div class="detail-item" v-if="team">
              <label>Team:</label>
              <div>{{ team.name }}</div>
            </div>
            <div class="detail-item" v-if="team && team.city">
              <label>City:</label>
              <div>{{ team.city }}</div>
            </div>
            <div class="detail-item" v-if="team && team.division">
              <label>Division:</label>
              <div>{{ team.division }}</div>
            </div>
            <div class="detail-item" v-if="team && team.conference">
              <label>Conference:</label>
              <div>{{ team.conference }}</div>
            </div>
          </div>
        </div>

        <div class="p-col-12">
          <div class="detail-section">
            <h3>Player Information</h3>
            <div class="detail-item" v-if="player">
              <label>Player:</label>
              <div>{{ player.firstName }} {{ player.lastName }}</div>
            </div>
            <div class="detail-item">
              <label>Position:</label>
              <div>{{ draftSelection?.position }}</div>
            </div>
            <div class="detail-item">
              <label>College:</label>
              <div>{{ draftSelection?.college }}</div>
            </div>
            <div class="detail-item" v-if="player && player.height">
              <label>Height:</label>
              <div>{{ player.height }}</div>
            </div>
            <div class="detail-item" v-if="player && player.weight">
              <label>Weight:</label>
              <div>{{ player.weight }} lbs</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="loading-container">
      <ProgressSpinner />
      <div>Loading draft selection details...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import { useDraftSelectionStore } from '@/stores/draftSelection';
import { DraftSelection } from '@/domain/models/DraftSelection';
import { Player } from '@/domain/models/Player';
import { Team } from '@/domain/models/Team';

// Props
const props = defineProps({
  id: {
    type: Number,
    required: true
  }
});

// Store, router, and toast
const draftSelectionStore = useDraftSelectionStore();
const router = useRouter();
const toast = useToast();

// State
const loading = ref(true);
const draftSelection = ref<DraftSelection | null>(null);

// Computed properties for related entities
const player = computed<Player | undefined>(() => {
  if (draftSelection.value?.playerId) {
    return draftSelectionStore.getPlayerById(draftSelection.value.playerId);
  }
  return undefined;
});

const team = computed<Team | undefined>(() => {
  if (draftSelection.value?.teamId) {
    return draftSelectionStore.getTeamById(draftSelection.value.teamId);
  }
  return undefined;
});

// Load data when component mounts
onMounted(async () => {
  loading.value = true;

  try {
    // Fetch dependencies
    await draftSelectionStore.fetchDependencies();

    // Fetch the draft selection using the id prop
    if (props.id) {
      const selection = await draftSelectionStore.fetchDraftSelectionById(props.id);

      if (selection) {
        draftSelection.value = selection;
      } else {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Draft selection not found',
          life: 3000
        });
        navigateBack();
      }
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No draft selection ID provided',
        life: 3000
      });
      navigateBack();
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load draft selection details',
      life: 3000
    });
  } finally {
    loading.value = false;
  }
});

// Navigation
const navigateBack = () => {
  router.push('/draft-selections');
};

const editDraftSelection = () => {
  if (draftSelection.value?.id) {
    router.push({
      path: `/draft-selections/${draftSelection.value.id}`,
      query: { edit: 'true' }
    });
  }
};
</script>

<style scoped>
.draft-selection-details-view {
  width: 100%;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.header h2 {
  margin: 0;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.card {
  background: #ffffff;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 1px -1px rgba(0, 0, 0, 0.2),
              0 1px 1px 0 rgba(0, 0, 0, 0.14),
              0 1px 3px 0 rgba(0, 0, 0, 0.12);
}

.detail-section {
  margin-bottom: 2rem;
}

.detail-section h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.detail-item {
  display: flex;
  margin-bottom: 0.75rem;
}

.detail-item label {
  font-weight: 600;
  width: 120px;
  flex-shrink: 0;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
}

.p-grid {
  display: flex;
  flex-wrap: wrap;
  margin-right: -0.5rem;
  margin-left: -0.5rem;
  margin-top: -0.5rem;
}

.p-col-12 {
  flex: 0 0 100%;
  padding: 0.5rem;
}

@media screen and (min-width: 768px) {
  .p-md-6 {
    flex: 0 0 50%;
  }
}
</style>
