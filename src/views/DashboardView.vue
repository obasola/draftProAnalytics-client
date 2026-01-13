<!-- src/views/DashboardView.vue -->
<template>
  <div class="dashboard">
    <h2 class="dashboard-title">Dashboard</h2>
    <p class="dashboard-subtitle">
      Quick access to key modules in your Sports Management System.
    </p>

    <div class="dashboard-grid">
      <div
        v-for="link in links"
        :key="link.label"
        class="dashboard-card"
        :class="{ 'dashboard-card--disabled': !link.isEnabled }"
      >
        <div class="dashboard-card-header">
          <i :class="['pi', link.icon, 'dashboard-card-icon']" />
          <h3>{{ link.label }}</h3>
        </div>

        <p class="dashboard-card-description">
          {{ link.description }}
        </p>

        <!-- Active (clickable) for this role -->
        <button
          v-if="link.isEnabled"
          type="button"
          class="dashboard-card-button"
          @click="go(link.to)"
        >
          → Go
        </button>

        <!-- Disabled for Visitor -->
        <span
          v-else
          class="dashboard-card-disabled-label"
        >
          Restricted for Visitor role
        </span>
      </div>
    </div>

    <p v-if="isVisitor" class="dashboard-visitor-note">
      You are currently signed in as a <strong>Visitor</strong>. On this Dashboard,
      only <strong>Schedules</strong> and <strong>Draft Picks</strong> are active.
      Use the left navigation for read-only access to Upcoming Games, Standings, and Teams.
    </p>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/modules/auth/application/authStore";
import { computed } from "vue";
import { useRouter } from "vue-router";

interface DashboardLink {
  label: string;
  description: string;
  icon: string; // PrimeIcons class suffix, e.g. 'pi-calendar'
  to: string;
  allowedForVisitor: boolean;
}

const router = useRouter();
const auth = useAuthStore();

// Treat missing role as Visitor (1)
const effectiveRole = computed<number>(() => auth.activeRid ?? auth.role ?? 1);
const isVisitor = computed<boolean>(() => effectiveRole.value === 1);

const baseLinks = computed<DashboardLink[]>(() => [
  {
    label: "Schedules",
    description: "Browse the full NFL schedule by week, season, and team.",
    icon: "pi-calendar",
    to: "/schedules",
    allowedForVisitor: true,
  },
  {
    label: "Draft Picks",
    description: "Track draft picks and analyze capital by team.",
    icon: "pi-list",
    to: "/draftPicks",
    allowedForVisitor: false,
  },
  {
    label: "Upcoming Games",
    description: "See upcoming matchups with logos, times, and TV info.",
    icon: "pi-clock",
    to: "/show-upcoming-games",
    allowedForVisitor: true,
  },
  {
    label: "Team Standings",
    description: "View division standings, win percentage, and tiebreakers.",
    icon: "pi-chart-line",
    to: "/standings",
    allowedForVisitor: true,
  },
  {
    label: "Teams",
    description: "Deep dive into rosters, needs, and draft history.",
    icon: "pi-flag",
    to: "/teams",
    allowedForVisitor: true,
  },
  {
    label: "Jobs Console",
    description: "Run and monitor ESPN sync jobs and schedulers.",
    icon: "pi-cog",
    to: "/jobs",
    allowedForVisitor: false,
  },
]);

const links = computed(() =>
  baseLinks.value.map((link) => ({
    ...link,
    isEnabled: !isVisitor.value || link.allowedForVisitor,
  })),
);

const go = (path: string): void => {
  void router.push(path);
};
</script>

<style scoped>
.dashboard {
  padding: 0.75rem 0.75rem 1.5rem;
}

.dashboard-title {
  margin: 0 0 0.25rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--heading-color, #ffffff);
}

.dashboard-subtitle {
  margin: 0 0 1rem;
  font-size: 0.95rem;
  opacity: 0.9;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 0.75rem;
}

.dashboard-card {
  background: var(--card-bg);
  border-radius: 0.75rem;
  padding: 0.85rem 0.9rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.dashboard-card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dashboard-card-icon {
  font-size: 1.1rem;
}

.dashboard-card-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
}

.dashboard-card-description {
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.3;
  opacity: 0.9;
}

.dashboard-card-button {
  align-self: flex-start;
  margin-top: 0.3rem;
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  background: var(--body-bg);
  color: var(--text-on-dark);
  transition: background 0.18s, transform 0.12s;
}

.dashboard-card-button:hover {
  transform: translateY(-1px);
  filter: brightness(1.05);
}

.dashboard-card--disabled {
  opacity: 0.65;
}

.dashboard-card-disabled-label {
  margin-top: 0.35rem;
  font-size: 0.8rem;
  font-style: italic;
  opacity: 0.9;
}

.dashboard-visitor-note {
  margin-top: 1rem;
  font-size: 0.85rem;
  opacity: 0.9;
}
</style>
