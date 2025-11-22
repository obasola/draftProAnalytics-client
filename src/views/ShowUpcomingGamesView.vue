<!-- src/views/ShowUpcomingGamesView.vue -->
<script setup lang="ts">
import { ref, onMounted, Ref } from 'vue'
import { useUpcomingGamesController } from '@/composables/schedule/useUpcomingGamesController'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

// ✅ CREATE THE CONTROLLER (it handles the store internally)
const controller = useUpcomingGamesController()

const staticWeekOptions: { label: string; value: number }[] = [
  { label: 'Preseason', value: 0 },
  ...Array.from({ length: 18 }, (_, i) => ({
    label: `Week ${i + 1}`,
    value: i + 1,
  })),
  { label: 'Postseason', value: 99 },
]

onMounted(() => {
})
</script>

<template>
  <div class="p-4">
    <h2 class="text-2xl font-bold mb-3">Upcoming NFL Games</h2>

    <!-- FILTER CONTROLS -->
    <div class="controls-row">

      <!-- YEAR -->
      <select v-model="controller.selectedYear.value" class="control-select">
        <option v-for="y in [2023, 2024, 2025, 2026, 2027]" :key="y" :value="y">
          {{ y }}
        </option>
      </select>

      <!-- SEASON TYPE -->
      <select v-model="controller.selectedSeasonType.value" class="control-select">
        <option value="1">Preseason</option>
        <option value="2">Regular Season</option>
        <option value="3">Postseason</option>
      </select>

      <!-- WEEK -->
      <select v-model="controller.selectedWeek.value" class="control-select">
        <option v-for="opt in staticWeekOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>

      <button class="submit-btn" @click="controller.submitControls()">
        Submit
      </button>

      <button
        icon="pi pi-cloud-download" class="refresh-btn"
        :loading="controller.loading" @click="controller.runImportScoresWeek">
        Refresh
      </button>
  
    </div>

    <DataTable :value="controller.store.games" :loading="controller.store.isLoading" tableStyle="min-width: 100%"
      rowHover>
      <!-- DATE/TIME COLUMN -->
      <Column header="Date/Time" style="width: 160px">
        <template #body="{ data }">
          <div class="flex flex-col leading-tight">
            <span class="date-day">{{ data.dateFormatted.day }}</span>
            <span class="date-time">{{ data.dateFormatted.time }}</span>
          </div>
        </template>
      </Column>

      <!-- MATCHUP COLUMN -->
      <Column header="Matchup">
        <template #body="{ data }">
          <div class="flex items-center gap-3">

            <!-- AWAY TEAM -->
            <img :src="data.awayLogo" class="team-logo" />

            <span :class="['team-name', data.awayWinner ? 'winner-text' : 'loser-text']">
              {{ data.awayTeamName }}
              <span v-if="data.awayScore !== null"> ({{ data.awayScore }}) </span>
              <span v-if="data.awayWinner" class="winner-check">✔</span>
            </span>

            <span class="px-2">@</span>

            <!-- HOME TEAM -->
            <img :src="data.homeLogo" class="team-logo" />

            <span :class="['team-name', data.homeWinner ? 'winner-text' : 'loser-text']">
              {{ data.homeTeamName }}
              <span v-if="data.homeScore !== null"> ({{ data.homeScore }}) </span>
              <span v-if="data.homeWinner" class="winner-check">✔</span>
            </span>

          </div>
        </template>
      </Column>


      <!-- STATUS COLUMN -->
      <Column header="Status" style="width: 140px">
        <template #body="{ data }">
          <span :class="[
            'status-tag',
            data.status === 'Final'
              ? 'final'
              : data.status === 'In Progress'
                ? 'in-progress'
                : 'scheduled'
          ]">
            {{ data.statusDetail || data.status }}
          </span>
        </template>
      </Column>
    </DataTable>

  </div>
</template>

<style scoped>
img {
  object-fit: contain;
}

.toolbar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
}

.small-input :deep(.p-inputtext),
.small-input :deep(.p-dropdown),
.small-input :deep(.p-dropdown-label) {
  height: 32px !important;
  padding: 4px 8px !important;
  font-size: 14px;
}

.small-input :deep(.p-dropdown-trigger) {
  width: 24px;
}

label {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 3px;
}

.team-logo {
  width: 110px;
  height: 70px;
  object-fit: contain;
  object-position: center;
}

/* DATE / TIME */
.date-day {
  font-weight: 600;
  color: #fff;
}

.date-time {
  color: #bbb;
  font-size: 0.85rem;
}

/* TEAM LOGOS */
.team-logo {
  width: 60px;
  height: 60px;
  object-fit: contain;
  object-position: center;
}

/* TEAM NAME TEXT */
.team-name {
  font-weight: 500;
  font-size: 1rem;
}

/* WINNER = Red Bold */
.winner-text {
  color: #ff4d4d;
  font-weight: 700;
}

/* LOSER = White */
.loser-text {
  color: #fff;
  opacity: 0.9;
}

/* CHECKMARK */
.winner-check {
  color: #00e600;
  margin-left: 4px;
  font-size: 1rem;
  font-weight: bold;
}

/* STATUS TAGS */
.status-tag {
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-tag.in-progress {
  background: #e63946;
  color: #fff;
}

.status-tag.final {
  background: #2a9d8f;
  color: #fff;
}

.status-tag.scheduled {
  background: #777;
  color: #000;
}

.controls-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.25rem;
  align-items: center;
}

.control-select {
  background: #222;
  color: #fff;
  border: 1px solid #444;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  font-size: 1.05rem;
}

.submit-btn {
  background: #0a84ff;
  color: #fff;
  padding: 0.45rem 0.8rem;
  font-size: 1.05rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}
.refresh-btn {
  background: green;
  color: #fff;
  padding: 0.45rem 0.8rem;
  font-size: 1.05rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}


.date-day {
  color: #fff;
  font-weight: 600;
}

.date-time {
  color: #bbb;
  font-size: 0.85rem;
}
</style>