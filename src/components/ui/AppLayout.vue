<script setup lang="ts">
import AppHeader from './AppHeader.vue';
import AppNavigation from './AppNavigation.vue';
import { RouterView } from 'vue-router';
</script>

<template>
  <div class="app-container theme-five">
    <AppHeader />
    <div class="main-content">
      <!-- Focus sink lives OUTSIDE PrimeVue Menu -->
      <div
        id="focus-sink"
        tabindex="-1"
        class="sr-only"
        aria-hidden="true"
      >
        focus
      </div>

      <AppNavigation />
      <main class="content-area" role="main">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.sr-only {
  position: absolute;
  left: -9999px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  background: var(--content-bg);
}
</style>