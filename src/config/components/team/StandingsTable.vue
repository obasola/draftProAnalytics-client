<template>
  <div class="division-box">
    <div class="division-header">
      <h4>{{ title }}</h4>
    </div>

    <div class="division-body">
      <DataTable
        :value="teams"
        dataKey="teamId"
        :rows="10"
        sortField="winPct"
        :sortOrder="-1"
        stripedRows
        responsiveLayout="scroll"
        tableStyle="width: 100%"
      >
        <!-- Team name -->
        <Column field="teamName" header="Team" sortable>
          <template #body="{ data }">
            <span class="left textContrast">{{ data.teamName }}</span>
          </template>
        </Column>

        <!-- Wins / Losses / Ties -->
        <Column field="wins" header="W" sortable />
        <Column field="losses" header="L" sortable />
        <Column field="ties" header="T" sortable />

        <!-- Win Percentage -->
        <Column field="winPct" header="Pct" sortable>
          <template #body="{ data }">{{ formatPct(data) }}</template>
        </Column>

        <!-- PF / PA / +/- -->
        <Column field="pointsFor" header="PF" sortable />
        <Column field="pointsAgainst" header="PA" sortable />
        <Column header="+/-">
          <template #body="{ data }">
            {{ data.pointsFor - data.pointsAgainst }}
          </template>
        </Column>

        <!-- Conf / Div -->
        <Column header="Conf">
          <template #body="{ data }">
            {{ data.conferenceWins }}-{{ data.conferenceLosses }}
          </template>
        </Column>
        <Column header="Div">
          <template #body="{ data }">
            {{ data.divisionWins }}-{{ data.divisionLosses }}
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TeamStandingDto } from '@/types/TeamStandingDto'

defineProps<{
  title: string
  teams: TeamStandingDto[]
}>()

function formatPct(row: TeamStandingDto) {
  const total = row.wins + row.losses + row.ties
  return total > 0 ? (row.wins / total).toFixed(3) : '0.000'
}
</script>

<style scoped>
/* ───────────────────────────────
   Division box sizing & layout
   ─────────────────────────────── */
.division-box {
  background-color: #9e4c03;
  color: #ffffff;
  border-radius: 0.5em;
  padding: 0.5em;
  margin-bottom: 0.5em;

  /* responsive, cross-browser consistent sizing */
  flex: 1 1 48%;
  min-width: 780px;
  max-width: 820px;

  /* spacing handled by parent gap, not manual margin */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
}

/* fine-tune offset of first-column boxes */
.division-box.north,
.division-box.east {
  position: relative;
  left: -12px; /* adjust visually if needed */
}

.division-header {
  margin-bottom: 0.5em;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
}

.division-header h4 {
  margin: 0;
  font-size: 1.1em;
  font-weight: 600;
  color: #ffffff;
  text-transform: uppercase;
}

/* ───────────────────────────────
   Table + text styling
   ─────────────────────────────── */
.p-datatable {
  width: 100%;
}

.textContrast {
  color: #062d92;
  font-weight: bolder;
}

.left {
  text-align: left;
}

/* optional row contrast styles if PrimeVue theme lacks */
.p-datatable-striped tbody tr:nth-child(even) {
  background-color: rgba(255, 255, 255, 0.05);
}
.p-datatable-striped tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.15);
  transition: background-color 0.2s ease;
}
</style>
