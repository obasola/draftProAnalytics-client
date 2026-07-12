---
applyTo: "src/**/*.{ts,vue}"
---

# DraftProAnalytics Client RBAC Instructions

- Enforce UI access through permissions, not hard-coded role names.
- Use route metadata in this shape: `meta: { domain: '<DOMAIN_CODE>', action: '<ACTION_CODE>' }`.
- Use the centralized router guard for route enforcement.
- Use a permission helper such as `can(domainCode, actionCode)` for navigation visibility and conditional UI actions.
- Recognize permission actions: `VIEW`, `EDIT`, `CREATE`, `DELETE`, and `RUN`.
- Treat `EDIT` as implying `VIEW` only if the backend/access context already exposes that effective permission.
- Do not duplicate permission matrices in Vue components.
- Disable or hide protected buttons based on permission checks; do not rely on backend errors as the primary UX.
- Keep unauthorized, unauthenticated, loading, and access-context-not-loaded states separate.
