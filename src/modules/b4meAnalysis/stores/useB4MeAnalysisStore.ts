import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { searchB4MeProspects } from '../services/b4meAnalysis.service';
import type {
  B4MeActiveFilterSummary,
  B4MeEvaluationResponse,
  B4MeEvaluationRow,
  B4MeMethodologyMetadata,
  B4MeOptionalTeamContext,
  B4MeScoringMode
} from '../types/b4meAnalysis';

export interface LoadB4MeAnalysisParams {
  draftYear: number | null;
  playerName: string | null;
  scoringMode: B4MeScoringMode;
  includeMethodology: boolean;
  includeTeamContextPlaceholder: boolean;
  enableCompetitionDiscount: boolean;
  enableInjuryAvailabilityAdjustment: boolean;
  enableQbOffenseContextAdjustment: boolean;
  enableSampleSizeAdjustment: boolean;
  enableArchetypeConfidenceAdjustment: boolean;
  enableCoachabilityAdjustment: boolean;
  enableRfaAdjustment: boolean;
  enableRvaAdjustment: boolean;
}

export const useB4MeAnalysisStore = defineStore('b4meAnalysis', () => {
  const rows = ref<B4MeEvaluationRow[]>([]);
  const methodology = ref<B4MeMethodologyMetadata | null>(null);
  const activeFilterSummary = ref<B4MeActiveFilterSummary | null>(null);
  const optionalTeamContext = ref<B4MeOptionalTeamContext | null>(null);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const selectedProspectId = ref<number | null>(null);

  async function load(params: LoadB4MeAnalysisParams): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const response: B4MeEvaluationResponse = await searchB4MeProspects({
        playerName: params.playerName,
        draftYear: params.draftYear,
        scoringMode: params.scoringMode,
        includeMethodology: params.includeMethodology,
        includeTeamContextPlaceholder: params.includeTeamContextPlaceholder,
        enableCompetitionDiscount: params.enableCompetitionDiscount,
        enableInjuryAvailabilityAdjustment: params.enableInjuryAvailabilityAdjustment,
        enableQbOffenseContextAdjustment: params.enableQbOffenseContextAdjustment,
        enableSampleSizeAdjustment: params.enableSampleSizeAdjustment,
        enableArchetypeConfidenceAdjustment: params.enableArchetypeConfidenceAdjustment,
        enableCoachabilityAdjustment: params.enableCoachabilityAdjustment,
        enableRfaAdjustment: params.enableRfaAdjustment,
        enableRvaAdjustment: params.enableRvaAdjustment
      });

      rows.value = response.rows;
      methodology.value = response.methodology;
      activeFilterSummary.value = response.activeFilterSummary;
      optionalTeamContext.value = response.optionalTeamContext;

      if (
        selectedProspectId.value !== null &&
        !rows.value.some((row) => Number(row.prospectId) === selectedProspectId.value)
      ) {
        selectedProspectId.value = null;
      }

      if (selectedProspectId.value === null && rows.value.length > 0) {
        selectedProspectId.value = Number(rows.value[0].prospectId);
      }
    } catch (unknownError) {
      error.value =
        unknownError instanceof Error
          ? unknownError.message
          : 'Failed to load B4Me analysis.';
      rows.value = [];
      methodology.value = null;
      activeFilterSummary.value = null;
      optionalTeamContext.value = null;
      selectedProspectId.value = null;
    } finally {
      loading.value = false;
    }
  }

  function setSelectedProspectId(prospectId: number | null): void {
    selectedProspectId.value = prospectId;
  }

  const selectedRow = computed<B4MeEvaluationRow | null>(() => {
    return rows.value.find((row) => Number(row.prospectId) === selectedProspectId.value) ?? null;
  });

  return {
    rows,
    methodology,
    activeFilterSummary,
    optionalTeamContext,
    loading,
    error,
    selectedProspectId,
    selectedRow,
    load,
    setSelectedProspectId
  };
});