// src/stores/authStore.ts
import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { authApi } from '@/services/authApi';

interface JwtPayload {
  sub: number;
  userName: string;
  exp: number;
  iat: number;
}

function decodeJwt(token: string): JwtPayload {
  return JSON.parse(atob(token.split('.')[1])) as JwtPayload;
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string>('');
  const personId = ref<number | null>(null);
  const userName = ref<string>('');
  const role = ref<number | null>(null);
  const rememberMe = ref<boolean>(false);
  const tokenExpiry = ref<number>(0); // unix timestamp (seconds)
  const refreshInterval = ref<number | null>(null);

  const isAuthenticated = computed<boolean>(() => accessToken.value !== '');
  const secondsToExpiry = computed<number>(() =>
    tokenExpiry.value ? tokenExpiry.value - Math.floor(Date.now() / 1000) : 0
  );

  // ─────────────────────
  // Load from Local Storage
  // ─────────────────────
  function loadFromStorage(): void {
    const stored = localStorage.getItem('auth_persist');
    if (!stored) return;

    const data = JSON.parse(stored) as {
      accessToken: string;
      personId: number;
      userName: string;
      role: number;
      tokenExpiry: number;
    };

    accessToken.value = data.accessToken;
    personId.value = data.personId;
    userName.value = data.userName;
    role.value = data.role;
    tokenExpiry.value = data.tokenExpiry;
    rememberMe.value = true;

    scheduleAutoRefresh();
  }

  // ─────────────────────
  // Persist if Remember Me enabled
  // ─────────────────────
  function persistIfNeeded(): void {
    if (!rememberMe.value) {
      localStorage.removeItem('auth_persist');
      return;
    }

    localStorage.setItem(
      'auth_persist',
      JSON.stringify({
        accessToken: accessToken.value,
        personId: personId.value,
        userName: userName.value,
        role: role.value,
        tokenExpiry: tokenExpiry.value,
      })
    );
  }

  watch(accessToken, persistIfNeeded);
  watch(rememberMe, persistIfNeeded);

  // allow UI to set rememberMe explicitly
  function setRememberMe(value: boolean): void {
    rememberMe.value = value;
  }

  // ─────────────────────
  // Auto Refresh Scheduler
  // ─────────────────────
  function scheduleAutoRefresh(): void {
    if (refreshInterval.value !== null) {
      window.clearInterval(refreshInterval.value);
    }

    refreshInterval.value = window.setInterval(async () => {
      const secs = secondsToExpiry.value;

      if (secs <= 60 && secs > 0) {
        await refresh();
      }
      if (secs <= 0) {
        await logout();
      }
    }, 5000);
  }

  // ─────────────────────
  // Refresh JWT
  // ─────────────────────
  async function refresh(): Promise<void> {
    if (!personId.value) return;

    const data = await authApi.refresh(personId.value);
    accessToken.value = data.accessToken;

    const payload = decodeJwt(data.accessToken);
    tokenExpiry.value = payload.exp;
  }

  // ─────────────────────
  // Login (username/password)
  // ─────────────────────
  async function login(user: string, pass: string): Promise<void> {
    const data = await authApi.login({ userName: user, password: pass });

    accessToken.value = data.accessToken;

    const payload = decodeJwt(data.accessToken);
    personId.value = payload.sub;
    userName.value = payload.userName;
    tokenExpiry.value = payload.exp;

    scheduleAutoRefresh();
  }

  // ─────────────────────
  // Social login redirects (Google / Apple)
  // ─────────────────────
  function loginWithGoogle(): void {
    const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
    window.location.href = `${baseUrl}/auth/google`;
  }

  function loginWithApple(): void {
    const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
    window.location.href = `${baseUrl}/auth/apple`;
  }

  // ─────────────────────
  // Logout
  // ─────────────────────
  async function logout(): Promise<void> {
    if (personId.value) {
      await authApi.logout(personId.value);
    }

    accessToken.value = '';
    personId.value = null;
    userName.value = '';
    role.value = null;
    tokenExpiry.value = 0;
    rememberMe.value = false;

    localStorage.removeItem('auth_persist');

    if (refreshInterval.value !== null) {
      window.clearInterval(refreshInterval.value);
      refreshInterval.value = null;
    }
  }

  // Initial load
  loadFromStorage();

  return {
    accessToken,
    personId,
    userName,
    role,
    rememberMe,
    isAuthenticated,
    secondsToExpiry,

    setRememberMe,
    login,
    logout,
    refresh,
    loginWithGoogle,
    loginWithApple,
  };
});
