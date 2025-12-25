<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import Card from "primevue/card";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Tag from "primevue/tag";
import Divider from "primevue/divider";
import InputNumber from "primevue/inputnumber";
import { useTeamNeedsStore } from "../../application/stores/useTeamNeedsStore";
import type { TeamNeedDto, TeamNeedSuggestionDto } from "../../domain/dtos/TeamNeedDtos";

const route = useRoute();
const store = useTeamNeedsStore();

const teamId = computed(() => Number(route.params.teamId));

const editing = ref<Record<string, { priority: number; draftYear: number | null }>>({});

function prioritySeverity(priority: number): "success" | "info" | "warning" | "danger" {
  if (priority >= 5) return "danger";
  if (priority === 4) return "warning";
  if (priority === 3) return "info";
  return "success";
}

function ensureEditRow(need: TeamNeedDto): void {
  if (!editing.value[need.position]) {
    editing.value[need.position] = {
      priority: need.priority,
      draftYear: need.draftYear ?? null
    };
  }
}

async function saveNeed(need: TeamNeedDto): Promise<void> {
  ensureEditRow(need);
  const draft = editing.value[need.position];
  await store.saveNeed(teamId.value, { position: need.position, priority: draft.priority, draftYear: draft.draftYear });
}

async function applySuggestion(s: TeamNeedSuggestionDto): Promise<void> {
  await store.applySuggestion(teamId.value, s);
}

async function deleteNeed(pos: string): Promise<void> {
  await store.deleteNeed(teamId.value, pos);
}

const persistedNeedsSorted = computed(() => {
  return [...store.persistedNeeds].sort((a, b) => b.priority - a.priority || a.position.localeCompare(b.position));
});

onMounted(async () => {
  if (Number.isInteger(teamId.value)) {
    await store.load(teamId.value);
  }
});
</script>

<template>
  <div class="p-4">
    <div class="flex items-start justify-between gap-3 mb-3">
      <div>
        <h2 class="text-2xl font-semibold">Team Needs</h2>
        <div class="opacity-80 text-sm" v-if="store.evaluationYear">
          Evaluation year: {{ store.evaluationYear }}
        </div>
      </div>

      <Button label="Refresh" icon="pi pi-refresh" :loading="store.isLoading" @click="store.load(teamId)" />
    </div>

    <div v-if="store.error" class="mb-3 p-3 border-round surface-100 text-red-600">
      {{ store.error }}
    </div>

    <div class="grid gap-4" style="grid-template-columns: 1fr;">
      <Card>
        <template #title>Suggested needs (computed)</template>
        <template #content>
          <DataTable :value="store.suggestions" dataKey="position" :loading="store.isLoading" responsiveLayout="scroll">
            <Column field="position" header="Pos" style="width: 90px" />
            <Column header="Priority" style="width: 120px">
              <template #body="{ data }">
                <Tag :value="data.priority" :severity="prioritySeverity(data.priority)" />
              </template>
            </Column>
            <Column header="Roster" style="width: 140px">
              <template #body="{ data }">
                <div class="text-sm">
                  {{ data.rosterCount }} players
                  <span v-if="data.avgAge !== null"> · avg {{ data.avgAge }}</span>
                </div>
                <div v-if="data.expiringCount > 0" class="text-xs opacity-80">
                  {{ data.expiringCount }} expiring
                </div>
              </template>
            </Column>
            <Column header="Why">
              <template #body="{ data }">
                <div class="flex flex-wrap gap-2">
                  <Tag v-for="(r, idx) in data.reasons" :key="idx" :value="r" severity="info" />
                </div>
              </template>
            </Column>
            <Column header="" style="width: 140px">
              <template #body="{ data }">
                <Button label="Apply" icon="pi pi-check" size="small" @click="applySuggestion(data)" />
              </template>
            </Column>
          </DataTable>

          <div v-if="!store.isLoading && store.suggestions.length === 0" class="opacity-70 mt-2">
            No meaningful needs detected (or roster data is incomplete).
          </div>
        </template>
      </Card>

      <Divider />

      <Card>
        <template #title>Saved needs (persisted)</template>
        <template #content>
          <DataTable :value="persistedNeedsSorted" dataKey="position" :loading="store.isLoading" responsiveLayout="scroll">
            <Column field="position" header="Pos" style="width: 90px" />
            <Column header="Priority" style="width: 220px">
              <template #body="{ data }">
                <div class="flex items-center gap-2">
                  <Tag :value="data.priority" :severity="prioritySeverity(data.priority)" />
                  <InputNumber
                    v-model="editing[data.position].priority"
                    :min="1"
                    :max="5"
                    :useGrouping="false"
                    inputClass="w-6rem"
                    @focus="ensureEditRow(data)"
                  />
                </div>
              </template>
            </Column>
            <Column header="Draft year" style="width: 220px">
              <template #body="{ data }">
                <InputNumber
                  v-model="editing[data.position].draftYear"
                  :useGrouping="false"
                  inputClass="w-8rem"
                  placeholder="(optional)"
                  @focus="ensureEditRow(data)"
                />
              </template>
            </Column>
            <Column header="" style="width: 220px">
              <template #body="{ data }">
                <div class="flex gap-2">
                  <Button label="Save" icon="pi pi-save" size="small" @click="saveNeed(data)" />
                  <Button label="Remove" icon="pi pi-trash" size="small" severity="danger" @click="deleteNeed(data.position)" />
                </div>
              </template>
            </Column>
          </DataTable>

          <div v-if="!store.isLoading && store.persistedNeeds.length === 0" class="opacity-70 mt-2">
            No saved needs yet. Apply a suggestion above to create one quickly.
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

