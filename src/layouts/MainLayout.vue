<!-- src/layouts/MainLayout.vue -->
<script setup lang="ts">
import AppHeader from '@/components/ui/AppHeader.vue'
import AppNavigation from '@/components/ui/AppNavigation.vue'
import '@/assets/css/theme-nfl-fan.css'
</script>

<template>
  <div class="app-container theme-five">
    <AppHeader />
    <div class="main-content">
      <AppNavigation />
      <main class="content-area" role="main">
        <RouterView />
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
  min-height: 0;
}

.content-area {
  flex: 1;
  min-width: 0;
  padding: 1rem;
  overflow: auto;
}
</style>
