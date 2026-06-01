---
applyTo: "src/**/*.{ts,vue}"
---

# DraftProAnalytics Client Environment Management Instructions

## Environment File Structure

Use environment-specific `.env` files to manage configuration across different deployment environments:

```
.env.development    # Local development
.env.stage          # Staging/testing environment
.env.production     # Production environment
.env.example        # Template (committed to git)
```

## Environment Loading Priority

Vite loads environment files in this order (later files override earlier ones):
1. `.env` (base configuration)
2. `.env.local` (local overrides, never committed)
3. `.env.[mode]` (environment-specific, e.g., `.env.development`)
4. `.env.[mode].local` (environment-specific local overrides, never committed)

## Variable Naming Conventions

### Client-Side Variables (VITE_ prefix required)

All client-accessible variables must be prefixed with `VITE_` to be exposed to the browser:

```bash
# ✅ Correct - Available in browser
VITE_API_BASE_URL=https://api.draftproanalytics.com/api
VITE_APP_TITLE="NFL DraftPro Analytics"
VITE_ENABLE_DEBUG=true
VITE_LOG_LEVEL=info

# ❌ Incorrect - Not available in browser
API_BASE_URL=https://api.draftproanalytics.com/api
DATABASE_URL=mysql://...
JWT_SECRET=secret123
```

### Environment-Specific Examples

**Development (.env.development):**
```bash
VITE_APP_TITLE="NFL DraftPro Analytics (Dev)"
VITE_API_BASE_URL=http://localhost:3000/api
VITE_ENV_MODE=development
VITE_ENABLE_DEBUG=true
VITE_LOG_LEVEL=debug
VITE_JOBS_REFRESH_MS=5000
VITE_JOBS_AUTO_REFRESH=false
```

**Staging (.env.stage):**
```bash
VITE_APP_TITLE="NFL DraftPro Analytics (Stage)"
VITE_API_BASE_URL=https://api-stage.draftproanalytics.com/api
VITE_ENV_MODE=staging
VITE_ENABLE_DEBUG=false
VITE_LOG_LEVEL=warn
VITE_JOBS_REFRESH_MS=10000
VITE_JOBS_AUTO_REFRESH=true
```

**Production (.env.production):**
```bash
VITE_APP_TITLE="NFL DraftPro Analytics"
VITE_API_BASE_URL=https://api.draftproanalytics.com/api
VITE_ENV_MODE=production
VITE_ENABLE_DEBUG=false
VITE_LOG_LEVEL=error
VITE_JOBS_REFRESH_MS=30000
VITE_JOBS_AUTO_REFRESH=true
```

## Accessing Environment Variables

### In Vue Components
```typescript
<script setup lang="ts">
// Access via import.meta.env
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const appTitle = import.meta.env.VITE_APP_TITLE;
const isDevelopment = import.meta.env.VITE_ENV_MODE === 'development';

// Use in templates
</script>

<template>
  <h1>{{ appTitle }}</h1>
  <div v-if="isDevelopment" class="dev-banner">Development Mode</div>
</template>
```

### In Composables
```typescript
import { createLogger } from '@/util/Logger';

const logger = createLogger('useApiClient');

export const useApiClient = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const isDevelopment = import.meta.env.VITE_ENV_MODE === 'development';

  const apiClient = axios.create({
    baseURL: baseUrl,
    timeout: isDevelopment ? 10000 : 5000,
  });

  return { apiClient };
};
```

### In Services
```typescript
import { createLogger } from '@/util/Logger';

const logger = createLogger('TeamService');

export class TeamService {
  private baseUrl = import.meta.env.VITE_API_BASE_URL;

  async getTeams() {
    logger.debug(`Fetching teams from ${this.baseUrl}`);
    // ... implementation
  }
}
```

## Build-Time vs Runtime Variables

### Build-Time Variables (VITE_ prefix)
- Available at build time
- Can be used for conditional compilation
- Exposed to browser bundle
- **Never include secrets**

```typescript
// ✅ OK for build-time
const featureFlags = {
  enableDebugTools: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  showDevBanner: import.meta.env.VITE_ENV_MODE === 'development',
};
```

### Runtime Variables (No VITE_ prefix)
- **Not exposed to browser**
- Used for server-side configuration
- Include sensitive data (API keys, secrets)
- Available only in Node.js build process

```typescript
// ❌ This won't work in browser
const apiKey = import.meta.env.PRIVATE_API_KEY; // undefined in browser
```

## Security Considerations

### Never Commit Secrets
```bash
# ❌ Never commit these to git
VITE_STRIPE_SECRET_KEY=sk_live_...
DATABASE_PASSWORD=secret123
JWT_SECRET=supersecret

# ✅ Instead, use placeholders in .env.example
VITE_STRIPE_SECRET_KEY=your_stripe_secret_here
DATABASE_PASSWORD=your_db_password_here
JWT_SECRET=your_jwt_secret_here
```

### Environment Variable Validation
```typescript
// Validate required environment variables
const requiredEnvVars = [
  'VITE_API_BASE_URL',
  'VITE_APP_TITLE',
];

for (const envVar of requiredEnvVars) {
  if (!import.meta.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
```

## Common Environment Variables

### API Configuration
```bash
VITE_API_BASE_URL=https://api.draftproanalytics.com/api
VITE_API_TIMEOUT=5000
VITE_API_RETRIES=3
```

### Feature Flags
```bash
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true
VITE_ENABLE_BETA_FEATURES=false
```

### UI Configuration
```bash
VITE_APP_TITLE="NFL DraftPro Analytics"
VITE_DEFAULT_TEAM=patriots
VITE_THEME=dark
VITE_LOCALE=en-US
```

### Performance & Polling
```bash
VITE_JOBS_REFRESH_MS=30000
VITE_JOBS_AUTO_REFRESH=true
VITE_CACHE_TTL_MINUTES=5
```

## Development Workflow

### Setting Up Local Environment
```bash
# 1. Copy the example file
cp .env.example .env.development

# 2. Edit with your local settings
# VITE_API_BASE_URL=http://localhost:3000/api
# VITE_ENABLE_DEBUG=true

# 3. Start development server (automatically loads .env.development)
npm run dev
```

### Switching Environments
```bash
# Development
npm run dev

# Staging build
npm run build -- --mode stage

# Production build
npm run build -- --mode production
```

### Local Overrides
```bash
# Create .env.local for personal overrides (never committed)
echo "VITE_ENABLE_DEBUG=true" > .env.local
echo "VITE_LOG_LEVEL=debug" >> .env.local
```

## Build Configuration

### vite.config.ts
```typescript
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // Use environment variables in build config
    base: env.VITE_BASE_URL || '/',
    server: {
      port: parseInt(env.VITE_DEV_PORT) || 5173,
    },
  };
});
```

## Testing Environment Variables

### Unit Tests
```typescript
import { describe, it, expect, vi } from 'vitest';

// Mock environment variables
vi.mock('import.meta.env', () => ({
  VITE_API_BASE_URL: 'http://test-api.com',
  VITE_ENV_MODE: 'test',
}));

describe('API Client', () => {
  it('uses correct base URL', () => {
    const client = createApiClient();
    expect(client.defaults.baseURL).toBe('http://test-api.com');
  });
});
```

### Component Tests
```typescript
import { mount } from '@vue/test-utils';

// Mock environment in component tests
vi.mock('import.meta.env', () => ({
  VITE_APP_TITLE: 'Test App',
  VITE_ENV_MODE: 'test',
}));

it('displays app title', () => {
  const wrapper = mount(App);
  expect(wrapper.text()).toContain('Test App');
});
```

## Troubleshooting

### Variable Not Available
- Check if variable has `VITE_` prefix
- Verify `.env` file exists and is in correct location
- Restart development server after adding new variables
- Check for typos in variable names

### Wrong Environment Loaded
- Verify `npm run dev` vs `npm run build -- --mode production`
- Check file loading priority order
- Use `.env.local` for local overrides

### Build-Time Issues
- Environment variables are static at build time
- Cannot change variables without rebuilding
- Use runtime configuration for dynamic values

## Migration from Hardcoded Values

Replace hardcoded values with environment variables:

```typescript
// ❌ Before
const API_URL = 'http://localhost:3000/api';
const APP_TITLE = 'DraftPro Analytics';

// ✅ After
const API_URL = import.meta.env.VITE_API_BASE_URL;
const APP_TITLE = import.meta.env.VITE_APP_TITLE;
```
