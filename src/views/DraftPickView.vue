<template>
  <div class="draftpick-wrapper">
    <section class="view-body">
      <DraftPickList />
    </section>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import DraftPickList from '@/components/draftPick/DraftPickList.vue'
</script>

<style scoped>
.draftpick-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: var(--content-bg);
  color: var(--text-color);
}

.view-header {
  flex-shrink: 0;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--surface-border);
  background-color: var(--surface-card);
}

.view-header h1 {
  margin: 0.5rem 0 0 0;
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-color);
}

.breadcrumb {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}

.breadcrumb-link {
  color: var(--link-color, #007bff);
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-link:hover {
  color: var(--brand-gold);
  text-decoration: underline;
}

.breadcrumb-separator {
  margin: 0 0.5rem;
  color: var(--text-color-secondary);
}

.breadcrumb-current {
  color: var(--text-color);
  font-weight: 500;
}

.view-body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.5rem;
  box-sizing: border-box;
  background-color: var(--content-bg);
}
</style>
