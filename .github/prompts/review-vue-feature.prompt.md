---
name: review-vue-feature
description: Review a DraftProAnalytics Vue feature for architecture, typing, RBAC, API usage, and UI workflow gaps.
agent: ask
argument-hint: "feature/module or selected files"
---

Review the selected DraftProAnalytics client feature.

Check for:

- Vue 3 Composition API usage and `<script setup lang="ts">`.
- Strict TypeScript with no `any`.
- Proper Pinia usage instead of brittle event chains.
- PrimeVue consistency.
- API DTO typing and Axios wrapper usage.
- RBAC route metadata and permission-driven navigation.
- Thin components and reusable composables.
- Ubiquitous Language in naming.
- Loading, empty, error, unauthorized, and validation states.
- Missing imports, broken route wiring, broken nav wiring, and likely build errors.

Return a prioritized fix list first, then provide concrete code patches for the highest-value fixes.
