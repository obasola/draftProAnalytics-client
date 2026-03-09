// src/modules/teamNeedsAnalysis/index.ts

/**
 * TeamNeedsAnalysis Module
 * 
 * Self-contained module for NFL Team Draft Needs Analysis
 * 
 * This module provides:
 * - State management (Pinia store)
 * - Type definitions
 * - Composable utilities
 * - Vue components (Dashboard & Detail views)
 * - Router configuration
 */

// Export store
export { useTeamNeedsAnalysisStore } from './store/teamNeedsAnalysis.store';

// Export types
export type {
  PositionNeedDto,
  TeamNeedsAnalysisDto,
  AllTeamsNeedsDto,
  TeamNeedsDataTableRow,
  PositionNeedsDataTableRow,
  GenerateTeamNeedsRequest,
  GenerateAllTeamsNeedsRequest,
  GetTeamNeedsRequest,
  ApiResponse,
  NeedSeverity,
  NeedScoreThresholds,
} from './types/teamNeedsAnalysis.types';

export {
  NEED_SCORE_THRESHOLDS,
  getNeedSeverity,
  getSeverityColor,
  getSeverityBadgeClass,
} from './types/teamNeedsAnalysis.types';

// Export composable
export { useTeamNeedsAnalysis } from './composables/useTeamNeedsAnalysis.composable';

// Export routes
export { teamNeedsAnalysisRoutes } from './router/routes';

// Export components (optional - usually imported via routes)
export { default as TeamNeedsDashboard } from './views/TeamNeedsDashboard.vue';
export { default as TeamNeedsDetail } from './views/TeamNeedsDetail.vue';