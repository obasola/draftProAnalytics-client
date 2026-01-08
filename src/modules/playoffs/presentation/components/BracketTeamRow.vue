<script setup lang="ts">
export type BracketSideAlign = 'left' | 'right'

export interface BracketTeam {
  id: number
  seed: number | null
  name: string
  logoUrl: string
  record: string | null // ✅ replaces abbrev
}

const props = defineProps<{
  team: BracketTeam | null
  align: BracketSideAlign
  isWinner: boolean
  score?: number | null
}>()
</script>

<template>
  <div class="team-row" :class="`team-row--${props.align}`">
    <template v-if="props.team">
      <!-- seed -->
      <span class="seed" aria-label="Seed">{{ props.team.seed ?? '—' }}</span>

      <!-- logo -->
      <img class="logo" :src="props.team.logoUrl" :alt="props.team.name" loading="lazy" />

      <!-- W/L record -->
      <span class="record" aria-label="Record">{{ props.team.record ?? '—' }}</span>

      <!-- score + winner checkmark outside score -->
      <span v-if="props.score !== null && props.score !== undefined" class="score" aria-label="Score">
        {{ props.score }}<span v-if="props.isWinner" class="win-mark" aria-label="Winner"> ✓</span>
      </span>
    </template>

    <template v-else>
      <span class="seed">—</span>
      <span class="record">TBD</span>
    </template>
  </div>
</template>

<style scoped>
.team-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;

  color: #ffffff;
  font-weight: 900;
}

.team-row--left {
  justify-content: flex-start;
}

.team-row--right {
  justify-content: flex-end;
}

.seed {
  min-width: 18px;
  text-align: center;
  font-size: 16px;
  font-weight: 900;
  color: #ffffff;
}

.logo {
  width: 36px;
  height: 36px;
  object-fit: contain;
  flex: 0 0 auto;
}

.record {
  font-size: 16px;
  font-weight: 900;
  letter-spacing: 0.3px;
  color: #ffffff;
}

/* push score to edge */
.score {
  margin-left: auto;
  font-size: 16px;
  font-weight: 900;
  color: #ffffff;
}

.team-row--right .score {
  margin-left: 0;
  margin-right: auto;
}

.win-mark {
  font-weight: 900;
  color: #ffffff;
  padding-left: 2px;
}
</style>
