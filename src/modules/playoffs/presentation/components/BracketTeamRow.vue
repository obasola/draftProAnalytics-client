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
}>()
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
      <span class="seed" aria-label="Seed">{{ props.team.seed }}</span>
    </template>

    <template v-else>
      <span class="abbr">TBD</span>
      <span class="seed">—</span>
    </template>
  </div>
</template>

<style scoped>
.team-row {
  display: flex;
  align-items: center;
  gap: 10px;

  /* no border/background here: this sits inside match-teams */
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
.team-row--winner .seed {
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
}

.seed {
  margin-left: auto;
  font-weight: 900;
  min-width: 28px;
  text-align: center;
  border-radius: 10px;
  padding: 3px 8px;
  background: rgba(0, 0, 0, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #ffffff;
}

.team-row--right .seed {
  margin-left: 0;
  margin-right: auto;
}
</style>
