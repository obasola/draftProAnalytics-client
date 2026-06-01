---
applyTo: "src/**/*.{ts,vue}"
---

# DraftProAnalytics Client Logging Instructions

## Logger Overview

Use the global logging service at `src/util/Logger.ts` for all observability. This replaces all `console.log`, `console.debug`, `console.warn`, and `console.error` calls.

## Logger API

### Import

**In composables, services, and utils:**
```typescript
import { createLogger } from '@/util/Logger';
```

**Using the default logger:**
```typescript
import { logger } from '@/util/Logger';
```

### Usage

Create a module-specific logger with a descriptive prefix:
```typescript
const logger = createLogger('ComponentName');

logger.debug('Detailed diagnostic info');
logger.info('General informational message');
logger.warn('Warning condition');
logger.error('Error or failure message');
```

### Log Levels

- **debug**: Detailed diagnostic information (env var `VITE_LOG_LEVEL=debug`). Use for:
  - Component lifecycle events (mounted, updated, destroyed)
  - Computed property evaluations
  - Watcher triggers
  - API request details
  - Form validation details
  - Disabled by default in production

- **info**: Informational messages for normal operation. Use for:
  - Component user actions (e.g., `info('User clicked import button')`)
  - Successful API calls (e.g., `info('Teams loaded successfully', { count: 5 })`)
  - Navigation events
  - Dialog open/close
  - State updates

- **warn**: Warning conditions that don't stop execution. Use for:
  - Deprecated component/API usage
  - Missing optional data (e.g., `warn('Team logo not found; using default')`)
  - Retry attempts
  - Unexpected but recoverable conditions

- **error**: Error or failure messages. Use for:
  - Caught exceptions in try/catch
  - Failed API calls (e.g., `error('Failed to fetch teams', error)`)
  - Form validation errors
  - Permission denied scenarios

## Configuration

Logging is controlled by environment variables in `.env` or `.env.local`:

| Variable | Default | Example |
|----------|---------|---------|
| `VITE_ENABLE_DEBUG` | `false` | `VITE_ENABLE_DEBUG=true` enables all levels |
| `VITE_LOG_LEVEL` | `'debug'` | `VITE_LOG_LEVEL=info` \| `warn` \| `error` |

Timestamp and level are automatically added to all messages.

## Conventions

### Module Logger Creation

Create a logger near the top of each file using a descriptive module name (usually the component or service name):

**In Vue components:**
```typescript
<script setup lang="ts">
import { createLogger } from '@/util/Logger';

const logger = createLogger('DashboardView');

const fetchData = async () => {
  logger.debug('Starting data fetch');
  try {
    const response = await api.getData();
    logger.info('Data fetched successfully', response);
  } catch (error) {
    logger.error('Failed to fetch data', error);
  }
};
</script>
```

**In services:**
```typescript
import { createLogger } from '@/util/Logger';

const logger = createLogger('TeamService');

export class TeamService {
  async getTeams() {
    logger.debug('Fetching teams');
    // ... implementation
    logger.info('Successfully retrieved teams', { count: teams.length });
  }
}
```

**In composables:**
```typescript
import { createLogger } from '@/util/Logger';

const logger = createLogger('useDraftPickScraper');

export const useDraftPickScraper = () => {
  const scrape = async () => {
    logger.info('Starting draft pick scrape');
    try {
      // ... scraping logic
      logger.info('Scrape completed', { count });
    } catch (error) {
      logger.error('Scrape failed', error);
    }
  };

  return { scrape };
};
```

### Naming Conventions for Logger Prefixes

Use PascalCase for components/services, or camelCase prefixed with `use` for composables:
- `createLogger('DashboardView')`
- `createLogger('TeamService')`
- `createLogger('useDraftPickScraper')`
- `createLogger('useJobPolling')`
- `createLogger('ProspectCard')`

### Logging at Boundaries

Log at key interaction points and state transitions:

1. **Component Lifecycle**
   ```typescript
   onMounted(() => {
     logger.debug('Component mounted');
     fetchData();
   });

   onBeforeUnmount(() => {
     logger.debug('Component unmounting');
     cleanup();
   });
   ```

2. **User Actions**
   ```typescript
   const handleImport = async () => {
     logger.info('User initiated import');
     try {
       await importService.execute(data);
       logger.info('Import completed successfully');
     } catch (error) {
       logger.error('Import failed', error);
     }
   };
   ```

3. **API Calls**
   ```typescript
   const loadTeams = async () => {
     logger.debug('Fetching teams from API');
     try {
       const response = await api.teams.list();
       logger.info('Teams loaded', { count: response.length });
       teams.value = response;
     } catch (error) {
       logger.error('Failed to load teams', error);
     }
   };
   ```

4. **State Changes**
   ```typescript
   const updateFilter = (filter: Filter) => {
     logger.info('Filter changed', { filter });
     draftStore.setFilter(filter);
   };
   ```

5. **Navigation & Route Changes**
   ```typescript
   watch(
     () => route.query.teamId,
     (newTeamId) => {
       logger.info('Team selection changed', { teamId: newTeamId });
       loadTeamData(newTeamId);
     }
   );
   ```

6. **Permission & Access Changes**
   ```typescript
   watch(
     () => accessStore.can('DRAFT', 'EDIT'),
     (canEdit) => {
       logger.info('Draft edit permission changed', { canEdit });
     }
   );
   ```

### What NOT to Log

- ❌ User passwords or tokens
- ❌ Full API response bodies (log summaries or key fields instead)
- ❌ Personally identifiable information (PII) beyond userId
- ❌ Verbose repetitive data (e.g., every array item in a loop)
- ❌ Sensitive form data

**✅ Instead, log strategically:**
```typescript
// ❌ Too verbose
logger.info('API response', response);

// ✅ Summarized
logger.info('Teams API response received', { count: response.length, status: 200 });
```

### Migration Path

Replace all existing console calls in Vue components and services:
```typescript
// ❌ Do not use console directly
console.log('Loading teams...');
console.error('Failed:', error);

// ✅ Use the logger
logger.info('Loading teams...');
logger.error('Failed to load teams', error);
```

## Examples

### Vue Component with Data Fetching
```typescript
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { createLogger } from '@/util/Logger';

const logger = createLogger('TeamsView');

const teams = ref([]);
const loading = ref(false);
const error = ref(null);

const fetchTeams = async () => {
  logger.debug('Starting teams fetch');
  loading.value = true;

  try {
    const response = await api.teams.getAll();
    logger.info('Teams fetched successfully', { count: response.length });
    teams.value = response;
  } catch (err) {
    logger.error('Failed to fetch teams', err);
    error.value = err;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  logger.debug('TeamsView mounted');
  fetchTeams();
});
</script>
```

### Service with Business Logic
```typescript
import { createLogger } from '@/util/Logger';

const logger = createLogger('DraftImportService');

export const useDraftImportService = () => {
  const importDraftPicks = async (file: File) => {
    logger.info('Starting draft pick import', { fileName: file.name });

    try {
      const picks = await parseFile(file);
      logger.debug(`Parsed ${picks.length} picks from file`);

      const result = await api.draft.importPicks(picks);
      logger.info('Draft picks imported successfully', { 
        imported: result.count,
        errors: result.errors.length 
      });

      return result;
    } catch (error) {
      logger.error('Draft import failed', error);
      throw error;
    }
  };

  return { importDraftPicks };
};
```

### Composable with Polling
```typescript
import { createLogger } from '@/util/Logger';

const logger = createLogger('useJobPolling');

export const useJobPolling = (jobId: string) => {
  let pollCount = 0;

  const poll = async () => {
    pollCount++;
    logger.debug(`Poll #${pollCount} for job ${jobId}`);

    try {
      const job = await api.jobs.get(jobId);
      
      if (job.status === 'completed') {
        logger.info('Job completed', { jobId, pollCount, result: job.result });
        return job;
      }

      if (job.status === 'failed') {
        logger.warn(`Job failed after ${pollCount} polls`, { jobId, error: job.error });
        throw new Error(job.error);
      }

      logger.debug('Job still in progress', { jobId, status: job.status });
    } catch (error) {
      logger.error('Poll failed', error);
      throw error;
    }
  };

  return { poll };
};
```

### Component with Error Handling
```typescript
<script setup lang="ts">
import { createLogger } from '@/util/Logger';

const logger = createLogger('DraftSelectionCard');

const props = defineProps<{ pick: DraftPick }>();

const handleMarkPicked = async () => {
  logger.info('Marking pick as selected', { pickId: props.pick.id });

  try {
    await draftStore.markPickOnClock(props.pick.id);
    logger.info('Pick marked successfully');
  } catch (error) {
    logger.error('Failed to mark pick', error);
    showErrorNotification('Failed to mark pick');
  }
};
</script>
```
