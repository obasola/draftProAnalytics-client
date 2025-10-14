<template>
  <div class="division-box">
    <div class="division-header">
      <h4>{{ title }}</h4>
    </div>

    <div class="division-body">
      <table class="standings-table">
        <thead>
          <tr>
            <th>Team</th>
            <th>W</th>
            <th>L</th>
            <th>T</th>
            <th>Pct</th>
            <th>PF</th>
            <th>PA</th>
            <th>+/-</th>
            <th>Conf</th>
            <th>Div</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="team in teams" :key="team.teamId">
            <td class="left">{{ team.teamName }}</td>
            <td>{{ team.wins }}</td>
            <td>{{ team.losses }}</td>
            <td>{{ team.ties }}</td>
            <td>{{ formatPct(team) }}</td>
            <td>{{ team.pointsFor }}</td>
            <td>{{ team.pointsAgainst }}</td>
            <td>{{ team.pointsFor - team.pointsAgainst }}</td>
            <td>{{ team.conferenceWins }}-{{ team.conferenceLosses }}</td>
            <td>{{ team.divisionWins }}-{{ team.divisionLosses }}</td>
          </tr>
        </tbody>
      </table>
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
.division-box {
  background-color: #9e4c03;
  color: #ffffff;
  border-radius: 0.75em;
  padding: 0.75em 1em;
  margin-bottom: 0.5em;
  
  /* 👇 Add this line for right-side spacing */
  margin-right: 1em;

  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
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

.standings-table {
  width: 560px;
  border-collapse: collapse;
  background: transparent;
  color: #ffffff;
  font-size: 0.9em;
}

.standings-table thead {
  background-color: #062d92;
}

.standings-table th,
.standings-table td {
  padding: 0.35em 0.6em;
  text-align: center;
}

.standings-table th.left,
.standings-table td.left {
  text-align: left;
}

.standings-table tbody tr:nth-child(even) {
  background-color: rgba(255, 255, 255, 0.05);
}

.standings-table tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.15);
  transition: background-color 0.2s ease;
}

.standings-table th {
  color: #ffffff;
  font-weight: 600;
  border-bottom: 2px solid rgba(255, 255, 255, 0.3);
}

.standings-table td {
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}
</style>