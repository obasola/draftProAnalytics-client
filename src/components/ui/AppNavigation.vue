<script setup lang="ts">
import { computed, nextTick, ref } from "vue";

import {
  RouterLink,
  useRouter,
  type RouteLocationRaw,
} from "vue-router";

import PanelMenu from "primevue/panelmenu";
import Button from "primevue/button";
import type { MenuItem, MenuItemCommandEvent } from "primevue/menuitem";

import { useNavigation } from "@/composables/useNavigation";
import { useAuthStore } from "@/modules/auth/application/authStore";

import { can } from "@/modules/accessControl/application/can";
import type { ActionCode, DomainCode } from "@/modules/accessControl/domain/access.types";
import { logger } from "@/util/Logger";

type RoutePermission = { domain: DomainCode; action: ActionCode };

type MenuItemWithPerm = MenuItem & {
  to?: RouteLocationRaw;
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

const focusSinkRef = ref<HTMLSpanElement | null>(null);

const moveFocusAwayFromPrimeVueMenu = async (): Promise<void> => {
  const activeElement = document.activeElement;

  if (activeElement instanceof HTMLElement) {
    activeElement.blur();
  }

  await nextTick();

  focusSinkRef.value?.focus({
    preventScroll: true,
  });
};

const blurActiveMenuElement = (): void => {
  const activeElement = document.activeElement;

  if (activeElement instanceof HTMLElement) {
    activeElement.blur();
  }
};

const safePush = async (to: RouteLocationRaw): Promise<void> => {
  await moveFocusAwayFromPrimeVueMenu();

  const resolved = router.resolve(to);

  if (resolved.fullPath === router.currentRoute.value.fullPath) {
    return;
  }

  logger.debug("safePush invoked");
  await router.push(to);
};

const isAdmin = computed((): boolean => (auth.activeRid ?? auth.role ?? 1) === 4);

const handleLogout = async (): Promise<void> => {
  await auth.logout();
  await safePush("/login");
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
const routeItem = (p: {
  label: string;
  icon: string;
  to?: RouteLocationRaw;
  requiredPerm?: RoutePermission;
  adminOnly?: boolean;
  onClick?: () => void | Promise<void>;
}): MenuItemWithPerm => ({
  label: p.label,
  icon: p.icon,
  to: p.to,
  requiredPerm: p.requiredPerm,
  adminOnly: p.adminOnly,
  command: async (event): Promise<void> => {
    event.originalEvent.preventDefault();
    event.originalEvent.stopPropagation();

    blurActiveMenuElement();

    if (p.onClick) {
      await p.onClick();
      return;
    }

    if (p.to != null) {
      logger.debug("routeItem invoked: ", p);
      await safePush(p.to);
    }
  },
});

const handleLeafItemClick = async (
  event: MouseEvent,
  item: MenuItemWithPerm,
): Promise<void> => {
  event.preventDefault();
  event.stopPropagation();

  await moveFocusAwayFromPrimeVueMenu();

  if (item.command) {
    await item.command({
      originalEvent: event,
      item,
    });
  }
};
const appMenuSpec = computed<readonly MenuItemWithPerm[]>(() => {

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
          label: 'Draft Day Scorecard',
          icon: 'pi pi-table',
          to: '/draft-day-scorecard',
          requiredPerm: { domain: "DRAFT_ORDER", action: "VIEW" },
        }),

        routeItem({
          label: 'Draft Pick Management',
          icon: 'pi pi-pencil',
          to: '/draft-day-scorecard/2026/manage',
          requiredPerm: { domain: "DRAFT_ORDER", action: "EDIT" },
        }),

        routeItem({
          label: "B4Me Analysis",
          icon: "pi pi-stopwatch",
          to: "/b4me-analysis",
          requiredPerm: { domain: "DRAFT_TOOLS", action: "VIEW" },
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
          label: "Import NFL Data",
          icon: "pi pi-cloud-download",
          to: "/jobs/nfl-imports",
          requiredPerm: { domain: "JOBS", action: "RUN" },
        }),
        routeItem({
          label: "Import ESPN Draft Data",
          icon: "pi pi-users",
          to: "/jobs/nfl-imports/draft",
          requiredPerm: { domain: "JOBS", action: "RUN" },
        }),
        routeItem({
          label: "Import Team Roster",
          icon: "pi pi-id-card",
          to: "/jobs/nfl-imports/team-roster",
          requiredPerm: { domain: "JOBS", action: "RUN" },
        }),
        routeItem({
          label: "Job Queue",
          icon: "pi pi-list",
          to: "/jobs",
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
          adminOnly: true,
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
          routeItem({
            label: "Login",
            icon: "pi pi-sign-in",
            to: "/login",
          }),
          routeItem({
            label: "Register",
            icon: "pi pi-user-plus",
            to: "/register",
          }),
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
      <Button :icon="isCollapsed ? 'pi pi-angle-right' : 'pi pi-angle-left'" class="collapse-toggle" text rounded
        aria-label="Toggle navigation" @click="toggleCollapse" />
    </div>

    <span ref="focusSinkRef" class="focus-sink" tabindex="-1" />

    <PanelMenu :model="menuItems" :multiple="true" class="nav-panelmenu">
      <template #item="{ item, props, hasSubmenu }">
        <a v-if="hasSubmenu" v-bind="props.action" class="p-panelmenu-header-link">
          <span :class="item.icon" />
          <span class="p-panelmenu-header-label">{{ item.label }}</span>
          <span class="p-submenu-icon pi pi-chevron-down" />
        </a>

        <RouterLink v-else-if="item.to" :to="item.to" custom v-slot="{ href }">
          <a :href="href" class="p-menuitem-link" @click="handleLeafItemClick($event, item as MenuItemWithPerm)">
            <span :class="item.icon" />
            <span class="p-menuitem-text">{{ item.label }}</span>
          </a>
        </RouterLink>

        <a v-else href="#" class="p-menuitem-link" @click="handleLeafItemClick($event, item as MenuItemWithPerm)">
          <span :class="item.icon" />
          <span class="p-menuitem-text">{{ item.label }}</span>
        </a>
      </template>
    </PanelMenu>
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
  color: #ffffff;
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
  color: #ffffff;
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
  color: #073c98;
}

.collapsed :deep(.p-menuitem-link) {
  justify-content: center;
  color: #073c98;
  padding: 0.6rem;
}

.collapsed :deep(.p-menuitem-text),
.collapsed :deep(.p-panelmenu-header-label) {
  color: #073c98;
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

.focus-sink {
  position: fixed;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}
</style>
