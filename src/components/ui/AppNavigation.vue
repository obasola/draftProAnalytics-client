<!-- src/components/ui/AppNavigation.vue -->
<script setup lang="ts">
import { computed } from "vue";
import { useRouter,
    isNavigationFailure,
  NavigationFailureType,
  type RouteLocationRaw
 } from "vue-router";
import Menu from "primevue/menu";
import type { MenuItem } from "primevue/menuitem";
import { useNavigation } from "@/composables/useNavigation";
import { useAuthStore } from "@/modules/auth/application/authStore";
import { nextTick } from 'vue'

const router = useRouter();
const { goToPage } = useNavigation();
const auth = useAuthStore();

const handleLogout = async (): Promise<void> => {
  await auth.logout();
  await safePush("/login");
};

const menuItems = computed<MenuItem[]>(() => {
  const items: MenuItem[] = [
    { label: "Dashboard", icon: "pi pi-chart-line", command: () => safePush("/") },
    { label: "Games", icon: "pi pi-calendar", command: () => safePush("/games") },
    { label: "Players", icon: "pi pi-users", command: () => safePush("/players") },
  
    { 
      label: "Teams",
      icon: "pi pi-flag",
      command: (event) => {
        // Move focus off the link element directly
        const target = (event?.originalEvent?.currentTarget ?? event?.originalEvent?.target) as HTMLElement | null;
        if (target instanceof HTMLElement) target.blur();
        focusSink();
        safePush("/teams");
      }
    },
    { label: "Prospects", icon: "pi pi-star", command: () => safePush("/prospects") },
    { label: "Draft Picks", icon: "pi pi-list", command: () => safePush("/draftPicks") },
    { label: "Combine Scores", icon: "pi pi-chart-bar", command: () => safePush("/combine-scores") },
    { label: "Schedules", icon: "pi pi-calendar", command: () => safePush("/schedules") },
    {
      label: "Show Upcoming Games",
      icon: "pi pi-clock",
      command: () => safePush("/show-upcoming-games"),
    },
    { label: "Player Awards", icon: "pi pi-trophy", command: () => safePush("/player-awards") },
    { label: "Player Teams", icon: "pi pi-users", command: () => safePush("/player-teams") },
    { label: "Team Needs", icon: "pi pi-exclamation-triangle", command: () => safePush("/team-needs") },
    { label: "Team Standings", icon: "pi pi-chart-line", command: () => safePush("/standings") },
    {
      label: "Playoff Bracket",
      icon: "pi pi-sitemap",
      command: () => safePush("/playoffs/bracket"),
    },
    {
      label: "Post Season Results",
      icon: "pi pi-crown",
      command: () => safePush("/post-season-results"),
    },
    {
      label: "Draft Menu",
      icon: "pi pi-folder",
      items: [
        {
          label: "Draft Simulator",
          icon: "pi pi-stopwatch",
          command: () => safePush("/draft-simulator"),
        },
        {
          label: "Draft Tracker",
          icon: "pi pi-stopwatch",
          command: () => safePush("/draft-tracker"),
        },
        {
          label: "Draft Pick Scraper",
          icon: "pi pi-cloud-download",
          command: () => safePush("/admin/draft-pick-scraper"),
        },
      ],
    },
    {
      label: "Batch Jobs Menu",
      icon: "pi pi-folder",
      items: [
        {
          label: "Jobs",
          icon: "pi pi-stopwatch",
          command: () => goToPage("jobs"),
        },
      ],
    },
  ];

  // ─────────────────────────────
  // Optional Admin section by role
  // (1 = Visitor, 2 = Admin, 3 = Developer)
  // ─────────────────────────────
  if (auth.isAuthenticated && (auth.role ?? 1) >= 2) {
    items.push({
      label: "Admin",
      icon: "pi pi-lock",
      items: [
        {
          label: "User Administration",
          icon: "pi pi-users",
          command: () => safePush("/admin/users"),
        },
      ],
    });
  }

  // ─────────────────────────────
  // Auth items at bottom
  // ─────────────────────────────
  items.push({ separator: true } as MenuItem);

  if (!auth.isAuthenticated) {
    items.push(
      {
        label: "Login",
        icon: "pi pi-sign-in",
        command: () => safePush("/login"),
      },
      {
        label: "Register",
        icon: "pi pi-user-plus",
        command: () => safePush("/register"),
      },
    );
  } else {
    items.push({
      label: "Logout",
      icon: "pi pi-sign-out",
      command: () => {
        void handleLogout();
      },
    });
  }

  return items;
});



function blurActiveElement(): void {
  const el = document.activeElement
  if (el instanceof HTMLElement) el.blur()
}

function raf(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()))
}

function focusSink(): void {
  const el = document.getElementById("focus-sink");
  if (el instanceof HTMLElement) el.focus();
}

function safePush(to: RouteLocationRaw): void {
  // move focus off the menu link immediately
  focusSink();

  window.setTimeout(() => {
    void router.push(to).catch((err: unknown) => {
      if (isNavigationFailure(err, NavigationFailureType.duplicated)) return;
      console.error("Navigation error:", err);
    });
  }, 0);
}



</script>

<template>
  <nav class="app-navigation" role="navigation" aria-label="Main Navigation">
    <Menu :model="menuItems" class="nav-menu" />
  </nav>
</template>

<style scoped>
.app-navigation {
  width: 260px;
  background: var(--nav-bg);          /* bg1 #9E4B03 */
  color: var(--text-on-bg1);          /* white */
  border-right: 1px solid rgba(0, 0, 0, 0.35);
  padding: 0.75rem 0.5rem;
  overflow-y: auto;
}

/* PrimeVue Menu overrides */
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
  font-weight: 700; /* darker/bolder per your theme */
  transition: background 0.18s, color 0.18s;
}

:deep(.p-menuitem-link:hover) {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

:deep(.p-menuitem-icon) {
  color: var(--text-on-bg1);
}
:deep(.p-menuitem-link:hover .p-menuitem-icon) {
  color: #ffffff;
}

/* Submenus */
:deep(.p-submenu-list) {
  background: var(--card-bg); /* bg1 inside */
  padding-left: 0.4rem;
  border-left: 2px solid rgba(255, 255, 255, 0.25);
  border-radius: 6px;
  margin-left: 0.35rem;
}

/* Scrollbar styling */
:deep(::-webkit-scrollbar) {
  width: 10px;
}
:deep(::-webkit-scrollbar-track) {
  background: var(--content-bg);
}
:deep(::-webkit-scrollbar-thumb) {
  background: rgba(0, 0, 0, 0.35);
  border-radius: 5px;
}
:deep(::-webkit-scrollbar-thumb:hover) {
  background: rgba(0, 0, 0, 0.5);
}
</style>
