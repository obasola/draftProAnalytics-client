// src/modules/auth/application/authStore.ts
import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import type { JwtPayload } from "../domain/AuthTypes";
import { loginWithPasswordUseCase } from "./usecases/loginWithPasswordUseCase";
import { refreshAccessTokenUseCase } from "./usecases/refreshAccessTokenUseCase";
import { logoutUseCase } from "./usecases/logoutUseCase";

import type { AccessMeResponse, AssignedRole, PermissionMap } from "@/modules/accessControl/domain/access.types";
import { getMyAccessContext, assumeRole as apiAssumeRole } from "@/modules/accessControl/application/api/accessControlApi";

function base64UrlToBase64(input: string): string {
  const pad = "=".repeat((4 - (input.length % 4)) % 4);
  return (input + pad).replace(/-/g, "+").replace(/_/g, "/");
}

function decodeJwt(token: string): JwtPayload {
  const parts = token.split(".");
  if (parts.length < 2) throw new Error("Invalid JWT");

  const payloadB64 = base64UrlToBase64(parts[1]);
  const payloadJson = atob(payloadB64);

  const parsed = JSON.parse(payloadJson) as unknown;
  if (!parsed || typeof parsed !== "object") throw new Error("Invalid JWT payload");

  return parsed as JwtPayload;
}

export const useAuthStore = defineStore("auth", () => {
  // ─────────────────────────────────────
  // STATE
  // ─────────────────────────────────────
  const accessToken = ref<string>("");
  const personId = ref<number | null>(null);

  // NEW primary role source
  const activeRid = ref<number | null>(null);

  // LEGACY: keep for old guards/nav until everything is moved to activeRid
  const role = ref<number | null>(null);

  const userName = ref<string>("");

  // NEW access context fields
  const activeRoleName = ref<string>("");
  const assignedRoles = ref<AssignedRole[]>([]);
  const permissions = ref<PermissionMap>({});
  const accessLoaded = ref<boolean>(false);
  const accessLoadInFlight = ref<Promise<void> | null>(null);

  const rememberMe = ref<boolean>(false);
  const tokenExpiry = ref<number>(0); // UNIX seconds
  const refreshIntervalId = ref<number | null>(null);

  // ─────────────────────────────────────
  // COMPUTED
  // ─────────────────────────────────────
  const isAuthenticated = computed<boolean>(() => accessToken.value !== "");
  const secondsToExpiry = computed<number>(() =>
    tokenExpiry.value ? tokenExpiry.value - Math.floor(Date.now() / 1000) : 0
  );

  // ─────────────────────────────────────
  // PERSISTENCE
  // ─────────────────────────────────────
  interface PersistedAuth {
    accessToken: string;
    personId: number;
    userName: string;
    activeRid: number | null;
    role: number | null;
    tokenExpiry: number;
  }

  function loadFromStorage(): void {
    const stored = localStorage.getItem("auth_persist");
    if (!stored) return;

    const data = JSON.parse(stored) as PersistedAuth;

    accessToken.value = data.accessToken;
    personId.value = data.personId;
    userName.value = data.userName;
    activeRid.value = data.activeRid;

    // keep legacy role synced to activeRid
    role.value = data.activeRid ?? data.role ?? null;

    tokenExpiry.value = data.tokenExpiry;
    rememberMe.value = true;

    scheduleAutoRefresh();

    // load /access/me after boot if we have a token
    void ensureAccessContext();
  }

  function persistIfNeeded(): void {
    if (!rememberMe.value) {
      localStorage.removeItem("auth_persist");
      return;
    }

    const data: PersistedAuth = {
      accessToken: accessToken.value,
      personId: personId.value ?? 0,
      userName: userName.value,
      activeRid: activeRid.value,
      role: role.value ?? null,
      tokenExpiry: tokenExpiry.value,
    };

    localStorage.setItem("auth_persist", JSON.stringify(data));
  }

  watch(accessToken, persistIfNeeded);
  watch(rememberMe, persistIfNeeded);
  watch(personId, persistIfNeeded);
  watch(userName, persistIfNeeded);
  watch(tokenExpiry, persistIfNeeded);

  // Always keep role synced to activeRid
  watch(activeRid, (v) => {
    role.value = v ?? null;
    persistIfNeeded();
  });

  function setRememberMe(value: boolean): void {
    rememberMe.value = value;
  }

  // ─────────────────────────────────────
  // ACCESS CONTEXT
  // ─────────────────────────────────────
  function applyAccessContext(ctx: AccessMeResponse): void {
    // keep auth core in sync
    personId.value = ctx.personId;
    userName.value = ctx.userName;

    activeRid.value = ctx.activeRid;
    role.value = ctx.activeRid; // legacy sync

    activeRoleName.value = ctx.activeRoleName;
    assignedRoles.value = ctx.assignedRoles;
    permissions.value = ctx.permissions;
    accessLoaded.value = true;
  }

  async function loadAccessContext(): Promise<void> {
    if (!accessToken.value) return;

    const ctx = await getMyAccessContext(accessToken.value);
    applyAccessContext(ctx);
  }

  async function ensureAccessContext(): Promise<void> {
    if (!isAuthenticated.value) return;
    if (accessLoaded.value) return;

    if (accessLoadInFlight.value) {
      await accessLoadInFlight.value;
      return;
    }

    const p = (async () => {
      try {
        await loadAccessContext();
      } finally {
        accessLoadInFlight.value = null;
      }
    })();

    accessLoadInFlight.value = p;
    await p;
  }

  async function assumeRole(toRid: number): Promise<void> {
    if (!accessToken.value) return;

    const ctx = await apiAssumeRole(accessToken.value, toRid);
    applyAccessContext(ctx);
  }

  // ─────────────────────────────────────
  // AUTO REFRESH
  // ─────────────────────────────────────
  function scheduleAutoRefresh(): void {
    if (refreshIntervalId.value !== null) {
      window.clearInterval(refreshIntervalId.value);
    }

    refreshIntervalId.value = window.setInterval(async () => {
      const secs = secondsToExpiry.value;

      if (secs <= 60 && secs > 0) await refresh();
      if (secs <= 0) await logout();
    }, 5000);
  }

  async function refresh(): Promise<void> {
    if (personId.value == null) return;

    const data = await refreshAccessTokenUseCase({ personId: personId.value });
    accessToken.value = data.accessToken;

    const payload = decodeJwt(data.accessToken);
    tokenExpiry.value = payload.exp;

    // If refresh token includes activeRid, keep it synced
    if (typeof payload.activeRid === "number") {
      activeRid.value = payload.activeRid;
    }

    // refresh => reload access context (permissions may change)
    accessLoaded.value = false;
    await ensureAccessContext();
  }

  // ─────────────────────────────────────
  // LOGIN (username/password)
  // ─────────────────────────────────────
  async function login(user: string, pass: string): Promise<void> {
    const data = await loginWithPasswordUseCase({ userName: user, password: pass });

    accessToken.value = data.accessToken;

    const payload = decodeJwt(data.accessToken);
    personId.value = payload.sub;
    userName.value = payload.userName;
    activeRid.value = payload.activeRid ?? null;
    tokenExpiry.value = payload.exp;

    // legacy role follows activeRid
    role.value = activeRid.value;

    // clear access context; reload from /access/me
    accessLoaded.value = false;
    assignedRoles.value = [];
    permissions.value = {};
    activeRoleName.value = "";

    scheduleAutoRefresh();

    await ensureAccessContext();
  }

  // ─────────────────────────────────────
  // SOCIAL LOGIN (Google / Apple)
  // ─────────────────────────────────────
  function loginWithGoogle(): void {
    const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "";
    window.location.href = `${baseUrl}/auth/google`;
  }

  function loginWithApple(): void {
    const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "";
    window.location.href = `${baseUrl}/auth/apple`;
  }

  // ─────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────
  async function logout(): Promise<void> {
    if (personId.value != null) await logoutUseCase({ personId: personId.value });

    accessToken.value = "";
    personId.value = null;
    userName.value = "";
    activeRid.value = null;
    role.value = null;
    tokenExpiry.value = 0;
    rememberMe.value = false;

    // access context
    activeRoleName.value = "";
    assignedRoles.value = [];
    permissions.value = {};
    accessLoaded.value = false;
    accessLoadInFlight.value = null;

    localStorage.removeItem("auth_persist");

    if (refreshIntervalId.value !== null) {
      window.clearInterval(refreshIntervalId.value);
      refreshIntervalId.value = null;
    }
  }

  // ─────────────────────────────────────
  // BOOTSTRAP
  // ─────────────────────────────────────
  loadFromStorage();

  return {
    // core
    accessToken,
    personId,
    userName,
    activeRid,
    role, // legacy
    rememberMe,
    // access context
    activeRoleName,
    assignedRoles,
    permissions,

    isAuthenticated,
    secondsToExpiry,

    setRememberMe,
    login,
    refresh,
    logout,
    loginWithGoogle,
    loginWithApple,

    // access context actions
    loadAccessContext,
    ensureAccessContext,
    assumeRole,
  };
});
