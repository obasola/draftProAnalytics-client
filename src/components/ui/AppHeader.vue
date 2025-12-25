<!-- src/components/ui/AppHeader.vue -->
<script setup lang="ts">
import { useRouter } from "vue-router";
import { useAuthStore } from "@/modules/auth/application/authStore";

const router = useRouter();
const auth = useAuthStore();

// These are already refs/computed refs from the store
const isAuthenticated = auth.isAuthenticated;
const userName = auth.userName;

const goHome = (): void => {
  void router.push("/");
};

const handleLoginClick = (): void => {
  void router.push("/login");
};

const handleRegisterClick = (): void => {
  void router.push("/register");
};

const handleLogoutClick = async (): Promise<void> => {
  await auth.logout();
  await router.push("/login");
};
</script>

<template>
  <header class="app-header" role="banner">
    <div class="header-content">
      <!-- LEFT SIDE: Logo + Title -->
      <div class="header-left" @click="goHome" tabindex="0">
        <img
          src="/logos/NFLogo.jpeg"
          alt="NFL logo"
          class="app-logo"
        />
        <h1 class="app-title">
          Sports Management System
        </h1>
      </div>

      <!-- RIGHT SIDE: Auth actions -->
      <div class="header-actions">
        <!-- AUTH SECTION -->
        <template v-if="isAuthenticated">
          <span class="user-label">
            Signed in as <strong>{{ userName }}</strong>
          </span>

          <Button
            label="Logout"
            class="p-button-text p-button-sm header-btn"
            icon="pi pi-sign-out"
            @click="handleLogoutClick"
          />
        </template>

        <template v-else>
          <button
            type="button"
            class="header-link"
            @click="handleLoginClick"
          >
            Login
          </button>

          <button
            type="button"
            class="header-link"
            @click="handleRegisterClick"
          >
            Register
          </button>
        </template>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background: #527ec7;   /* bg5 #062D92 */
  color: var(--text-on-bg5);      /* white */
  padding: 0.875rem 2rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.35);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
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

/* NEW: logo + title container */
.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  margin-left: -55px; /* ⬅ nudges logo + title ~20px left */
}
/* NEW: logo styling */
.app-logo {
  height: 60px;
  width: auto;
  object-fit: contain;
  display: block;
}

.app-title {
  margin: 0;
  line-height: 1.2;
  color: var(--text-on-bg5);
  transition: opacity 0.2s;
}

.header-left:hover .app-title {
  opacity: 0.9;
}

.header-left:focus-visible {
  outline: 3px solid #ffda77;
  outline-offset: 3px;
  border-radius: 6px;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

/* Auth UX bits */
.user-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.header-link {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.6);
  color: var(--text-on-bg5);
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s, color 0.18s, border-color 0.18s;
}

.header-link:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: #ffffff;
}

.header-btn {
  font-size: 0.85rem;
}
</style>
