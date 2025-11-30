<!-- src/components/ui/AppHeader.vue -->
<script setup lang="ts">
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";

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
      <h1 @click="goHome" class="app-title" tabindex="0">
        Sports Management System
      </h1>

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
  background: var(--header-bg);   /* bg5 #062D92 */
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

.app-title {
  margin: 0;
  cursor: pointer;
  line-height: 1.2;
  color: var(--text-on-bg5);
  transition: opacity 0.2s;
}
.app-title:hover {
  opacity: 0.9;
}
.app-title:focus-visible {
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
