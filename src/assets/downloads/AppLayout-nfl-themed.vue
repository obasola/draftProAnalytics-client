<!-- AppLayout.vue — NFL Fan Theme -->
<script setup lang="ts">
import AppHeader from './AppHeader.vue'
import AppNavigation from './AppNavigation.vue'
import '@/assets/css/theme-nfl-fan.css'
</script>

<template>
  <div class="app-container theme-nfl">
    <AppHeader />
    <div class="main-content">
      <AppNavigation />
      <main class="content-area" role="main">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--body-bg);
  color: var(--text-on-dark);
}

.main-content {
  display: flex;
  flex: 1;
}

.content-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: var(--content-bg);
  color: var(--text-on-dark);
}

/* Themed scrollbars */
:deep(::-webkit-scrollbar) { width: 12px; height: 12px; }
:deep(::-webkit-scrollbar-track) { background: var(--content-bg); }
:deep(::-webkit-scrollbar-thumb) { background: var(--border-dark); border-radius: 6px; }
:deep(::-webkit-scrollbar-thumb:hover) { background: var(--brand-gold); }
</style>
