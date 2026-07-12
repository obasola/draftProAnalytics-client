<template>
  <div class="page">
    <div class="header-row">
      <div>
        <h1 class="b4me-title">
          <span class="b4m">B4Me Analysis</span>
          <span class="b4me">(Jet-X) Big 4 Metrics Enhanced</span>
        </h1>        
      </div>
      <B4MeVersionBadge :framework-version="store.methodology?.frameworkVersion ?? null" />
    </div>

    <Card class="search-card">
      <template #content>
        <div class="filters">
          <div class="field">
            <label for="positionGroup">Position Group</label>
            <Dropdown
              id="positionGroup"
              v-model="positionGroup"
              :options="positionOptions"
              optionLabel="label"
              optionValue="value"
            />
          </div>

          <div class="field">
            <label for="draftYear">Draft Year</label>
            <InputNumber
              id="draftYear"
              v-model="draftYear"
              :useGrouping="false"
            />
          </div>

          <div class="field">
            <label for="playerName">Player Name</label>
            <InputText id="playerName" v-model="playerName" />
          </div>

          <div class="field">
            <label for="scoringMode">Scoring Mode</label>
            <Dropdown
              id="scoringMode"
              v-model="scoringMode"
              :options="scoringModeOptions"
              optionLabel="label"
              optionValue="value"
            />
          </div>
        </div>

        <div class="toggles">
          <div class="toggle">
            <Checkbox v-model="limitationFiltersEnabled" binary inputId="limitations" />
            <label for="limitations">Limitation Filters</label>
          </div>

          <div class="toggle">
            <Checkbox v-model="decisionViewEnabled" binary inputId="decisionView" />
            <label for="decisionView">Decision View</label>
          </div>

          <div class="toggle">
            <Checkbox v-model="includeMethodology" binary inputId="methodology" />
            <label for="methodology">Include Methodology</label>
          </div>

          <div class="toggle">
            <Checkbox
              v-model="includeTeamContextPlaceholder"
              binary
              inputId="teamContext"
            />
            <label for="teamContext">Include Team Context Placeholder</label>
          </div>

          <Button label="Run Analysis" icon="pi pi-search" @click="runSearch" />
        </div>

        <ActiveFilterSummaryBadges :summary="store.activeFilterSummary" />
      </template>
    </Card>

    <Message v-if="store.error" severity="error" :closable="false">
      {{ store.error }}
    </Message>

    <ProgressSpinner v-if="store.loading" />

    <Message
      v-else-if="!store.loading && store.rows.length === 0"
      severity="info"
      :closable="false"
    >
      No prospects matched the current filters.
    </Message>

    <div v-else class="content-grid">
      <Card>
        <template #title>Prospects</template>
        <template #content>
          <DataTable
            :value="store.rows"
            dataKey="prospectId"
            selectionMode="single"
            :selection="store.selectedRow"
            @row-click="onRowClick"
          >
            <Column field="playerName" header="Player" />
            <Column field="positionGroup" header="Group" />
            <Column field="baseScore" header="Base" />
            <Column field="enhancedScore" header="Enhanced" />
            <Column field="decisionViewScore" header="Decision View" />
            <Column field="scoreLabel" header="Label" />
          </DataTable>
        </template>
      </Card>

      <div class="side-stack">
        <B4MeProspectDetailPanel
          :row="store.selectedRow"
          @show-explanation="openExplanation"
        />
        <MethodologyPanel :methodology="store.methodology" />
        <LimitationsPanel :methodology="store.methodology" />
        <TeamContextPlaceholderPanel :team-context="store.optionalTeamContext" />
      </div>
    </div>

    <ScoreExplanationDrawer
      v-model:visible="scoreDrawerVisible"
      :explanation="activeExplanation"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Checkbox from 'primevue/checkbox';
import Column from 'primevue/column';
import DataTable, { type DataTableRowClickEvent } from 'primevue/datatable';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import { useB4MeAnalysisStore } from '../stores/useB4MeAnalysisStore';
import type {
  B4MePositionGroup,
  B4MeScoringMode,
  B4MeScoreExplanation
} from '../types/b4meAnalysis';
import ActiveFilterSummaryBadges from '../components/ActiveFilterSummaryBadges.vue';
import B4MeProspectDetailPanel from '../components/B4MeProspectDetailPanel.vue';
import B4MeVersionBadge from '../components/B4MeVersionBadge.vue';
import LimitationsPanel from '../components/LimitationsPanel.vue';
import MethodologyPanel from '../components/MethodologyPanel.vue';
import ScoreExplanationDrawer from '../components/ScoreExplanationDrawer.vue';
import TeamContextPlaceholderPanel from '../components/TeamContextPlaceholderPanel.vue';

type RouteBooleanDefault = boolean;

function parseRouteBoolean(
  value: unknown,
  defaultValue: RouteBooleanDefault
): boolean {
  if (typeof value !== 'string') {
    return defaultValue;
  }

  const normalized: string = value.trim().toLowerCase();

  if (normalized === 'true' || normalized === '1') {
    return true;
  }

  if (normalized === 'false' || normalized === '0') {
    return false;
  }

  return defaultValue;
}

function parseRouteNullableNumber(value: unknown, defaultValue: number | null): number | null {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return defaultValue;
  }

  const parsed: number = Number(value);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

function parseRouteScoringMode(value: unknown): B4MeScoringMode {
  if (
    value === 'BASE_ONLY' ||
    value === 'BASE_PLUS_CONTEXT' ||
    value === 'FULL_DECISION_SCORE'
  ) {
    return value;
  }

  return 'BASE_PLUS_CONTEXT';
}

function parseRouteProspectId(value: unknown): number | null {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }

  const parsed: number = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

const route = useRoute();
const router = useRouter();
const store = useB4MeAnalysisStore();

const positionOptions: Array<{ label: string; value: B4MePositionGroup }> = [
  { label: 'Wide Receiver', value: 'WR' },
  { label: 'Edge Defender', value: 'ED' },
  { label: 'Offensive Tackle', value: 'OT' },
  { label: 'Defensive Tackle', value: 'DT' },
  { label: 'Cornerback', value: 'CB' }
];

const scoringModeOptions: Array<{ label: string; value: B4MeScoringMode }> = [
  { label: 'Base Only', value: 'BASE_ONLY' },
  { label: 'Base Plus Context', value: 'BASE_PLUS_CONTEXT' },
  { label: 'Full Decision Score', value: 'FULL_DECISION_SCORE' }
];

/**
 * Backend is currently WR-only, but keep the UI field for forward compatibility.
 * It should not alter the current API request until other groups are implemented server-side.
 */
const positionGroup = ref<B4MePositionGroup>(
  (route.query.positionGroup as B4MePositionGroup) || 'WR'
);

const draftYear = ref<number | null>(
  parseRouteNullableNumber(route.query.draftYear, new Date().getFullYear())
);

const playerName = ref<string>(
  typeof route.query.playerName === 'string' ? route.query.playerName : ''
);

const scoringMode = ref<B4MeScoringMode>(
  parseRouteScoringMode(route.query.scoringMode)
);

const limitationFiltersEnabled = ref<boolean>(
  parseRouteBoolean(route.query.limitationFiltersEnabled, true)
);

const decisionViewEnabled = ref<boolean>(
  parseRouteBoolean(route.query.decisionViewEnabled, true)
);

const includeMethodology = ref<boolean>(
  parseRouteBoolean(route.query.includeMethodology, true)
);

const includeTeamContextPlaceholder = ref<boolean>(
  parseRouteBoolean(route.query.includeTeamContextPlaceholder, true)
);

const scoreDrawerVisible = ref<boolean>(false);

const activeExplanation = computed<B4MeScoreExplanation | null>(() => {
  return store.selectedRow?.scoreExplanation ?? null;
});

async function runSearch(): Promise<void> {
  const selectedProspectIdForRoute: number | null = store.selectedProspectId;

  await router.replace({
    query: {
      positionGroup: positionGroup.value,
      draftYear: draftYear.value ?? undefined,
      playerName: playerName.value.trim().length > 0 ? playerName.value.trim() : undefined,
      scoringMode: scoringMode.value,
      limitationFiltersEnabled: String(limitationFiltersEnabled.value),
      decisionViewEnabled: String(decisionViewEnabled.value),
      includeMethodology: String(includeMethodology.value),
      includeTeamContextPlaceholder: String(includeTeamContextPlaceholder.value),
      prospectId: selectedProspectIdForRoute ?? undefined
    }
  });

  await store.load({
    draftYear: draftYear.value,
    playerName: playerName.value.trim().length > 0 ? playerName.value.trim() : null,
    scoringMode: scoringMode.value,
    includeMethodology: includeMethodology.value,
    includeTeamContextPlaceholder: includeTeamContextPlaceholder.value,

    /**
     * "Limitation Filters" controls the limitation-correction layer.
     */
    enableCompetitionDiscount: limitationFiltersEnabled.value,
    enableInjuryAvailabilityAdjustment: limitationFiltersEnabled.value,
    enableQbOffenseContextAdjustment: limitationFiltersEnabled.value,
    enableSampleSizeAdjustment: limitationFiltersEnabled.value,
    enableArchetypeConfidenceAdjustment: limitationFiltersEnabled.value,

    /**
     * "Decision View" controls the downstream decision overlays.
     */
    enableCoachabilityAdjustment: decisionViewEnabled.value,
    enableRfaAdjustment: decisionViewEnabled.value,
    enableRvaAdjustment: decisionViewEnabled.value
  });

  const routeProspectId: number | null = parseRouteProspectId(route.query.prospectId);

  if (
    routeProspectId !== null &&
    store.rows.some((row) => Number(row.prospectId) === routeProspectId)
  ) {
    store.setSelectedProspectId(routeProspectId);
  }
}

function onRowClick(event: DataTableRowClickEvent): void {
  const row = event.data as { prospectId: number };
  store.setSelectedProspectId(row.prospectId);

  void router.replace({
    query: {
      ...route.query,
      prospectId: String(row.prospectId)
    }
  });
}

function openExplanation(prospectId: number | string): void {
  const normalizedProspectId: number =
    typeof prospectId === 'number' ? prospectId : Number(prospectId);

  if (!Number.isNaN(normalizedProspectId)) {
    store.setSelectedProspectId(normalizedProspectId);
  }

  scoreDrawerVisible.value = true;
}

watch(
  () => route.query.prospectId,
  (value) => {
    const parsedProspectId: number | null = parseRouteProspectId(value);
    store.setSelectedProspectId(parsedProspectId);
  }
);

onMounted(async () => {
  await runSearch();
});
</script>

<style scoped>
.b4me-title {
  margin: 0;
  line-height: 1.1;
}

.b4m {
  display: block;
  background-color: #054dbd;
  margin: 0;
}

.b4me {
  display: block;
  font-size: 10pt;
  margin-top: 2px;
}
.page {
  display: grid;
  gap: 1rem;
}

.header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.search-card {
  width: 100%;
}

.filters {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.field {
  display: grid;
  gap: 0.35rem;
}

.toggles {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
}

.toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
  gap: 1rem;
}

.side-stack {
  display: grid;
  gap: 1rem;
}
</style>