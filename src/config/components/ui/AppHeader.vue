<!-- src/components/ui/AppHeader.vue -->
<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
const goHome = () => { router.push('/') }
</script>

<template>
  <header class="app-header" role="banner">
    <div class="header-content">
      <h1 @click="goHome" class="app-title" tabindex="0">Sports Management System</h1>
      <div class="header-actions">
        <!-- add user menu / icons here -->
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background: var(--header-bg);   /* bg5 #062D92 */
  color: var(--text-on-bg5);      /* white */
  padding: 0.875rem 2rem;
  border-bottom: 1px solid rgba(0,0,0,0.35);
  box-shadow: 0 2px 10px rgba(0,0,0,0.25);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.app-title {
  margin: 0;
  cursor: pointer;
  line-height: 1.2;
  color: var(--text-on-bg5);
  transition: opacity 0.2s;
}
.app-title:hover { opacity: 0.9; }
.app-title:focus-visible { outline: 3px solid #FFDA77; outline-offset: 3px; border-radius: 6px; }

.header-actions { display: flex; gap: 0.75rem; }
</style>
