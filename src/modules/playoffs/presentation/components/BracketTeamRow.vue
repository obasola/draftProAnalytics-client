<script setup lang="ts">
export type BracketSideAlign = 'left' | 'right'

export interface BracketTeam {
  id: number
  seed: number
  abbrev: string
  name: string
  logoUrl: string
}

const props = defineProps<{
  team: BracketTeam | null
  align: BracketSideAlign
  isWinner: boolean
  score?: number | null
}>()

const scoreText = (): string => {
  if (props.score === null || props.score === undefined) return ''
  return String(props.score)
}
</script>

<template>
  <div class="team-row" :class="[
    `team-row--${props.align}`,
    props.isWinner ? 'team-row--winner' : '',
    props.team ? '' : 'team-row--empty'
  ]">
    <template v-if="props.team">
      <img class="logo" :src="props.team.logoUrl" :alt="props.team.abbrev" loading="lazy" />
      <span class="abbr">{{ props.team.abbrev }}</span>
      <span class="seed">({{ props.team.seed }})</span>

      <!-- Reserved score slot (stays empty until score exists) -->
      <span class="score" aria-label="Score">{{ scoreText() }}</span>
    </template>

    <template v-else>
      <span class="abbr">TBD</span>
      <span class="seed">(—)</span>
      <span class="score"></span>
    </template>
  </div>
</template>

<style scoped>
.team-row {
  display: flex;
  align-items: center;
  gap: 10px;

  background: transparent;
  border: none;

  padding: 8px 10px;
  color: #ffffff;
}

.team-row--left {
  justify-content: flex-start;
}

.team-row--right {
  justify-content: flex-end;
}

.team-row--empty {
  opacity: 0.75;
}

.team-row--winner .abbr,
.team-row--winner .seed,
.team-row--winner .score {
  filter: brightness(1.08);
}

.logo {
  width: 26px;
  height: 26px;
  object-fit: contain;
  flex: 0 0 auto;
}

.abbr {
  font-weight: 900;
  letter-spacing: 0.6px;
  font-size: 14px;
  line-height: 1;
}

.seed {
  font-weight: 900;
  font-size: 14px;
  line-height: 1;
  opacity: 0.98;
}

/* Score reserves width so alignment is stable even before games start */
.score {
  margin-left: auto;
  min-width: 34px;
  text-align: right;
  font-weight: 900;
  font-size: 14px;
  line-height: 1;
}

/* Mirror: on right-aligned rows, score goes to the "outer" edge */
.team-row--right .score {
  margin-left: 0;
  margin-right: auto;
  text-align: left;
}
</style>
