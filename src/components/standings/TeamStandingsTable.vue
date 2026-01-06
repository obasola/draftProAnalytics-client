<template>
  <div>
    <div v-for="conference in conferences" :key="conference" class="conference-block">
      <h2 class="conference-title">{{ conference }}</h2>
      <div class="divisions-container">
        <div
          v-for="division in divisionsByConference(conference)"
          :key="division"
          class="division-block"
        >
          <h3>{{ division }}</h3>
          <DataTable :value="teamsByDivision(conference, division)" :rows="10" sortField="pct" :sortOrder="-1">
            <Column field="teamName" header="Team" sortable />
            <Column field="wins" header="W" />
            <Column field="losses" header="L" />
            <Column field="ties" header="T" />
            <Column field="winPct" header="PCT" sortable />
            <Column field="pointsFor" header="PF" />
            <Column field="pointsAgainst" header="PA" />
            <Column v-if="props.enableDraftLink" header="Draft" style="width: 140px">
              <template #body="{ data }">
                <Button
                  label="Draft Position"
                  icon="pi pi-sort-amount-up-alt"
                  size="small"
                  outlined
                  @click="goDraftOrder(data as StandingsRow)"
                />
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useStandingsStore } from '@/stores/standingsStore';
import { useRouter } from "vue-router"

interface StandingsRow {
  teamId?: number
  id?: number
  teamName?: string
  abbreviation?: string
  wins?: number
  losses?: number
  ties?: number
  winPct?: number
  pct?: number
  pointsFor?: number
  pointsAgainst?: number
  conference?: string
  division?: string
}
const props = defineProps<{
  title: string
  teams: StandingsRow[]
  seasonYear?: number
  seasonType?: 1 | 2 | 3
  throughWeek?: number
  enableDraftLink?: boolean
}>()

const router = useRouter()
const store = useStandingsStore();

function resolveTeamId(r: StandingsRow): number | null {
  const v = r.teamId ?? r.id
  return typeof v === "number" && Number.isFinite(v) ? v : null
}

function goDraftOrder(r: StandingsRow): void {
  const teamId = resolveTeamId(r)
  if (!teamId) return

  void router.push({
    path: "/draft-order",
    query: {
      teamId: String(teamId),
      seasonYear: props.seasonYear ? String(props.seasonYear) : undefined,
      seasonType: props.seasonType ? String(props.seasonType) : undefined,
      throughWeek: props.throughWeek ? String(props.throughWeek) : undefined,
      mode: "current",
    },
  })
}

onMounted(() => {
  store.fetchStandings(2025, 2);
});

const conferences = computed(() =>
  [...new Set(store.standings.map(s => s.conference))].sort()
);
const divisionsByConference = (conf: string) =>
  [...new Set(store.standings.filter(s => s.conference === conf).map(s => s.division))];
const teamsByDivision = (conf: string, div: string) =>
  store.standings
    .filter(s => s.conference === conf && s.division === div)
    .sort((a, b) => b.winPct - a.winPct);
</script>

<style scoped>
.conference-title { font-size: 1.5em; margin-top: 1em; }
.divisions-container { display: flex; gap: 1em; }
.division-block { flex: 1; }
.textContrast {
  color: #062d92;
}
</style>
