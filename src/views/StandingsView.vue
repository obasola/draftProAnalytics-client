// src/views/StandingsView.vue
<template>
    <AppLayout>
        <div class="page standings p-4">
            <h2 class="text-xl font-bold mb-3">NFL Standings</h2>

            <div class="flex gap-3 mb-4">
                <Dropdown v-model="selectedYear" :options="years" placeholder="Year" />
                <Dropdown v-model="selectedType" :options="seasonTypes" optionLabel="label" optionValue="value" />
                <Button label="Refresh" icon="pi pi-refresh" @click="loadData" />
            </div>

            <div v-if="loading">Loading standings...</div>

            <div v-else>
                <TabView>
                    <TabPanel v-for="conf in conferences" :key="conf.name" :header="conf.name + ' Conference'">
                        <div class="division-grid">
                            <StandingsTable v-for="div in conf.divisions" :key="div.name" :title="div.name"
                                :teams="div.teams" />
                        </div>
                    </TabPanel>
                </TabView>
            </div>

        </div>
    </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, toRaw } from 'vue'
import { useStandingsStore } from '@/stores/standingsStore'
import StandingsTable from '@/components/team/StandingsTable.vue'
import AppLayout from '@/components/ui/AppLayout.vue'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'

const store = useStandingsStore()
const selectedYear = ref(2025)
const selectedType = ref(2)
const years = [2025, 2024, 2023]
const seasonTypes = [
    { label: 'Regular', value: 2 },
    { label: 'Postseason', value: 3 },
]

onMounted(loadData)
function loadData() {
    store.load(selectedYear.value, selectedType.value)
}

const loading = computed(() => store.loading)
const conferences = computed(() => groupByConferenceAndDivision(store.standings))

function groupByConferenceAndDivision(standings: any[]) {
    const confMap: Record<string, Record<string, any[]>> = {};

    // First group by conference and division
    for (const t of standings) {
        const conf = t.conference || 'Unknown';
        const div = t.division || 'Unknown';
        if (!confMap[conf]) confMap[conf] = {};
        if (!confMap[conf][div]) confMap[conf][div] = [];
        confMap[conf][div].push(toRaw(t));
    }

    // Define the desired division order
    const divisionOrder = ['North', 'South', 'East', 'West'];

    // Return conferences with divisions sorted by this order
    return Object.entries(confMap).map(([conf, divisions]) => ({
        name: conf,
        divisions: Object.entries(divisions)
            .sort(([a], [b]) => {
                const ia = divisionOrder.indexOf(a);
                const ib = divisionOrder.indexOf(b);
                // If either is not found, keep it at the end
                if (ia === -1 && ib === -1) return a.localeCompare(b);
                if (ia === -1) return 1;
                if (ib === -1) return -1;
                return ia - ib;
            })
            .map(([div, teams]) => ({
                name: div,
                teams: teams.map(toRaw),
            })),
    }));
}

</script>


<style scoped>
.division-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5em;
  margin-top: 1em;
  padding-left: 1em;         /* east-side padding (left for LTR layouts) */
}

/* --- TAB HEADER BAR --- */
:deep(.p-tabview-nav) {
  background-color: #062d92;
  border-radius: 0.5em 0.5em 0 0;
  padding: 0.25em 0.5em;
}

/* --- INACTIVE TABS --- */
:deep(.p-tabview-nav li .p-tabview-nav-link) {
  background-color: #b66e00; /* bronze background */
  color: #062d92;            /* navy text */
  font-weight: 600;
  border: none;
  margin-right: 0.25em;
  border-radius: 0.4em 0.4em 0 0;
  transition: all 0.2s ease-in-out;
}

/* --- HOVER STATE --- */
:deep(.p-tabview-nav li .p-tabview-nav-link:hover) {
  filter: brightness(1.1);
  color: #000a4d;
}

/* --- ACTIVE TAB --- */
:deep(.p-tabview-nav li.p-highlight .p-tabview-nav-link) {
  background-color: #9e4c03;
  color: #ffffff;
  border-radius: 0.4em 0.4em 0 0;
}

/* --- TAB PANELS --- */
:deep(.p-tabview-panels) {
  background-color: #f6f6f6;
  border-radius: 0 0 0.5em 0.5em;
  padding: 1em;
  animation: fadeIn 0.25s ease-in-out; /* smooth transition */
}

/* --- FADE ANIMATION --- */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

</style>

