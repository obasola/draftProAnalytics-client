---
name: create-vue-module
description: Scaffold or extend a DraftProAnalytics Vue module using DDD client conventions.
agent: agent
argument-hint: "module=<moduleName> feature=<featureName> routes=<routes>"
---

Create or extend a DraftProAnalytics client module.

Follow these instructions:

- Use Vue 3 Composition API with `<script setup lang="ts">`.
- Use strict TypeScript and never use `any`.
- Use PrimeVue and PrimeIcons.
- Use Pinia for shared workflow state.
- Use Axios through the existing API client abstraction.
- Use route metadata for RBAC: `meta: { domain: '<DOMAIN_CODE>', action: '<ACTION_CODE>' }`.
- Use Ubiquitous Language in models, methods, stores, and variables.
- Use a module structure under `src/modules/<moduleName>/` with domain, application, infrastructure, and presentation folders.
- Include complete file paths, full code, route wiring, nav wiring, and manual test steps.

Before writing code, inspect the existing module patterns in the workspace and align with them. If a requested route or backend endpoint does not exist in the codebase, clearly mark it as an assumption and provide the expected endpoint contract.
