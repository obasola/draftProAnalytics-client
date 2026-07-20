<script setup lang="ts">
import BracketTeamRow, { type BracketTeam, type BracketSideAlign } from './BracketTeamRow.vue'

export interface BracketGameViewModel {
  id: string
  gameId: number | null
  topTeam: BracketTeam | null
  bottomTeam: BracketTeam | null
  topScore: number | null
  bottomScore: number | null
  winnerTeamId: number | null
}

const props = defineProps<{
  game: BracketGameViewModel
  align: BracketSideAlign
  title?: string
  clickable?: boolean
}>()

const emit = defineEmits<{
  select: [game: BracketGameViewModel]
}>()

const isTopWinner = (): boolean =>
  props.game.winnerTeamId !== null && props.game.topTeam?.id === props.game.winnerTeamId

const isBottomWinner = (): boolean =>
  props.game.winnerTeamId !== null && props.game.bottomTeam?.id === props.game.winnerTeamId
</script>

<template>
  <div
    class="game-card"
    :class="{ 'game-card--clickable': props.clickable }"
    :role="props.clickable ? 'button' : undefined"
    :tabindex="props.clickable ? 0 : undefined"
    @click="props.clickable && emit('select', props.game)"
    @keydown.enter="props.clickable && emit('select', props.game)"
    @keydown.space.prevent="props.clickable && emit('select', props.game)"
  >
    <!-- Title container: transparent, no border -->
    <div v-if="props.title" class="title-container">
      <div class="title">{{ props.title }}</div>
    </div>

    <!-- Parent container: border 1, bg #0b5fe6 -->
    <div class="match-parent">
      <!-- Team container inside parent: no border, bg #054dbc -->
      <div class="match-teams">
        <BracketTeamRow :team="props.game.topTeam" :align="props.align" :isWinner="isTopWinner()"
          :score="props.game.topScore" />

        <div class="break" aria-hidden="true"></div>

        <BracketTeamRow :team="props.game.bottomTeam" :align="props.align" :isWinner="isBottomWinner()"
          :score="props.game.bottomScore" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-card {
  width: 100%;
}

.game-card--clickable {
  cursor: pointer;
  transition: transform 160ms ease, filter 160ms ease;
}

.game-card--clickable:hover,
.game-card--clickable:focus-visible {
  transform: translateY(-2px);
  filter: brightness(1.12);
  outline: none;
}

.game-card--clickable:focus-visible .match-parent {
  box-shadow: 0 0 0 3px rgba(255, 210, 124, 0.72);
}

.title-container {
  background: transparent;
  border: none;
  padding: 0;
  margin: 0 0 6px 0;
}

.title {
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.4px;
  color: #ff2b2b;
}

.match-parent {
  border-radius: 12px;
  background: #0b5fe6;
  border: 1px solid rgba(255, 255, 255, 0.28);
  padding: 6px;
}

.match-teams {
  border-radius: 10px;
  background: #054dbc;
  border: none;
  overflow: hidden;
  padding: 4px 0;
}

.break {
  height: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.22);
  margin: 0 10px;
}
</style>
