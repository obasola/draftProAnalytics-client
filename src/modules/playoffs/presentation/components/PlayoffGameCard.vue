<!-- src/modules/playoffs/presentation/components/PlayoffGameCard.vue -->
<script setup lang="ts">
import { computed } from "vue";
import type { PlayoffMatchup } from "../../domain/PlayoffTypes";
import { useStandingsStore } from "@/stores/standingsStore";
import { TeamStandingDto } from "@/types/TeamStandingDto";

interface Props {
  game: PlayoffMatchup;
}

const props = defineProps<Props>();
const standingsStore = useStandingsStore();

const homeStanding = computed<TeamStandingDto | null>(() =>
  props.game.homeTeamId != null
    ? standingsStore.getByTeamId(props.game.homeTeamId)
    : null
);

const awayStanding = computed<TeamStandingDto | null>(() =>
  props.game.awayTeamId != null
    ? standingsStore.getByTeamId(props.game.awayTeamId)
    : null
);

const homeLogoInfo = computed(() =>
  standingsStore.getLogoInfoByTeamId(props.game.homeTeamId)
);

const awayLogoInfo = computed(() =>
  standingsStore.getLogoInfoByTeamId(props.game.awayTeamId)
);

const homeDisplayName = computed<string>(() =>
  standingsStore.getDisplayNameByTeamId(props.game.homeTeamId)
);

const awayDisplayName = computed<string>(() =>
  standingsStore.getDisplayNameByTeamId(props.game.awayTeamId)
);

const homeRecord = computed<string | null>(() =>
  standingsStore.getRecordByTeamId(props.game.homeTeamId)
);

const awayRecord = computed<string | null>(() =>
  standingsStore.getRecordByTeamId(props.game.awayTeamId)
);

const hasScore = computed<boolean>(
  () => props.game.homeScore != null && props.game.awayScore != null
);

const isHomeWinner = computed<boolean>(
  () =>
    hasScore.value &&
    props.game.winnerTeamId != null &&
    props.game.winnerTeamId === props.game.homeTeamId
);

const isAwayWinner = computed<boolean>(
  () =>
    hasScore.value &&
    props.game.winnerTeamId != null &&
    props.game.winnerTeamId === props.game.awayTeamId
);
</script>

<template>
  <article class="playoff-game-card">
    <header class="game-header">
      <span class="game-slot">{{ game.slot }}</span>
      <span class="game-round">{{ game.round }}</span>
    </header>

    <div class="team-row" :class="{ 'team-row--winner': isHomeWinner }">
      <div class="team-seed" v-if="game.homeSeed != null">#{{ game.homeSeed }}</div>

      <img
        v-if="homeLogoInfo?.logoUrl"
        :src="homeLogoInfo.logoUrl"
        alt=""
        class="team-logo"
      />

      <div class="team-name-score">
        <div class="team-text">
          <span class="team-name">
            {{ homeDisplayName }}
          </span>
          <span v-if="homeRecord" class="team-record">
            ({{ homeRecord }})
          </span>
        </div>
        <span v-if="game.homeScore != null" class="team-score">
          {{ game.homeScore }}
        </span>
      </div>
    </div>

    <div class="team-row" :class="{ 'team-row--winner': isAwayWinner }">
      <div class="team-seed" v-if="game.awaySeed != null">#{{ game.awaySeed }}</div>

      <img
        v-if="awayLogoInfo?.logoUrl"
        :src="awayLogoInfo.logoUrl"
        alt=""
        class="team-logo"
      />

      <div class="team-name-score">
        <div class="team-text">
          <span class="team-name">
            {{ awayDisplayName }}
          </span>
          <span v-if="awayRecord" class="team-record">
            ({{ awayRecord }})
          </span>
        </div>
        <span v-if="game.awayScore != null" class="team-score">
          {{ game.awayScore }}
        </span>
      </div>
    </div>

    <footer class="game-footer">
      <span v-if="game.gameDate" class="game-date">
        {{ new Date(game.gameDate).toLocaleString() }}
      </span>
      <span v-else class="game-date game-date--tbd">
        Date TBD
      </span>
    </footer>
  </article>
</template>

<style scoped>
.playoff-game-card {
  border-radius: 0.75rem;
  border: 1px solid var(--border-color, #222);
  padding: 0.7rem 0.9rem;
  background-color: #254290;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.game-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  font-weight: 600;
  opacity: 0.9;
}

.team-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.25rem 0.1rem;
}

.team-row--winner {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 0.4rem;
}

.team-seed {
  font-size: 0.9rem;
  opacity: 0.9;
  min-width: 2.2rem;
  text-align: right;
}

.team-logo {
  width: 40px;
  height: 40px;
  object-fit: contain;
  vertical-align: middle;
}

.team-name-score {
  display: flex;
  justify-content: space-between;
  flex: 1;
  gap: 0.5rem;
}

.team-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.team-name {
  font-size: 1.0rem;
  font-weight: 600;
}

.team-record {
  font-size: 0.85rem;
  opacity: 0.9;
}

.team-score {
  font-weight: 700;
  font-size: 1.05rem;
}

.game-footer {
  display: flex;
  justify-content: flex-end;
  font-size: 0.8rem;
  opacity: 0.85;
}

.game-date--tbd {
  font-style: italic;
}
</style>
