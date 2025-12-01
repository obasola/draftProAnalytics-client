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
  // ─────────────────────────────────────
  // STATE
  // ─────────────────────────────────────
  const accessToken = ref<string>('');
  const personId = ref<number | null>(null);
  const userName = ref<string>('');
  const role = ref<number | null>(null);
  const rememberMe = ref<boolean>(false);
  const tokenExpiry = ref<number>(0); // UNIX seconds
  const refreshInterval = ref<number | null>(null);

  // ─────────────────────────────────────
  // COMPUTED
  // ─────────────────────────────────────
  const isAuthenticated = computed<boolean>(() => accessToken.value !== '');
  const secondsToExpiry = computed<number>(() =>
    tokenExpiry.value ? tokenExpiry.value - Math.floor(Date.now() / 1000) : 0
  );

  // ─────────────────────────────────────
  // PERSISTENCE
  // ─────────────────────────────────────
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

  // Exposed method for UI interaction
  function setRememberMe(value: boolean): void {
    rememberMe.value = value;
  }

  // ─────────────────────────────────────
  // AUTO REFRESH
  // ─────────────────────────────────────
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

  async function refresh(): Promise<void> {
    if (!personId.value) return;

    const data = await authApi.refresh(personId.value);
    accessToken.value = data.accessToken;

    const payload = decodeJwt(data.accessToken);
    tokenExpiry.value = payload.exp;
  }

  // ─────────────────────────────────────
  // LOGIN (username/password)
  // ─────────────────────────────────────
  async function login(user: string, pass: string): Promise<void> {
    const data = await authApi.login({ userName: user, password: pass });

    accessToken.value = data.accessToken;

    const payload = decodeJwt(data.accessToken);
    personId.value = payload.sub;
    userName.value = payload.userName;
    tokenExpiry.value = payload.exp;

    scheduleAutoRefresh();
  }

  // ─────────────────────────────────────
  // SOCIAL LOGIN (Google / Apple)
  // ─────────────────────────────────────
  function loginWithGoogle(): void {
    const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
    window.location.href = `${baseUrl}/auth/google`;
  }

  function loginWithApple(): void {
    const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
    window.location.href = `${baseUrl}/auth/apple`;
  }

  // ─────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────
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

  // ─────────────────────────────────────
  // BOOTSTRAP
  // ─────────────────────────────────────
  loadFromStorage();

  return {
    // state
    accessToken,
    personId,
    userName,
    role,
    rememberMe,

    // computed
    isAuthenticated,
    secondsToExpiry,

    // actions
    setRememberMe,
    login,
    refresh,
    logout,
    loginWithGoogle,
    loginWithApple,
  };
});
