<script setup lang="ts">
import { computed, ref } from "vue";
import {
  useRouter,
  isNavigationFailure,
  NavigationFailureType,
  type RouteLocationRaw,
} from "vue-router";
import PanelMenu from "primevue/panelmenu";
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

const handleLogout = async (): Promise<void> => {
  await auth.logout();
  safePush("/login");
};

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

const appMenuSpec = computed<readonly MenuItemWithPerm[]>(() => {
  const routeItem = (p: {
    label: string;
    icon: string;
    to?: RouteLocationRaw;
    requiredPerm?: RoutePermission;
    onClick?: () => void;
  }): MenuItemWithPerm => ({
    label: p.label,
    icon: p.icon,
    requiredPerm: p.requiredPerm,
    command: () => {
      if (p.onClick) return p.onClick();
      if (p.to != null) return safePush(p.to);
    },
  });

  return [
    // Dashboard
    routeItem({
      label: "Dashboard",
      icon: "pi pi-chart-line",
      to: "/dashboard",
      requiredPerm: { domain: "DASHBOARD", action: "VIEW" },
    }),

    // Players (Parent menu)
    {
      label: "Players",
      icon: "pi pi-users",
      items: [
        routeItem({
          label: "Player Listings",
          icon: "pi pi-users",
          to: "/players",
          requiredPerm: { domain: "PLAYERS", action: "VIEW" },
        }),
        routeItem({
          label: "Player Awards",
          icon: "pi pi-trophy",
          to: "/player-awards",
          requiredPerm: { domain: "PLAYER_MAINT", action: "VIEW" },
        }),
        routeItem({
          label: "Player Teams",
          icon: "pi pi-users",
          to: "/player-teams",
          requiredPerm: { domain: "PLAYER_MAINT", action: "VIEW" },
        }),
      ],
    },

    // Teams (Parent menu)
    {
      label: "Teams",
      icon: "pi pi-flag",
      items: [
        routeItem({
          label: "Team Listings",
          icon: "pi pi-flag",
          to: "/teams",
          requiredPerm: { domain: "TEAMS", action: "VIEW" },
        }),
        routeItem({
          label: "Team Needs",
          icon: "pi pi-exclamation-triangle",
          to: "/team-needs",
          requiredPerm: { domain: "TEAM_NEEDS", action: "VIEW" },
        }),
        routeItem({
          label: "Team Standings",
          icon: "pi pi-chart-line",
          to: "/standings",
          requiredPerm: { domain: "STANDINGS", action: "VIEW" },
        }),
        routeItem({
          label: "Post Season Results",
          icon: "pi pi-crown",
          to: "/post-season-results",
          requiredPerm: { domain: "PLAYOFFS", action: "VIEW" },
        }),
      ],
    },

    // Scheduling (Parent menu)
    {
      label: "Scheduling",
      icon: "pi pi-calendar",
      items: [
        routeItem({
          label: "Games",
          icon: "pi pi-calendar",
          to: "/games",
          requiredPerm: { domain: "GAMES", action: "VIEW" },
        }),
        routeItem({
          label: "Schedules",
          icon: "pi pi-calendar",
          to: "/schedules",
          requiredPerm: { domain: "SCHEDULES", action: "VIEW" },
        }),
        routeItem({
          label: "Show Upcoming Games",
          icon: "pi pi-clock",
          to: "/show-upcoming-games",
          requiredPerm: { domain: "SCHEDULES", action: "VIEW" },
        }),
        routeItem({
          label: "Playoffs Bracket",
          icon: "pi pi-sitemap",
          to: "/playoffs/bracket",
          requiredPerm: { domain: "PLAYOFFS", action: "VIEW" },
        }),
      ],
    },

    // Draft Menu (Parent menu)
    {
      label: "Draft Menu",
      icon: "pi pi-folder",
      items: [
        routeItem({
          label: "Draft Order",
          icon: "pi pi-sort-amount-up-alt",
          to: "/draft-order",
          requiredPerm: { domain: "DRAFT_ORDER", action: "VIEW" },
        }),
        routeItem({
          label: "Draft Simulation",
          icon: "pi pi-stopwatch",
          to: "/draft-simulator",
          requiredPerm: { domain: "DRAFT_TOOLS", action: "VIEW" },
        }),
        routeItem({
          label: "PFF Mock Draft",
          icon: "pi pi-stopwatch",
          to: "/draft-mock",
          requiredPerm: { domain: "DRAFT_TOOLS", action: "VIEW" },
        }),
        routeItem({
          label: "Draft Board",
          icon: "pi pi-list",
          to: "/draft-board",
          requiredPerm: { domain: "DRAFT_TOOLS", action: "VIEW" },
        }),
        routeItem({
          label: "Draft Picks",
          icon: "pi pi-list",
          to: "/draftPicks",
          requiredPerm: { domain: "DRAFT_TOOLS", action: "VIEW" },
        }),
        routeItem({
          label: "Draft Pick Scraper",
          icon: "pi pi-cloud-download",
          to: "/admin/draft-pick-scraper",
          requiredPerm: { domain: "SCRAPERS", action: "VIEW" },
        }),
        routeItem({
          label: "Prospects",
          icon: "pi pi-star",
          to: "/prospects",
          requiredPerm: { domain: "SCOUTING", action: "VIEW" },
        }),
        routeItem({
          label: "Combine Scores",
          icon: "pi pi-chart-bar",
          to: "/combine-scores",
          requiredPerm: { domain: "SCOUTING", action: "VIEW" },
        }),
      ],
    },

    // Draft Analytics (Parent menu)
    {
      label: "Draft Analytics",
      icon: "pi pi-chart-bar",
      items: [
        routeItem({
          label: "Draft Analysis",
          icon: "pi pi-chart-bar",
          to: "/draft-analysis",
          requiredPerm: { domain: "DRAFT_TOOLS", action: "VIEW" },
        }),
        routeItem({
          label: "Draft Analytics",
          icon: "pi pi-chart-line",
          // keep on the existing route until you add a dedicated /draft-analytics view
          to: "/draft-analysis",
          requiredPerm: { domain: "DRAFT_TOOLS", action: "VIEW" },
        }),
        routeItem({
          label: "Live Tracker",
          icon: "pi pi-stopwatch",
          // keep on the existing route until you add a dedicated /draft-live view
          to: "/draft-analysis",
          requiredPerm: { domain: "DRAFT_TOOLS", action: "VIEW" },
        }),
        routeItem({
          label: "Reports",
          icon: "pi pi-file",
          // keep on the existing route until you add a dedicated /draft-reports view
          to: "/draft-analysis",
          requiredPerm: { domain: "DRAFT_TOOLS", action: "VIEW" },
        }),
      ],
    },

    // Jobs Menu (Parent menu)
    {
      label: "Jobs Menu",
      icon: "pi pi-cog",
      items: [
        routeItem({
          label: "Jobs",
          icon: "pi pi-stopwatch",
          onClick: () => goToPage("Jobs"),
          requiredPerm: { domain: "JOBS", action: "VIEW" },
        }),
      ],
    },

    // Admin (Parent menu)
    {
      label: "Admin",
      icon: "pi pi-lock",
      items: [
        routeItem({
          label: "User Admin",
          icon: "pi pi-users",
          to: "/admin/users",
          requiredPerm: { domain: "ADMIN_USERS", action: "VIEW" },
        }),
        routeItem({
          label: "Logout",
          icon: "pi pi-sign-out",
          onClick: () => void handleLogout(),
        }),
      ],
    },
  ];
});

const menuItems = computed<MenuItem[]>(() => {
  if (!auth.isAuthenticated) {
    const authSpec: MenuItemWithPerm[] = [
      {
        label: "Account",
        icon: "pi pi-user",
        items: [
          { label: "Login", icon: "pi pi-sign-in", command: () => safePush("/login") },
          { label: "Register", icon: "pi pi-user-plus", command: () => safePush("/register") },
        ],
      },
    ];
    return filterMenu(authSpec);
  }

  return filterMenu(appMenuSpec.value);
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

    <PanelMenu :model="menuItems" :multiple="true" class="nav-panelmenu" />
  </nav>
</template>

<style scoped>
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
  background-color: #073c98;
  color:#ffffff;
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

/* PanelMenu base */
:deep(.nav-panelmenu.p-panelmenu) {
  background-color: #073c98;
  color:#ffffff;
  border: none;
  width: 100%;
  
}

:deep(.p-panelmenu-panel) {
  border: none;
  background: transparent;
}

/* Collapsible section headers */
:deep(.p-panelmenu-header-link) {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
  color: var(--text-on-bg1);
  font-weight: 800;
  transition: background 0.18s, color 0.18s;
  white-space: nowrap;
  background-color: #073c98;
  color: #ffffff;
}

:deep(.p-panelmenu-header-link:hover) {
  background-color: #073c98;
}

/* Sub-items */
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
  background-color: #9e4c03;
  color: #073c98;
}

:deep(.p-menuitem-link:hover) {
  background: rgba(255, 255, 255, 0.1);
}

/* Collapsed mode: icons-only */
.collapsed :deep(.p-panelmenu-header-link) {
  color:#073c98;
}
.collapsed :deep(.p-menuitem-link) {
  justify-content: center;
  color:#073c98;
  padding: 0.6rem;
}

.collapsed :deep(.p-menuitem-text),
.collapsed :deep(.p-panelmenu-header-label) {
  color:#073c98;
  display: none;
}

.collapsed :deep(.p-submenu-icon),
.collapsed :deep(.p-panelmenu-icon) {
  display: none;
}

/* Tighten submenu indent (optional, keeps the look consistent) */
:deep(.p-panelmenu-content) {
  background: transparent;
  border: none;
  padding: 0.15rem 0;
}

:deep(.p-panelmenu-root-list) {
  gap: 0.15rem;
}
</style>
