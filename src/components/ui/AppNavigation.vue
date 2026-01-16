<script setup lang="ts">
import { computed, ref } from "vue";
import {
  useRouter,
  isNavigationFailure,
  NavigationFailureType,
  type RouteLocationRaw,
} from "vue-router";
import Menu from "primevue/menu";
import Button from "primevue/button";
import type { MenuItem } from "primevue/menuitem";
import { useNavigation } from "@/composables/useNavigation";
import { useAuthStore } from "@/modules/auth/application/authStore";

import { can } from "@/modules/accessControl/application/can";
import type { ActionCode, DomainCode } from "@/modules/accessControl/domain/access.types";

type RoutePermission = { domain: DomainCode; action: ActionCode };

type MenuItemWithPerm = MenuItem & {
  requiredPerm?: RoutePermission;
  adminOnly?: boolean;
};

const router = useRouter();
const { goToPage } = useNavigation();
const auth = useAuthStore();
const isCollapsed = ref(false);

const handleLogout = async (): Promise<void> => {
  await auth.logout();
  safePush("/login");
};

const toggleCollapse = (): void => {
  isCollapsed.value = !isCollapsed.value;
};

function focusSink(): void {
  const el = document.getElementById("focus-sink");
  if (el instanceof HTMLElement) el.focus();
}

function safePush(to: RouteLocationRaw): void {
  focusSink();
  window.setTimeout(() => {
    void router.push(to).catch((err: unknown) => {
      if (isNavigationFailure(err, NavigationFailureType.duplicated)) return;
      // eslint-disable-next-line no-console
      console.error("Navigation error:", err);
    });
  }, 0);
}

const isAdmin = computed((): boolean => (auth.activeRid ?? auth.role ?? 1) === 4);
const isPowerUser = computed((): boolean => {
  const rid = auth.activeRid ?? auth.role ?? 1;
  return rid === 2 || rid === 3 || rid === 4;
});

function filterMenu(items: readonly MenuItemWithPerm[]): MenuItem[] {
  const out: MenuItem[] = [];

  for (const item of items) {
    if ((item as MenuItem).separator) {
      out.push(item);
      continue;
    }

    if (item.adminOnly && !isAdmin.value) continue;
    if (item.requiredPerm && !can(item.requiredPerm.domain, item.requiredPerm.action)) continue;

    if (item.items && item.items.length > 0) {
      const children = filterMenu(item.items as MenuItemWithPerm[]);
      if (children.length === 0) continue;
      out.push({ ...item, items: children });
      continue;
    }

    out.push(item);
  }

  return out;
}

const menuItems = computed<MenuItem[]>(() => {
  const visitorSpec: MenuItemWithPerm[] = [
    { label: "Dashboard", icon: "pi pi-chart-line", command: () => safePush("/dashboard"), requiredPerm: { domain: "DASHBOARD", action: "VIEW" } },
    { label: "Games", icon: "pi pi-calendar", command: () => safePush("/games"), requiredPerm: { domain: "GAMES", action: "VIEW" } },
    { label: "Players", icon: "pi pi-users", command: () => safePush("/players"), requiredPerm: { domain: "PLAYERS", action: "VIEW" } },
    { label: "Teams", icon: "pi pi-flag", command: () => safePush("/teams"), requiredPerm: { domain: "TEAMS", action: "VIEW" } },
    { label: "Schedules", icon: "pi pi-calendar", command: () => safePush("/schedules"), requiredPerm: { domain: "SCHEDULES", action: "VIEW" } },
    { label: "Show Upcoming Games", icon: "pi pi-clock", command: () => safePush("/show-upcoming-games"), requiredPerm: { domain: "SCHEDULES", action: "VIEW" } },
    { label: "Team Standings", icon: "pi pi-chart-line", command: () => safePush("/standings"), requiredPerm: { domain: "STANDINGS", action: "VIEW" } },
    { label: "Playoff Bracket", icon: "pi pi-sitemap", command: () => safePush("/playoffs/bracket"), requiredPerm: { domain: "PLAYOFFS", action: "VIEW" } },
    { label: "Draft Order", icon: "pi pi-sort-amount-up-alt", command: () => safePush("/draft-order"), requiredPerm: { domain: "DRAFT_ORDER", action: "VIEW" } },
  ];

  const powerUserSpec: MenuItemWithPerm[] = [
    ...visitorSpec,
    { label: "Player Awards", icon: "pi pi-trophy", command: () => safePush("/player-awards"), requiredPerm: { domain: "PLAYER_MAINT", action: "VIEW" } },
    { label: "Player Teams", icon: "pi pi-users", command: () => safePush("/player-teams"), requiredPerm: { domain: "PLAYER_MAINT", action: "VIEW" } },
    { label: "Team Needs", icon: "pi pi-exclamation-triangle", command: () => safePush("/team-needs"), requiredPerm: { domain: "TEAM_NEEDS", action: "VIEW" } },
    { label: "Post Season Results", icon: "pi pi-crown", command: () => safePush("/post-season-results"), requiredPerm: { domain: "PLAYOFFS", action: "VIEW" } },
    { label: "Prospects", icon: "pi pi-star", command: () => safePush("/prospects"), requiredPerm: { domain: "SCOUTING", action: "VIEW" } },
    { label: "Combine Scores", icon: "pi pi-chart-bar", command: () => safePush("/combine-scores"), requiredPerm: { domain: "SCOUTING", action: "VIEW" } },

    {
      label: "Draft Menu",
      icon: "pi pi-folder",
      requiredPerm: { domain: "DRAFT_TOOLS", action: "VIEW" },
      items: [
        { label: "Draft Simulator", icon: "pi pi-stopwatch", command: () => safePush("/draft-simulator"), requiredPerm: { domain: "DRAFT_TOOLS", action: "VIEW" } },
        { label: "Draft Board", icon: "pi pi-list", command: () => safePush("/draft-board"), requiredPerm: { domain: "DRAFT_TOOLS", action: "VIEW" } },
        { label: "Draft Picks", icon: "pi pi-list", command: () => safePush("/draftPicks"), requiredPerm: { domain: "DRAFT_TOOLS", action: "VIEW" } },
        { label: "Draft Pick Scraper", icon: "pi pi-cloud-download", command: () => safePush("/admin/draft-pick-scraper"), requiredPerm: { domain: "SCRAPERS", action: "VIEW" } },
      ],
    },

    {
      label: "Batch Jobs Menu",
      icon: "pi pi-folder",
      requiredPerm: { domain: "JOBS", action: "VIEW" },
      items: [{ label: "Jobs", icon: "pi pi-stopwatch", command: () => goToPage("Jobs"), requiredPerm: { domain: "JOBS", action: "VIEW" } }],
    },

    {
      label: "Admin",
      icon: "pi pi-lock",
      requiredPerm: { domain: "ADMIN_USERS", action: "VIEW" },
      items: [{ label: "User Administration", icon: "pi pi-users", command: () => safePush("/admin/users"), requiredPerm: { domain: "ADMIN_USERS", action: "VIEW" } }],
    },
  ];

  const base = auth.isAuthenticated ? filterMenu(isPowerUser.value ? powerUserSpec : visitorSpec) : [];

  const authItems: MenuItemWithPerm[] = [{ separator: true } as MenuItemWithPerm];
  if (!auth.isAuthenticated) {
    authItems.push(
      { label: "Login", icon: "pi pi-sign-in", command: () => safePush("/login") },
      { label: "Register", icon: "pi pi-user-plus", command: () => safePush("/register") }
    );
  } else {
    authItems.push({ label: "Logout", icon: "pi pi-sign-out", command: () => void handleLogout() });
  }

  return [...base, ...filterMenu(authItems)];
});
</script>

<template>
  <nav class="app-navigation" :class="{ collapsed: isCollapsed }" role="navigation" aria-label="Main Navigation">
    <div class="nav-header">
      <Button
        :icon="isCollapsed ? 'pi pi-angle-right' : 'pi pi-angle-left'"
        class="collapse-toggle"
        text
        rounded
        aria-label="Toggle navigation"
        @click="toggleCollapse"
      />
    </div>

    <Menu :model="menuItems" class="nav-menu" />
  </nav>
</template>

<style scoped>
/* unchanged from your version */
.app-navigation {
  width: 260px;
  background: var(--nav-bg);
  color: var(--text-on-bg1);
  border-right: 1px solid rgba(0, 0, 0, 0.35);
  padding: 0.75rem 0.5rem;
  overflow-y: auto;
  overflow-x: hidden;
  transition: width 0.3s ease-in-out, padding 0.3s ease-in-out;
  position: relative;
}

.app-navigation.collapsed {
  width: 60px;
  padding: 0.75rem 0.25rem;
}

.nav-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.5rem;
  padding: 0 0.25rem;
}

.collapse-toggle {
  color: var(--text-on-bg1) !important;
  transition: transform 0.3s ease;
}

.collapse-toggle:hover {
  background: rgba(255, 255, 255, 0.1) !important;
}

.collapsed .collapse-toggle {
  transform: translateX(-2px);
}

:deep(.nav-menu.p-menu) {
  background: transparent;
  border: none;
  width: 100%;
  color: var(--text-on-bg1);
}

:deep(.p-menuitem-link) {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
  color: var(--text-on-bg1);
  font-weight: 700;
  transition: background 0.18s, color 0.18s;
  white-space: nowrap;
}

.collapsed :deep(.p-menuitem-link) {
  justify-content: center;
  padding: 0.6rem;
}

.collapsed :deep(.p-menuitem-text) {
  display: none;
}

.collapsed :deep(.p-submenu-icon) {
  display: none;
}

:deep(.p-menuitem-link:hover) {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

:deep(.p-menuitem-icon) {
  color: var(--text-on-bg1);
  font-size: 1.1rem;
}

:deep(.p-menuitem-link:hover .p-menuitem-icon) {
  color: #ffffff;
}

:deep(.p-submenu-list) {
  background: var(--card-bg);
  padding-left: 0.4rem;
}
</style>
