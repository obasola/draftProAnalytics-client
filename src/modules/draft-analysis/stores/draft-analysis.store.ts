// src/modules/draft-analysis/stores/draft-analysis.store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { draftAnalysisApi } from '../api/draft-analysis.api';
import type {
  AnalyzeTeamDraftPatternResponseDto,
  PositionMetricsDto
} from '../types/analyze-pattern.types';
import type {
  PredictDraftSelectionResponseDto
} from '../types/predict-selection.types';
import type {
  GradeDraftPickResponseDto,
  DraftGradeDto
} from '../types/grade-pick.types';
import type {
  DraftReportResponseDto,
  LiveDraftPickDto,
  TrackLiveDraftPickRequestDto,
  GetTeamPicksResponseDto
} from '../types/draft-tracker.types';

// Internal state type for current grade
interface CurrentGradeState {
  teamId: number;
  playerName: string;
  position: string;
  round: number;
  pick: number;
  grade: DraftGradeDto;
  teamPattern: {
    generalManager: string;
    headCoach: string;
    overallSuccessRate: number;
  };
  positionMetrics: {
    position: string;
    totalPicks: number;
    successRate: number;
    competencyLevel: string;
    systemFitBias: boolean;
  };
}

export const useDraftAnalysisStore = defineStore('draftAnalysis', () => {
  // State
  const currentPattern = ref<AnalyzeTeamDraftPatternResponseDto | null>(null);
  const currentPrediction = ref<PredictDraftSelectionResponseDto | null>(null);
  const currentGrade = ref<CurrentGradeState | null>(null);
  const currentReport = ref<DraftReportResponseDto | null>(null);
  const teamPicks = ref<LiveDraftPickDto[]>([]);
  const allDraftPicks = ref<LiveDraftPickDto[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // Computed
  const hasPattern = computed((): boolean => currentPattern.value !== null);

  const bestPositions = computed((): PositionMetricsDto[] => {
    if (!currentPattern.value) return [];
    return currentPattern.value.positionMetrics
      .filter((metric: PositionMetricsDto) => metric.successRate >= 50)
      .sort((a: PositionMetricsDto, b: PositionMetricsDto) => b.successRate - a.successRate);
  });

  const worstPositions = computed((): PositionMetricsDto[] => {
    if (!currentPattern.value) return [];
    return currentPattern.value.positionMetrics
      .filter((metric: PositionMetricsDto) => metric.successRate < 30)
      .sort((a: PositionMetricsDto, b: PositionMetricsDto) => a.successRate - b.successRate);
  });

  const sortedMetrics = computed((): PositionMetricsDto[] => {
    if (!currentPattern.value) return [];
    return [...currentPattern.value.positionMetrics]
      .sort((a: PositionMetricsDto, b: PositionMetricsDto) => b.successRate - a.successRate);
  });

  const topPredictions = computed(() => {
    if (!currentPrediction.value) return [];
    return currentPrediction.value.predictions.slice(0, 3);
  });

  const gradeColor = computed((): string => {
    if (!currentGrade.value) return '#6b7280';
    const grade = currentGrade.value.grade.grade;
    
    switch (grade) {
      case 'A+':
      case 'A':
        return '#22c55e';
      case 'B':
        return '#3b82f6';
      case 'C':
        return '#eab308';
      case 'D':
        return '#f97316';
      case 'F':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  });

  const completedPicks = computed((): LiveDraftPickDto[] => 
    teamPicks.value.filter((p: LiveDraftPickDto) => p.status === 'completed')
  );

  const averageTeamGrade = computed((): number => {
    const completed = completedPicks.value;
    if (completed.length === 0) return 0;
    
    const total = completed.reduce((sum: number, p: LiveDraftPickDto) => 
      sum + (p.grade?.score || 0), 0
    );
    return total / completed.length;
  });

  // Actions
  async function analyzeTeamPattern(
    teamId: string,
    regimeStartYear: number,
    generalManager: string,
    headCoach: string
  ): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const response = await draftAnalysisApi.analyzePattern({ 
        teamId, 
        regimeStartYear,
        generalManager,
        headCoach
      });
      currentPattern.value = response;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to analyze pattern';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function loadTeamPattern(teamId: string): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      currentPattern.value = await draftAnalysisApi.getPattern(parseInt(teamId));
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load pattern';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function predictDraftSelection(
    teamId: string,
    year: number,
    round: number,
    pick: number
  ): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      currentPrediction.value = await draftAnalysisApi.predictSelection({
        teamId: parseInt(teamId),
        year,
        round,
        pick
      });
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to predict selection';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function gradePickInRealTime(data: {
    teamId: string;
    year: number;
    round: number;
    pick: number;
    position: string;
    consensusRanking: number;
    playerName: string;
  }): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const result = await draftAnalysisApi.gradePick({
        teamId: parseInt(data.teamId, 10),
        year: data.year,
        round: data.round,
        pick: data.pick,
        position: data.position,
        consensusRanking: data.consensusRanking
      });

      currentGrade.value = {
        teamId: parseInt(data.teamId, 10),
        playerName: data.playerName,
        position: data.position,
        round: data.round,
        pick: data.pick,
        grade: result.grade,
        teamPattern: result.teamPattern,
        positionMetrics: result.positionMetrics
      };
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to grade pick';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function loadDraftReport(teamId: number, year: number): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      currentReport.value = await draftAnalysisApi.getDraftReport(teamId, year);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load report';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function loadTeamPicks(teamId: string, year: number): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const response: GetTeamPicksResponseDto = await draftAnalysisApi.getTeamPicks(
        parseInt(teamId, 10), 
        year
      );
      teamPicks.value = response.picks;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load team picks';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function trackLivePick(data: TrackLiveDraftPickRequestDto): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      await draftAnalysisApi.trackPick(data);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to track pick';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function loadAllDraftPicks(year: number): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const response = await draftAnalysisApi.getAllPicks(year);
      allDraftPicks.value = response.picks;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load all picks';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function clearPattern(): void {
    currentPattern.value = null;
  }

  function clearPrediction(): void {
    currentPrediction.value = null;
  }

  function clearGrade(): void {
    currentGrade.value = null;
  }

  function clearReport(): void {
    currentReport.value = null;
  }

  function clearAll(): void {
    currentPattern.value = null;
    currentPrediction.value = null;
    currentGrade.value = null;
    currentReport.value = null;
    teamPicks.value = [];
    allDraftPicks.value = [];
    error.value = null;
  }

  return {
    // State
    currentPattern,
    currentPrediction,
    currentGrade,
    currentReport,
    teamPicks,
    allDraftPicks,
    loading,
    error,

    // Computed
    hasPattern,
    bestPositions,
    worstPositions,
    sortedMetrics,
    topPredictions,
    gradeColor,
    completedPicks,
    averageTeamGrade,

    // Actions
    analyzeTeamPattern,
    loadTeamPattern,
    predictDraftSelection,
    gradePickInRealTime,
    loadDraftReport,
    loadTeamPicks,
    trackLivePick,
    loadAllDraftPicks,
    clearPattern,
    clearPrediction,
    clearGrade,
    clearReport,
    clearAll
  };
});