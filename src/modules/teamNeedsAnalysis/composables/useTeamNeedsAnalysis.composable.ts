// src/composables/useTeamNeedsAnalysis.ts

import { computed } from 'vue';
import { useTeamNeedsAnalysisStore } from '../store/teamNeedsAnalysis.store';
import {
  getNeedSeverity,
  getSeverityColor,
  getSeverityBadgeClass,
  type NeedSeverity,
  type TeamNeedsAnalysisDto,
  type PositionNeedDto,
} from '../types/teamNeedsAnalysis.types';

export function useTeamNeedsAnalysis() {
  const store = useTeamNeedsAnalysisStore();

  // Computed properties
  const isLoading = computed(() => store.loading);
  const hasError = computed(() => !!store.error);
  const errorMessage = computed(() => store.error);
  const currentYear = computed(() => store.currentSeasonYear);
  const hasData = computed(() => store.hasData);

  // Helper functions
  function getSeverityForScore(score: number): NeedSeverity {
    return getNeedSeverity(score);
  }

  function getSeverityColorClass(score: number): string {
    return getSeverityColor(getNeedSeverity(score));
  }

  function getSeverityBadge(score: number): string {
    return getSeverityBadgeClass(getNeedSeverity(score));
  }

  function getPrioritySeverity(priority: number): 'danger' | 'warning' | 'info' | 'success' {
    if (priority >= 9) return 'danger';
    if (priority >= 7) return 'warning';
    if (priority >= 5) return 'info';
    return 'success';
  }

  function formatAnalysisDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  function formatAnalysisDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Position need analysis
  function getCriticalNeeds(needs: PositionNeedDto[]): PositionNeedDto[] {
    return needs.filter(need => need.priority >= 8);
  }

  function getHighPriorityNeeds(needs: PositionNeedDto[]): PositionNeedDto[] {
    return needs.filter(need => need.priority >= 6 && need.priority < 8);
  }

  function getMediumPriorityNeeds(needs: PositionNeedDto[]): PositionNeedDto[] {
    return needs.filter(need => need.priority >= 4 && need.priority < 6);
  }

  function getLowPriorityNeeds(needs: PositionNeedDto[]): PositionNeedDto[] {
    return needs.filter(need => need.priority < 4);
  }

  function sortNeedsByPriority(needs: PositionNeedDto[]): PositionNeedDto[] {
    return [...needs].sort((a, b) => b.priority - a.priority);
  }

  function sortNeedsByScore(needs: PositionNeedDto[]): PositionNeedDto[] {
    return [...needs].sort((a, b) => b.needScore - a.needScore);
  }

  // Position group analysis
  function groupNeedsByPosition(needs: PositionNeedDto[]): Map<string, PositionNeedDto[]> {
    const grouped = new Map<string, PositionNeedDto[]>();
    
    needs.forEach(need => {
      const existing = grouped.get(need.positionGroup) || [];
      existing.push(need);
      grouped.set(need.positionGroup, existing);
    });
    
    return grouped;
  }

  function calculatePositionGroupAverages(needs: PositionNeedDto[]) {
    const grouped = groupNeedsByPosition(needs);
    const result = new Map<string, { avgScore: number; avgPriority: number; count: number }>();
    
    grouped.forEach((groupNeeds, group) => {
      const avgScore = groupNeeds.reduce((sum, n) => sum + n.needScore, 0) / groupNeeds.length;
      const avgPriority = groupNeeds.reduce((sum, n) => sum + n.priority, 0) / groupNeeds.length;
      
      result.set(group, {
        avgScore: Math.round(avgScore),
        avgPriority: Math.round(avgPriority * 10) / 10,
        count: groupNeeds.length,
      });
    });
    
    return result;
  }

  // Export functions
  return {
    // Store state
    store,
    isLoading,
    hasError,
    errorMessage,
    currentYear,
    hasData,
    
    // Severity helpers
    getSeverityForScore,
    getSeverityColorClass,
    getSeverityBadge,
    getPrioritySeverity,
    
    // Formatting
    formatAnalysisDate,
    formatAnalysisDateTime,
    
    // Position need filters
    getCriticalNeeds,
    getHighPriorityNeeds,
    getMediumPriorityNeeds,
    getLowPriorityNeeds,
    sortNeedsByPriority,
    sortNeedsByScore,
    
    // Position group analysis
    groupNeedsByPosition,
    calculatePositionGroupAverages,
  };
}