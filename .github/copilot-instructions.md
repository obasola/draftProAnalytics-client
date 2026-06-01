# DraftProAnalytics Client — Copilot Workspace Instructions

These instructions apply to the DraftProAnalytics frontend workspace.

## Project identity

- Treat this repository as the DraftProAnalytics client app.
- Use Vue 3 Composition API only.
- Use `<script setup lang="ts">` for every Vue single-file component.
- Use strict TypeScript. Do not use `any`; use explicit interfaces, DTOs, discriminated unions, generics, or `unknown` with narrowing.
- Use PrimeVue and PrimeIcons for UI.
- Use Pinia for all shared state and workflow state.
- Use Vue Router for route-level navigation and authorization metadata.
- Use Axios through the project API client layer. Do not call `fetch` directly unless the project already has a specific wrapper for it.
- Use scoped CSS or SCSS in Vue components.
- Prefer composables for reusable UI/workflow behavior.

## Architecture

- Follow DDD, SOLID, and module-oriented design.
- Prefer module folders under `src/modules/<moduleName>/`.
- Keep components thin: components render UI, call composables/stores, and delegate business workflows to services/composables.
- Avoid generic CRUD naming when the domain has better language. Use Ubiquitous Language from the feature domain.
- Name files and symbols after business behavior, not implementation mechanics.
- Favor vertical slices by feature/module over broad technical buckets.

## Client layering

Use this general shape unless existing code in the module clearly dictates otherwise:

```text
src/modules/<moduleName>/
  domain/
    models/
    valueObjects/
  application/
    dtos/
    mappers/
    services/
    useCases/
  infrastructure/
    api/
    repositories/
  presentation/
    components/
    views/
    composables/
    stores/
    routes/
```

## Vue component rules

- Use `defineProps`, `defineEmits`, `computed`, `ref`, `reactive`, `watch`, and lifecycle hooks with explicit types.
- Keep template logic readable; move complex logic into computed properties or composables.
- Keep forms typed with explicit form state interfaces.
- Use PrimeVue components consistently: `DataTable`, `Column`, `Dialog`, `Button`, `InputText`, `Dropdown`/`Select`, `Tabs`, `Panel`, `Toast`, and `ConfirmDialog` where appropriate.
- Do not use event chains for shared state between distant components; use Pinia stores or route state.
- Emit only local UI events from child components when parent ownership is clear.

## State management

- Use Pinia setup stores unless a module already uses options stores consistently.
- Store server DTOs and UI state separately when mixing them would create confusion.
- Expose typed actions for domain workflows, such as `loadDraftEvents`, `seedDraftPicks`, `markPickOnClock`, or `evaluateProspectFit`.
- Avoid direct mutation of store internals outside the store.
- Prefer clear loading/error state per workflow.

## API integration

- Use typed request and response DTOs for every API call.
- Keep base API concerns in the shared API client layer.
- Use `/api` as the server API prefix unless the existing environment config says otherwise.
- Prefer module-specific API clients in `infrastructure/api`.
- Handle `401`, `403`, and validation errors intentionally.
- Never hard-code production URLs in feature code.

## Routing and RBAC

- Use route metadata for permission requirements: `meta: { domain: '<DOMAIN_CODE>', action: '<ACTION_CODE>' }`.
- Enforce permissions through the existing centralized router guard.
- Filter navigation visibility using the access-control helper/store rather than role-name checks.
- Prefer permission checks like `can('PLAYERS', 'VIEW')` over brittle checks like `roleName === 'admin'`.
- Recognize `VIEW`, `EDIT`, `CREATE`, `DELETE`, and `RUN` as permission actions.

## Testing and validation

- When adding or changing a feature, include the expected manual test path.
- Prefer tests around stores, composables, mappers, and API clients when existing test infrastructure supports it.
- Validate route wiring, nav visibility, API calls, empty states, loading states, error states, and permission-denied states.

## Environment management

- Use `.env.development`, `.env.stage`, and `.env.production` files for environment-specific configuration.
- Prefix client-accessible variables with `VITE_` to expose them to the browser.
- Never commit secrets or sensitive data to version control.
- Use `.env.example` as a template for required environment variables.
- Access variables via `import.meta.env.VITE_VARIABLE_NAME` in client code.
- See [client-environment.instructions.md](.github/instructions/client-environment.instructions.md) for detailed environment management guidelines.

## Logging

- Use the global logger service at `src/util/Logger.ts` for all observability. Replace all `console.log`, `console.warn`, and `console.error` calls.
- Create module-specific loggers with `createLogger('ComponentName')` at the top of each file.
- Use log levels deliberately: `debug` for lifecycle/diagnostic detail, `info` for user actions/workflow events, `warn` for recoverable issues, `error` for failures.
- Log at architectural boundaries: component lifecycle, API calls, user actions, state transitions, and error contexts.
- Do not log passwords, tokens, sensitive credentials, or verbose repetitive data.
- Control logging via `VITE_ENABLE_DEBUG` and `VITE_LOG_LEVEL` environment variables.
- See [client-logging.instructions.md](.github/instructions/client-logging.instructions.md) for detailed examples and conventions.

## Output expectations for Copilot

- Provide complete files or patch-style diffs with exact paths.
- Include imports.
- Use strict return types.
- Do not omit integration steps.
- Do not invent unknown backend routes; align with existing route conventions or explicitly mark assumptions.
- When generating feature upgrades, include route wiring, nav wiring, and build/run guidance.
