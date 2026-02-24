// src/modules/draft-analysis/composables/useDraftPattern.ts
import { computed } from 'vue';
import { useDraftAnalysisStore } from '../stores/draft-analysis.store';
import { PositionGroup } from '../types/analyze-pattern.types';

export function useDraftPattern() {
  const store = useDraftAnalysisStore();

  const getCompetencyColor = (competency: string): string => {
    switch (competency) {
      case 'Elite': return 'success';
      case 'Good': return 'info';
      case 'Average': return 'warning';
      case 'Poor': return 'danger';
      case 'Terrible': return 'danger';
      default: return 'secondary';
    }
  };

  const getCompetencySeverity = (competency: string) => {
    switch (competency) {
      case 'Elite': return 'success';
      case 'Good': return 'info';
      case 'Average': return 'warning';
      case 'Poor': return 'danger';
      case 'Terrible': return 'danger';
      default: return 'secondary';
    }
  };

  const formatSuccessRate = (rate: number): string => {
    return `${rate.toFixed(1)}%`;
  };

  const getPositionIcon = (position: PositionGroup): string => {
    const icons: Record<string, string> = {
      QB: 'pi-users',
      OL: 'pi-shield',
      DL: 'pi-shield',
      WR: 'pi-bolt',
      RB: 'pi-directions',
      TE: 'pi-users',
      LB: 'pi-shield',
      DB: 'pi-shield',
      ST: 'pi-star'
    };
    return icons[position] || 'pi-circle';
  };

  const isStrongPosition = (position: PositionGroup): boolean => {
    return store.bestPositions.includes(position);
  };

  const isWeakPosition = (position: PositionGroup): boolean => {
    return store.worstPositions.includes(position);
  };

  return {
    // Store state
    pattern: computed(() => store.currentPattern),
    loading: computed(() => store.loading),
    error: computed(() => store.error),
    sortedMetrics: computed(() => store.sortedMetrics),
    bestPositions: computed(() => store.bestPositions),
    worstPositions: computed(() => store.worstPositions),
    
    // Store actions
    analyzePattern: store.analyzeTeamPattern,
    loadPattern: store.loadTeamPattern,
    clearPattern: store.clearPattern,
    
    // Utility functions
    getCompetencyColor,
    getCompetencySeverity,
    formatSuccessRate,
    getPositionIcon,
    isStrongPosition,
    isWeakPosition
  };
}