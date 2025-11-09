<!-- src/views/Home.vue -->
<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/playerStore'
import { useTeamStore } from '@/stores/teamStore'
import AppLayout from '@/components/ui/AppLayout.vue'
import Card from 'primevue/card'
import Button from 'primevue/button'

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
  <!-- AppLayout already scopes theme-five in its root -->
  
    <main class="home-view" role="main" aria-label="Home Dashboard">
      <!-- Welcome / Hero -->

      <!-- Stats Overview -->
      <section class="stats-overview" aria-label="Summary Statistics">
        <Card class="stat-card" tabindex="0" aria-label="Total Players">
          <template #content>
            <div class="stat-content">
              <i class="pi pi-users stat-icon" aria-hidden="true"></i>
              <div class="stat-info">
                <h3>{{ playerStore.players ? playerStore.players.length : 0 }}</h3>
                <span>Total Players</span>
              </div>
            </div>
          </template>
        </Card>

        <Card
          class="stat-card clickable-card"
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
            v-for="action in quickActions"
            :key="action.route"
            class="action-card"
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
                <!-- Go button background = --body-bg (per your request) -->
                <Button label="Go" icon="pi pi-arrow-right" class="p-button-sm" />
              </div>
            </template>
          </Card>
        </div>
      </section>
    </main>
  
</template>

<style scoped>
/* Map page & components to the five-color tokens */
.home-view {
  --home-body-bg: var(--content-bg);   /* deep bg2 */
  --home-card-bg: var(--card-bg);      /* bg1 */
  --home-text-card: var(--text-on-bg1);/* white on bg1 */
  --home-text-content: var(--text-on-bg2); /* dark on content */
}

.home-view {
  max-width: 1200px;
  margin: 0 auto;
  background: var(--home-body-bg);
  color: var(--home-text-content);
}

/* Welcome / Hero */
.welcome-section {
  text-align: center;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, rgba(204,123,0,0.18), rgba(6,45,146,0.12));
  border: 1px solid rgba(0,0,0,0.35);
  border-radius: 14px;
  padding: 1.75rem;
}
.welcome-section h1 { font-size: 2.4rem; margin-bottom: 0.5rem; color: var(--home-text-content); }
.welcome-section p  { font-size: 1.05rem; color: #1b1b1b; }

/* Stats grid */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
}
:deep(.stat-card.p-card) {
  background: var(--home-card-bg);         /* bg1 */
  color: var(--home-text-card);            /* white */
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s, background-color 0.2s;
}
:deep(.stat-card.p-card .p-card-content) { padding: 1.0rem 1.1rem 1.1rem; }

.stat-card, .clickable-card { cursor: pointer !important; }
.clickable-card:hover { transform: translateY(-3px); box-shadow: 0 10px 22px rgba(0,0,0,0.25); }

/* Stat content */
.stat-content { display: flex; align-items: center; gap: 1rem; }
.stat-icon { font-size: 2rem; color: var(--home-text-card); }
.stat-info h3 { font-size: 2rem; margin: 0; color: var(--home-text-card); }
.stat-info span { color: rgba(255,255,255,0.9); }

/* Quick Actions */
.quick-actions h2 { margin-bottom: 1rem; color: var(--home-text-content); }
.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.25rem;
}

:deep(.action-card.p-card) {
  background: var(--home-card-bg);         /* bg1 */
  color: var(--home-text-card);            /* white */
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s, background-color 0.2s;
}
.action-card:hover { transform: translateY(-3px); box-shadow: 0 10px 22px rgba(0,0,0,0.25); }
:deep(.action-card .p-card-content) { padding: 1.2rem 1.0rem; }

.action-content { text-align: center; }
.action-icon { font-size: 2.2rem; color: var(--home-text-card); margin-bottom: 0.4rem; }
.action-content h3 { margin-bottom: 0.4rem; color: var(--home-text-card); }
.action-content p { margin-bottom: 0.9rem; color: rgba(255,255,255,0.9); }

/* Quick Actions "Go" buttons = page body color; readable text black */
:deep(.quick-actions .p-button) {
  background: var(--body-bg) !important;    /* bg2 */
  border: 1px solid rgba(0,0,0,0.35) !important;
  color: #000 !important;                   /* black text per your requirement */
  font-weight: 600;
}
:deep(.quick-actions .p-button:hover) {
  filter: brightness(0.95);
}

/* Forms (for edit pages when they render here) */
:deep(input),
:deep(textarea),
:deep(select),
:deep(.p-inputtext),
:deep(.p-dropdown),
:deep(.p-multiselect),
:deep(.p-calendar) {
  background: var(--field-bg) !important;   /* bg3 */
  color: #000 !important;
  -webkit-text-fill-color: #000 !important;
  border: 1px solid rgba(0,0,0,0.3) !important;
}
:deep(input::placeholder),
:deep(textarea::placeholder) { color: #222 !important; opacity: 1 !important; }
</style>
