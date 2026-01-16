<!-- src/components/ui/AppHeader.vue -->
<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/modules/auth/application/authStore";

import RoleSwitcher from "@/modules/accessControl/presentation/components/RoleSwitcher.vue";

const router = useRouter();
const auth = useAuthStore();

// ✅ keep these reactive
const { isAuthenticated, userName } = storeToRefs(auth);

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
      <!-- LEFT SIDE: Brand lockup (Icon + Wordmark) -->
      <div class="header-left" @click="goHome" tabindex="0" aria-label="Go to home">
        <!-- Inline SVG icon: Draft Card + Data -->
        <span class="brand-icon" aria-hidden="true">
          <svg
            class="brand-icon__svg"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 64 64"
            fill="none"
          >
            <!-- card -->
            <rect x="14" y="10" width="36" height="44" rx="7" stroke="currentColor" stroke-width="3" />

            <!-- bars -->
            <rect x="22" y="40" width="6" height="10" rx="1" fill="currentColor" />
            <rect x="30" y="34" width="6" height="16" rx="1" fill="currentColor" />
            <rect x="38" y="26" width="6" height="24" rx="1" fill="currentColor" />

            <!-- trendline + dot -->
            <path
              d="M22 41 L33 34 L42 28"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <circle cx="42" cy="28" r="2.8" fill="currentColor" />
          </svg>
        </span>

        <h1 class="app-title">
          <span class="brand-wordmark">DraftProAnalytics<sup class="brand-mark">™</sup></span>
        </h1>
      </div>

      <!-- RIGHT SIDE: Auth actions + Role Switcher -->
      <div class="header-actions">
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

          <!-- Role Switcher (moved from AppNavigation) -->
          <div class="role-switcher-wrap" aria-label="Role Switcher">
            <RoleSwitcher />
          </div>
        </template>

        <template v-else>
          <button type="button" class="header-link" @click="handleLoginClick">
            Login
          </button>

          <button type="button" class="header-link" @click="handleRegisterClick">
            Register
          </button>
        </template>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background: #527ec7; /* bg5 #062D92 */
  color: var(--text-on-bg5); /* white */
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

/* Brand lockup */
.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  margin-left: -55px; /* keep your existing nudge */
}

.brand-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  width: 60px;
}

.brand-icon__svg {
  height: 60px;
  width: 60px;
  display: block;
}

.app-title {
  margin: 0;
  line-height: 1.2;
  color: var(--text-on-bg5);
  transition: opacity 0.2s;
}

.brand-wordmark {
  display: inline-flex;
  align-items: flex-start;
  gap: 0.1rem;
  letter-spacing: 0.2px;
}

.brand-mark {
  font-size: 0.65em;
  line-height: 1;
  vertical-align: super;
  margin-left: 0.08em;
}

.header-left:hover .app-title {
  opacity: 0.9;
}

.header-left:focus-visible {
  outline: 3px solid #ffda77;
  outline-offset: 3px;
  border-radius: 6px;
}

/* Right-side layout */
.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  justify-content: flex-end;
  margin-left: auto;
}

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

/* Role Switcher placement: right of Logout, pinned to right edge */
.role-switcher-wrap {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  margin-left: 0.25rem; /* small separation from Logout */
}
</style>
