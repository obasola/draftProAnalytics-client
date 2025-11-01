<template>
  <div class="draft-selection-container">
    <div class="header">
      <h2>NFL Draft Selections</h2>
      <div class="actions">
        <Button
          label="Record Pick"
          icon="pi pi-plus"
          class="p-button-success"
          @click="navigateToCreate"
        />
      </div>
    </div>

    <DataTable
      :value="draftSelections"
      :paginator="true"
      :rows="10"
      :rowsPerPageOptions="[5, 10, 25, 50]"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
      responsiveLayout="scroll"
      class="p-datatable-sm"
      :loading="loading"
    >
      <Column field="pickNumber" header="Pick #" sortable></Column>
      <Column field="draftRound" header="Round" sortable></Column>
      <Column field="teamName" header="Team" sortable></Column>
      <Column field="playerName" header="Player" sortable></Column>
      <Column field="position" header="Position" sortable></Column>
      <Column field="college" header="College" sortable></Column>
      <Column header="Actions" style="min-width: 130px; width: 130px;">
        <template #body="{ data }">
          <div class="action-buttons">
            <Button
              icon="pi pi-eye"
              class="p-button-text p-button-rounded p-button-info"
              @click="viewDraftSelection(data.id)"
              v-tooltip.top="'View'"
            />
            <Button
              icon="pi pi-pencil"
              class="p-button-text p-button-rounded p-button-success"
              @click="editDraftSelection(data.id)"
              v-tooltip.top="'Edit'"
            />
            <Button
              icon="pi pi-trash"
              class="p-button-text p-button-rounded p-button-danger"
              @click="confirmDelete(data)"
              v-tooltip.top="'Delete'"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <Dialog
      v-model:visible="deleteDialog"
      :style="{ width: '450px' }"
      header="Confirm"
      :modal="true"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span v-if="draftSelectionToDelete">
          Are you sure you want to delete pick #{{ draftSelectionToDelete.pickNumber }}
          ({{ draftSelectionToDelete.playerName }})?
        </span>
      </div>
      <template #footer>
        <Button
          label="No"
          icon="pi pi-times"
          class="p-button-text"
          @click="closeDeleteDialog"
        />
        <Button
          label="Yes"
          icon="pi pi-check"
          class="p-button-text"
          @click="deleteDraftSelection"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import { useDraftSelectionStore } from '@/stores/draftSelection';
import { DraftSelection } from '@/domain/models/DraftSelection';

// Store and router
const draftSelectionStore = useDraftSelectionStore();
const router = useRouter();
const toast = useToast();

// Reactive references
const deleteDialog = ref(false);
const draftSelectionToDelete = ref<DraftSelection | null>(null);

// Computed values using store state
const draftSelections = draftSelectionStore.draftSelections;
const loading = draftSelectionStore.loading;

// Fetch data on component mount
onMounted(async () => {
  await draftSelectionStore.fetchDraftSelections();
});

// Navigation methods
const navigateToCreate = () => {
  router.push('/draft-selections/create');
};

const viewDraftSelection = (id: number) => {
  router.push(`/draft-selections/${id}`);
};

const editDraftSelection = (id: number) => {
  router.push({
    path: `/draft-selections/${id}`,
    query: { edit: 'true' }
  });
};

// Delete functionality
const confirmDelete = (draftSelection: DraftSelection) => {
  draftSelectionToDelete.value = draftSelection;
  deleteDialog.value = true;
};

const closeDeleteDialog = () => {
  deleteDialog.value = false;
  draftSelectionToDelete.value = null;
};

const deleteDraftSelection = async () => {
  try {
    if (draftSelectionToDelete.value && draftSelectionToDelete.value.id) {
      const success = await draftSelectionStore.deleteDraftSelection(draftSelectionToDelete.value.id);

      if (success) {
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: `Draft pick #${draftSelectionToDelete.value.pickNumber} was deleted successfully`,
          life: 3000
        });
      } else {
        throw new Error('Failed to delete draft selection');
      }
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'There was an error deleting the draft selection',
      life: 3000
    });
  } finally {
    closeDeleteDialog();
  }
};
</script>

<style scoped>
.draft-selection-container {
  padding: 1rem;
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

.p-datatable-sm {
  margin-top: 1rem;
}

.action-buttons {
  display: flex;
  gap: 5px;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}

.action-buttons .p-button {
  padding: 0.25rem;
  margin: 0 2px;
}

:deep(.p-button-rounded) {
  width: 32px;
  height: 32px;
  line-height: 32px;
}

.confirmation-content {
  display: flex;
  align-items: center;
}
</style>
