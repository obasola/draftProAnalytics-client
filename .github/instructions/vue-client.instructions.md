---
applyTo: "**/*.{vue,ts}"
---

# Vue Client Instructions

- Use Vue 3 Composition API only.
- Use `<script setup lang="ts">` in Vue SFCs.
- Use strict TypeScript and never use `any`.
- Use explicit DTOs, interfaces, and return types.
- Use PrimeVue components for UI consistency.
- Use Pinia for shared state, workflow state, and cross-component coordination.
- Use composables for reusable presentation workflow logic.
- Keep components thin and readable.
- Keep domain terms in component names, variable names, method names, route names, and store action names.
- Prefer business actions such as `seedDraftPicks`, `assumeRole`, `evaluateProspect`, or `syncCollegeProspects` over generic names such as `createItem`, `updateData`, or `handleSubmit` when the domain behavior is known.
- Use scoped styles in SFCs.
- Include all imports and avoid pseudo-code unless explicitly asked for a sketch.
