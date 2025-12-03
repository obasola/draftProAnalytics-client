<!-- src/modules/playoffs/presentation/views/PlayoffBracketView.vue -->
<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import Button from "primevue/button";

import { usePlayoffStore } from "../../application/playoffStore";
import { useStandingsStore } from "@/stores/standingsStore";
import { useAuthStore } from "@/stores/authStore";
import PlayoffGameCard from "../components/PlayoffGameCard.vue";
import type { PlayoffRoundGroup } from "../../domain/PlayoffTypes";
import type { TeamStandingDto } from "@/types/TeamStandingDto";

const playoffStore = usePlayoffStore();
const standingsStore = useStandingsStore();
const auth = useAuthStore();

const { bracket, loading, error, mode } = storeToRefs(playoffStore);

const selectedSeasonYear = ref<number>(2025);
const SEASON_TYPE_REGULAR = 2;

const canRefresh = computed<boolean>(() => (auth.role ?? 1) >= 2);
const hasBracket = computed<boolean>(() => bracket.value != null);

function getRound(
  groups: PlayoffRoundGroup[] | undefined,
  round: "WILDCARD" | "DIVISIONAL" | "CONFERENCE"
) {
  return groups?.find((r) => r.round === round)?.matchups ?? [];
}

// Division winners
const afcDivisionWinners = computed<TeamStandingDto[]>(() =>
  standingsStore.getDivisionWinnersByConference("AFC")
);
const nfcDivisionWinners = computed<TeamStandingDto[]>(() =>
  standingsStore.getDivisionWinnersByConference("NFC")
);

async function loadBracket(targetMode: "actual" | "projected" = mode.value): Promise<void> {
  playoffStore.setMode(targetMode);

  // Always refresh standings first (team names, records, logos)
  await standingsStore.fetchStandings(selectedSeasonYear.value, SEASON_TYPE_REGULAR);

  await playoffStore.fetchBracket(selectedSeasonYear.value);
}

async function handleSimulateNow(): Promise<void> {
  await loadBracket("projected");
}

async function handleShowActual(): Promise<void> {
  await loadBracket("actual");
}

async function handleRefresh(): Promise<void> {
  await loadBracket(mode.value);
}

onMounted(async () => {
  await loadBracket("projected"); // default mode
});
</script>


<template>
    <div class="playoff-bracket-page">
        <header class="playoff-header">
            <div class="header-left">
                <h2>NFL Playoff Bracket — {{ selectedSeasonYear }}</h2>
            </div>

            <div class="header-actions">
                <Button label="Simulate: If Playoffs Started Today" icon="pi pi-play"
                    class="p-button-sm p-button-rounded" @click="handleSimulateNow" />
                  <Button
                        label="Show Actual Bracket"
                        icon="pi pi-flag"
                        class="p-button-sm p-button-rounded p-button-info"
                        @click="handleShowActual"
                    />

                <Button
                    v-if="canRefresh"
                    label="Refresh Data"
                    icon="pi pi-refresh"
                    class="p-button-sm p-button-rounded p-button-secondary"
                    @click="handleRefresh"
                />
            </div>
        </header>

        <div v-if="loading" class="playoff-loading">
            Loading bracket…
        </div>

        <div v-else-if="error" class="playoff-error">
            {{ error }}
        </div>

        <div v-else-if="hasBracket && bracket" class="playoff-bracket-grid">
            <!-- AFC -->
            <section class="conference-column conference-column--afc">
                <h3 class="conference-title">AFC</h3>

                <div class="round-column">
                    <h4>Wild Card</h4>
                    <PlayoffGameCard v-for="game in getRound(bracket.afcRounds, 'WILDCARD')" :key="game.slot"
                        :game="game" />
                </div>

                <div class="round-column">
                    <h4>Divisional</h4>

                    <!-- Division winners as it stands now -->
                    <div v-if="afcDivisionWinners.length" class="division-winners">
                        <h5 class="division-winners-title">
                            Division Winners (current)
                        </h5>

                        <div v-for="(team, index) in afcDivisionWinners" :key="team.teamId" class="division-winner-row">
                            <span class="division-seed">#{{ index + 1 }}</span>

                            <img v-if="standingsStore.getLogoInfoByTeamId(team.teamId)?.logoUrl"
                                :src="standingsStore.getLogoInfoByTeamId(team.teamId)!.logoUrl" alt=""
                                class="division-logo" />

                            <span class="division-name">
                                {{ standingsStore.getDisplayNameByTeamId(team.teamId) }}
                            </span>

                            <span class="division-record">
                                ({{ standingsStore.getRecordByTeamId(team.teamId) }})
                            </span>
                        </div>
                    </div>

                    <!-- Actual Divisional games when present -->
                    <PlayoffGameCard v-for="game in getRound(bracket.afcRounds, 'DIVISIONAL')" :key="game.slot"
                        :game="game" />
                </div>


                <div class="round-column">
                    <h4>Conference</h4>
                    <PlayoffGameCard v-for="game in getRound(bracket.afcRounds, 'CONFERENCE')" :key="game.slot"
                        :game="game" />
                </div>
            </section>

            <!-- Super Bowl -->
            <section class="superbowl-column">
                <h3 class="conference-title">Super Bowl</h3>
                <PlayoffGameCard v-if="bracket.superBowl" :game="bracket.superBowl" />
                <div v-else class="placeholder-card">
                    Super Bowl matchup TBD
                </div>
            </section>

            <!-- NFC -->
            <section class="conference-column conference-column--nfc">
                <h3 class="conference-title">NFC</h3>

                <div class="round-column">
                    <h4>Wild Card</h4>
                    <PlayoffGameCard v-for="game in getRound(bracket.nfcRounds, 'WILDCARD')" :key="game.slot"
                        :game="game" />
                </div>

                <div class="round-column">
                    <h4>Divisional</h4>
                    <PlayoffGameCard
                        v-for="game in getRound(bracket.nfcRounds, 'DIVISIONAL')"
                        :key="game.slot"
                        :game="game"
                    />
                </div>


                <div class="round-column">
                    <h4>Conference</h4>
                    <PlayoffGameCard v-for="game in getRound(bracket.nfcRounds, 'CONFERENCE')" :key="game.slot"
                        :game="game" />
                </div>
            </section>
        </div>

        <div v-else class="playoff-empty">
            No playoff bracket data available.
        </div>
    </div>
</template>

<style scoped>
.playoff-bracket-page {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    background-color: #4763ac;
    padding: 1rem;
    border-radius: 1rem;
}

.playoff-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-actions {
    display: flex;
    gap: 0.5rem;
}

.playoff-bracket-grid {
    display: grid;
    grid-template-columns: 1.5fr 1fr 1.5fr;
    gap: 1.5rem;
    align-items: stretch;
}

.conference-column {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.conference-title {
    text-align: center;
    font-weight: 700;
    margin-bottom: 0.5rem;
}

.round-column {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.round-column h4 {
    text-align: center;
    margin-bottom: 0.25rem;
}

.superbowl-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
}

.placeholder-card {
    border-radius: 0.5rem;
    padding: 0.75rem;
    border: 1px dashed var(--border-color, #666);
    text-align: center;
    font-style: italic;
}

.playoff-loading,
.playoff-error,
.playoff-empty {
    text-align: center;
}
.division-winners {
  margin-bottom: 0.5rem;
  padding: 0.4rem 0.5rem;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 0.5rem;
}

.division-winners-title {
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  text-align: center;
}

.division-winner-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.15rem 0;
}

.division-seed {
  font-size: 0.85rem;
  min-width: 1.7rem;
  text-align: right;
}

.division-logo {
  width: 26px;
  height: 26px;
  object-fit: contain;
}

.division-name {
  font-size: 0.9rem;
  font-weight: 600;
}

.division-record {
  margin-left: auto;
  font-size: 0.8rem;
  opacity: 0.9;
}

</style>
