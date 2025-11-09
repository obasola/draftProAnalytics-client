<!-- Home.vue — NFL Fan Theme -->
<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/playerStore'
import { useTeamStore } from '@/stores/teamStore'
import AppLayout from '@/components/ui/AppLayout.vue'
import Card from 'primevue/card'
import Button from 'primevue/button'

import '@/assets/css/theme-nfl-fan.css'

const router = useRouter()
const playerStore = usePlayerStore()
const teamStore = useTeamStore()

onMounted(async () => {
  await Promise.all([playerStore.fetchAll(), teamStore.fetchAll()])
})

const quickActions = [
  { label: 'Manage Players', icon: 'pi pi-users', route: '/players', description: 'View, create, and manage player profiles' },
  { label: 'Manage Teams', icon: 'pi pi-flag', route: '/teams', description: 'View, create, and manage team information' },
  { label: 'View Prospects', icon: 'pi pi-star', route: '/prospects', description: 'Manage upcoming draft prospects' },
  { label: 'Draft Picks', icon: 'pi pi-list', route: '/draft-picks', description: 'Manage draft selections and trades' },
  { label: 'Combine Scores', icon: 'pi pi-chart-bar', route: '/combine-scores', description: 'View and manage NFL combine results' },
  { label: 'Schedules', icon: 'pi pi-calendar', route: '/schedules', description: 'Manage team schedules and game results' },
]

const navigateTo = (route: string) => { router.push(route) }
</script>

<template>
    <main class="home-view theme-nfl" role="main" aria-label="Home Dashboard">
      <!-- Welcome / Hero -->
      <section class="welcome-section" aria-labelledby="home-title">
        <h1 id="home-title">Sports Management System</h1>
        <p>Comprehensive management solution for professional sports teams</p>
      </section>

      <!-- Stats Overview -->
      <section class="stats-overview" aria-label="Summary Statistics">
        <Card class="stat-card card-accent--green" tabindex="0" aria-label="Total Players">
          <template #content>
            <div class="stat-content">
              <i class="pi pi-users stat-icon" aria-hidden="true"></i>
              <div class="stat-info">
                <h3>{{ playerStore.players.length }}</h3>
                <span>Total Players</span>
              </div>
            </div>
          </template>
        </Card>

        <Card
          class="stat-card clickable-card card-accent--gold"
          role="button"
          tabindex="0"
          aria-label="Total Teams. Go to Teams"
          @click="navigateTo('/teams')"
          @keyup.enter="navigateTo('/teams')"
        >
          <template #content>
            <div class="stat-content">
              <i class="pi pi-flag stat-icon" aria-hidden="true"></i>
              <div class="stat-info">
                <h3>{{ teamStore.teams.length }}</h3>
                <span>Total Teams</span>
              </div>
            </div>
          </template>
        </Card>
      </section>

      <!-- Quick Actions -->
      <section class="quick-actions" aria-labelledby="quick-actions-title">
        <h2 id="quick-actions-title">Quick Actions</h2>

        <div class="actions-grid">
          <Card
            v-for="(action, i) in quickActions"
            :key="action.route"
            class="action-card"
            :class="i % 3 === 0 ? 'card-accent--green' : (i % 3 === 1 ? 'card-accent--gold' : 'card-accent--navy')"
            role="button"
            tabindex="0"
            :aria-label="`${action.label}. ${action.description}. Go`"
            @click="navigateTo(action.route)"
            @keyup.enter="navigateTo(action.route)"
          >
            <template #content>
              <div class="action-content">
                <i :class="action.icon" class="action-icon" aria-hidden="true"></i>
                <h3>{{ action.label }}</h3>
                <p>{{ action.description }}</p>
                <Button
                  label="Go"
                  icon="pi pi-arrow-right"
                  class="p-button-sm"
                  :class="i % 3 === 0 ? 'solid-primary' : (i % 3 === 1 ? 'solid-secondary' : 'ghost-navy')"
                />
              </div>
            </template>
          </Card>
        </div>
      </section>
    </main>

</template>

<style scoped>
.home-view {
  --home-body-bg: var(--content-bg);
  --home-panel-bg: var(--surface-100);
  --home-text-dark: var(--text-on-dark);
  --home-text-light: var(--text-on-light);
  --home-border-dark: var(--border-dark);
  --home-hover-dark: var(--hover-dark);
}

.home-view {
  max-width: 1200px;
  margin: 0 auto;
  background: var(--home-body-bg);
  color: var(--home-text-dark);
}

/* Hero: navy gradient with gold hint */
.welcome-section {
  text-align: center;
  margin-bottom: 2.5rem;
  background: linear-gradient(135deg, rgba(0,34,68,0.22), rgba(255,182,18,0.12));
  border: 1px solid var(--home-border-dark);
  border-radius: 14px;
  padding: 2rem;
}

.welcome-section h1 { font-size: 2.6rem; margin-bottom: 0.75rem; color: var(--home-text-dark); }
.welcome-section p  { font-size: 1.1rem; color: var(--muted-on-dark); }

/* Stats grid */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

:deep(.stat-card.p-card) {
  background: var(--home-panel-bg);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s, background-color 0.2s;
  color: var(--text-on-light);
}
:deep(.stat-card.p-card .p-card-content) { padding: 1.1rem 1.2rem 1.25rem; }

.stat-card, .clickable-card { cursor: pointer !important; }
.clickable-card:hover { transform: translateY(-3px); box-shadow: 0 10px 22px rgba(0,0,0,0.25); background: var(--hover-light); }

/* Stat content */
.stat-content { display: flex; align-items: center; gap: 1rem; }
.stat-icon { font-size: 2rem; color: var(--muted-on-light); }
.stat-info h3 { font-size: 2rem; margin: 0; color: var(--text-on-light); }
.stat-info span { color: var(--muted-on-light); }

/* Quick Actions */
.quick-actions h2 { margin-bottom: 1.25rem; color: var(--home-text-dark); }
.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

:deep(.action-card.p-card) {
  background: var(--home-panel-bg);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s, background-color 0.2s;
  color: var(--text-on-light);
}
.action-card:hover { transform: translateY(-3px); box-shadow: 0 10px 22px rgba(0,0,0,0.25); background: var(--hover-light); }
:deep(.action-card .p-card-content) { padding: 1.35rem 1.1rem; }

.action-content { text-align: center; }
.action-icon { font-size: 2.4rem; color: var(--brand-navy); margin-bottom: 0.5rem; }
.action-content h3 { margin-bottom: 0.5rem; color: var(--text-on-light); }
.action-content p { margin-bottom: 1rem; color: var(--muted-on-light); }

:deep(.action-card .p-button:focus-visible) {
  outline: 3px solid var(--brand-green);
  outline-offset: 2px;
}

.action-card:focus-visible, .clickable-card:focus-visible, .stat-card:focus-visible {
  outline: 3px solid var(--brand-green);
  outline-offset: 3px;
  border-radius: 12px;
}
</style>
