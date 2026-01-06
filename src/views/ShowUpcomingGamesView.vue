<!-- src/views/ShowUpcomingGamesView.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUpcomingGamesController } from '@/composables/schedule/useUpcomingGamesController';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import type { UpcomingGameUI } from '@/util/schedule/upcomingGamesHelpers';

const controller = useUpcomingGamesController();
const { loading, runImportScoresWeek } = controller;

const staticWeekOptions: { label: string; value: number }[] = [
  { label: 'Preseason', value: 0 },
  ...Array.from({ length: 18 }, (_, i) => ({
    label: `Week ${i + 1}`,
    value: i + 1,
  })),
  { label: 'Postseason', value: 99 },
];

const expandedRows = ref<UpcomingGameUI[]>([]);

onMounted(() => {
  // optional: preload current week here if you want
  // controller.submitControls();
});
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

      <div style="margin-right: -2.0em">
        <button class="submit-btn" @click="controller.submitControls()">
          Submit
        </button>

        <button
          class="refresh-btn"
          :disabled="loading"
          @click="controller.runImportScoresWeek"
        >
          Refresh
        </button>
      </div>
    </div>

    <!-- TABLE -->
    <DataTable
      :value="controller.store.games"
      :loading="controller.store.isLoading"
      tableStyle="min-width: 100%"
      rowHover
      dataKey="id"
      v-model:expandedRows="expandedRows"
      :rowClass="(data) => controller.isRecentlyUpdated(data.id) ? 'score-updated' : ''"
    >
      <!-- EXPANDER -->
      <Column type="expander" headerStyle="width: 3rem" />

      <!-- DATE/TIME COLUMN -->
      <Column header="Date/Time" style="width: 160px">
        <template #body="{ data }">
          <div class="flex flex-col leading-tight">
            <span class="date-day">{{ data.dateFormatted.day }}&nbsp;&nbsp;</span>
            <span class="date-time">{{ data.dateFormatted.time }}</span>
          </div>
        </template>
      </Column>

      <!-- MATCHUP COLUMN -->
      <Column header="Matchup">
        <template #body="{ data }">
          <div 
            :class="['matchup-row', { 'score-highlight': controller.isRecentlyUpdated(data.id) }]"
          >
            <!-- AWAY TEAM -->
            <div class="team-horizontal">
              <img :src="data.awayLogo" class="team-logo" />
              <span :class="['team-name', data.awayWinner ? 'winner-text' : 'loser-text']">
                {{ data.awayTeamName }}
                <span class="score" v-if="data.awayScore !== null">({{ data.awayScore }})</span>
                <span v-if="data.awayWinner" class="winner-check">✔</span>
              </span>
            </div>

            <span class="vs">@</span>

            <!-- HOME TEAM -->
            <div class="team-horizontal">
              <img :src="data.homeLogo" class="team-logo" />
              <span :class="['team-name', data.homeWinner ? 'winner-text' : 'loser-text']">
                {{ data.homeTeamName }}
                <span class="score" v-if="data.homeScore !== null">({{ data.homeScore }})</span>
                <span v-if="data.homeWinner" class="winner-check">✔</span>
              </span>
            </div>
          </div>
        </template>
      </Column>

      <!-- STATUS COLUMN -->
      <Column header="Status" style="width: 140px">
        <template #body="{ data }">
          <div class="status-pill" :data-status="data.status">
            <span class="status-main">{{ data.status }}</span>
            <span v-if="data.statusDetail && data.statusDetail !== data.status" class="status-detail">
              {{ data.statusDetail }}
            </span>
          </div>
        </template>
      </Column>

      <!-- SCORING SUMMARY COLUMN -->
      <Column header="Scoring">
        <template #body="{ data }">
          <div class="scoring-cell">
            <span v-if="data.scoringSummaryShort">
              {{ data.scoringSummaryShort }}
            </span>
            <span v-else class="no-scoring">—</span>
          </div>
        </template>
      </Column>

      <!-- EXPANSION TEMPLATE: FULL SCORING DETAIL -->
      <template #expansion="{ data }">
        <div class="scoring-expansion">
          <template v-if="data.scoringDetails && data.scoringDetails.length">
            <h4 class="scoring-header">Scoring Plays</h4>
            <ul class="scoring-list">
              <li v-for="(line, idx) in data.scoringDetails" :key="idx">
                {{ line }}
              </li>
            </ul>
          </template>
          <template v-else>
            <em>No scoring plays yet.</em>
          </template>
        </div>
      </template>
    </DataTable>
  </div>
</template>

<style scoped>
.controls-row {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.control-select {
  padding: 0.35rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid #444;
  background-color: #111;
  color: #f5f5f5;
  width: 25%
}

.submit-btn,
.refresh-btn {
  padding: 0.4rem 0.9rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.submit-btn {
  background-color: #054dbd;
  color: #fff;
}

.refresh-btn {
  background-color: #333;
  color: #eee;
}

.refresh-btn[disabled] {
  opacity: 0.6;
  cursor: default;
}

/* Score highlight on matchup row */
.score-highlight {
  animation: scoreFlash 3s ease-in-out;
  background-color: rgba(255, 215, 0, 0.3);
  padding: 0.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
}

@keyframes scoreFlash {
  0% {
    background-color: rgba(255, 215, 0, 0.4);
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
  }
  50% {
    background-color: rgba(255, 215, 0, 0.3);
    box-shadow: 0 0 15px rgba(255, 215, 0, 0.6);
  }
  100% {
    background-color: rgba(255, 215, 0, 0);
    box-shadow: none;
  }
}

/* Also keep row-level highlight in case it works */
:deep(.score-updated) {
  animation: scoreFlash 3s ease-in-out;
  background-color: rgba(255, 215, 0, 0.2) !important;
}

/* Date/time */
.date-day {
  font-weight: 600;
  font-size: 0.9rem;
}
.date-time {
  font-size: 0.85rem;
  color: #ccc;
}

/* Matchup */
.matchup-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1.25rem;
}

.team-horizontal {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}

.team-logo {
  width: 60px;
  height: 60px;
  object-fit: contain;
  object-position: center;
}

.team-name {
  font-weight: 500;
  font-size: 1rem;
  white-space: nowrap;
}

.vs {
  font-weight: 600;
  color: #ddd;
  padding: 0 0.5rem;
}

.winner-check {
  color: #00e600;
  margin-left: 4px;
  font-size: 1rem;
  font-weight: bold;
}

.score {
  font-size: larger;
  color: yellow;
}

/* Status pill */
.status-pill {
  display: inline-flex;
  flex-direction: column;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  background-color: #222;
  font-size: 0.8rem;
}

.status-pill[data-status='In Progress'] {
  background-color: #14532d;
}

.status-pill[data-status='Final'] {
  background-color: #1f2937;
}

.status-pill[data-status='Postponed'] {
  background-color: #7f1d1d;
}

.status-main {
  font-weight: 600;
  color: #f9fafb;
}

.status-detail {
  font-size: 0.75rem;
  color: #e5e7eb;
}

/* Scoring cell + expansion */
.scoring-cell {
  font-size: 0.85rem;
  line-height: 1.2;
  max-height: 3.4rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

.no-scoring {
  color: #777;
  font-style: italic;
}

.scoring-expansion {
  padding: 0.75rem 1rem;
  background-color: rgba(0, 0, 0, 0.35);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.scoring-header {
  margin: 0 0 0.5rem;
  font-weight: 600;
}

.scoring-list {
  margin: 0;
  padding-left: 1.25rem;
  font-size: 0.85rem;
}
</style>