<template>
  <Card>
    <template #title>
      <span class="font-semibold">{{ title }}</span>
    </template>

   <table class="w-full text-sm border border-surface-200 rounded-md bg-surface-0 text-surface-700">

      <thead>
        <tr class="text-left border-b border-surface-300">
          <th class="px-2 py-1">Team</th>
          <th class="px-2 py-1">W</th>
          <th class="px-2 py-1">L</th>
          <th class="px-2 py-1">T</th>
          <th class="px-2 py-1">Pct</th>
          <th class="px-2 py-1">PF</th>
          <th class="px-2 py-1">PA</th>
          <th class="px-2 py-1">+/-</th>
          <th class="px-2 py-1">Conf</th>
          <th class="px-2 py-1">Div</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="team in teams"
          :key="team.teamId"
          class="border-b border-surface-200 hover:bg-surface-100"
        >
          <td class="px-2 py-1 font-medium">{{ team.teamName }}</td>
          <td class="px-2 py-1 text-center">{{ team.wins }}</td>
          <td class="px-2 py-1 text-center">
            <span class="relative group cursor-help">
              {{ team.losses }}
              <span
                v-if="hasOverlap(team)"
                class="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded px-2 py-1
                       top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap z-10"
              >
                One or more conference W/L is also a division W/L
              </span>
            </span>
          </td>
          <td class="px-2 py-1 text-center">{{ team.ties }}</td>
          <td class="px-2 py-1 text-center">
            {{
              team.wins + team.losses + team.ties > 0
                ? (team.wins / (team.wins + team.losses + team.ties)).toFixed(3)
                : '0.000'
            }}
          </td>
          <td class="px-2 py-1 text-center">{{ team.pointsFor }}</td>
          <td class="px-2 py-1 text-center">{{ team.pointsAgainst }}</td>
          <td class="px-2 py-1 text-center">
            {{ (team.pointsFor ?? 0) - (team.pointsAgainst ?? 0) }}
          </td>
          <td class="px-2 py-1 text-center">
            {{ team.conferenceWins }}-{{ team.conferenceLosses }}
          </td>
          <td class="px-2 py-1 text-center">
            {{ team.divisionWins }}-{{ team.divisionLosses }}
          </td>
        </tr>
      </tbody>
    </table>
  </Card>
</template>

<script setup lang="ts">
import type { TeamStandingDto } from '@/types/TeamStandingDto'

defineProps<{ title: string; teams: TeamStandingDto[] }>()

function hasOverlap(t: TeamStandingDto) {
  return (
    t.divisionWins + t.divisionLosses > 0 &&
    t.conferenceWins + t.conferenceLosses > 0
  )
}
</script>
