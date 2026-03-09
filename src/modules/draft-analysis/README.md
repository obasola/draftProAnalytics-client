# Draft Analysis Module - Client

Frontend implementation using Vue 3, TypeScript, and PrimeVue.

## Structure
```
draft-analysis/
├── api/            # API service layer
├── types/          # TypeScript type definitions
├── stores/         # Pinia state management
├── composables/    # Reusable composition functions
├── components/     # Vue components
├── views/          # Page views
└── routes/         # Route definitions
```

## Key Components

### DraftPatternAnalysis.vue
Displays historical draft patterns by position with success rates, competency levels, and system bias indicators.

### DraftPrediction.vue
Predicts likely draft selections based on team needs and historical patterns.

### LiveDraftTracker.vue
Real-time tracking and grading of draft picks as they happen.

### DraftReport.vue
Comprehensive draft class analysis with charts and breakdowns.

## Setup

1. Import module in main app
2. Register routes in router
3. Configure API base URL
4. Add to navigation menu

## Usage
```vue
<script setup>
import { DraftAnalysisView } from '@/modules/draft-analysis';
</script>

<template>
  <DraftAnalysisView />
</template>
```

## Store
```typescript
import { useDraftAnalysisStore } from '@/modules/draft-analysis';

const store = useDraftAnalysisStore();
await store.loadTeamPattern('KC');
```
