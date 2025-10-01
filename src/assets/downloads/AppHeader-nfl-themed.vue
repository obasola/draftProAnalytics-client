<!-- AppHeader.vue — NFL Fan Theme -->
<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
const goHome = () => { router.push('/') }

const getNflLogo = (): string => {
  return `../../images/NFLogo.jpeg`
}

</script>

<template>
  <header class="app-header" role="banner">
    <div class="header-content">
      <h2 class="nfl-logo">
        <img :src="getNflLogo()" class="inline-logo" />
      </h2>
      <h1 @click="goHome" class="app-title" tabindex="0">Sports Management System</h1>
      <div class="header-actions"><!-- actions --></div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background: var(--header-bg);
  color: var(--text-on-dark);
  padding: 0.875rem 2rem;
  border-bottom: 1px solid var(--border-dark);
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
  color: var(--text-on-dark);
  transition: color 0.2s, opacity 0.2s;
  outline: none;
}
.app-title:hover { color: var(--brand-gold); opacity: 0.95; }
.app-title:focus-visible { outline: 3px solid var(--brand-green); outline-offset: 3px; border-radius: 6px; }

.header-actions { display: flex; gap: 0.75rem; }
</style>
