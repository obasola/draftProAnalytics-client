---
applyTo: "src/**/*.{ts,vue}"
---

# DraftProAnalytics Client API Instructions

- Use Axios through the existing API client abstraction.
- Do not call `fetch` directly for application API requests.
- Put module API clients under `src/modules/<moduleName>/infrastructure/api` unless an existing module pattern differs.
- Define request DTOs and response DTOs for every endpoint.
- Keep API DTOs separate from form models when the UI needs extra state.
- Convert API DTOs to domain or view models through mappers when the shape is non-trivial.
- Keep `/api` as the default API prefix.
- Handle `401`, `403`, `404`, validation errors, and server errors deliberately.
- Preserve typed error handling; use `unknown` and narrow Axios errors safely.
