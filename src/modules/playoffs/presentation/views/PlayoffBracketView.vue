<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import BracketGameCard, { type BracketGameViewModel } from '../components/BracketGameCard.vue'
import type { BracketTeam } from '../components/BracketTeamRow.vue'

type Conference = 'NFC' | 'AFC'
type Align = 'left' | 'right'
type BracketTab = 'AFC' | 'NFC' | 'FULL'

/** Tabs: AFC | NFC | Full */
const activeIndex = ref<number>(2) // default: Full
const activeTab = computed<BracketTab>(() => {
  if (activeIndex.value === 0) return 'AFC'
  if (activeIndex.value === 1) return 'NFC'
  return 'FULL'
})

const showAfc = computed<boolean>(() => activeTab.value === 'AFC' || activeTab.value === 'FULL')
const showNfc = computed<boolean>(() => activeTab.value === 'NFC' || activeTab.value === 'FULL')

interface WildCardScores {
  game54: { top: number | null; bottom: number | null } // top=seed5 bottom=seed4
  game63: { top: number | null; bottom: number | null } // top=seed6 bottom=seed3
  game72: { top: number | null; bottom: number | null } // top=seed7 bottom=seed2
}

interface DivisionalScores {
  game1L: { top: number | null; bottom: number | null } // 1vLowestRemaining
  gameX: { top: number | null; bottom: number | null } // other winners
}

interface ConferenceScores {
  gameCC: { top: number | null; bottom: number | null }
}

interface BracketInput {
  teamsBySeed: Record<1 | 2 | 3 | 4 | 5 | 6 | 7, BracketTeam>
  wildCard: WildCardScores
  divisional: DivisionalScores
  conference: ConferenceScores
}

const winnerIdFromScores = (
  topTeam: BracketTeam | null,
  bottomTeam: BracketTeam | null,
  topScore: number | null,
  bottomScore: number | null
): number | null => {
  if (!topTeam || !bottomTeam) return null
  if (topScore === null || bottomScore === null) return null
  if (topScore === bottomScore) return null
  return topScore > bottomScore ? topTeam.id : bottomTeam.id
}

const pickTeamById = (teams: BracketTeam[], id: number | null): BracketTeam | null => {
  if (id === null) return null
  return teams.find(t => t.id === id) ?? null
}

const sortBySeedAsc = (a: BracketTeam, b: BracketTeam): number => a.seed - b.seed

const computeConferenceBracket = (conf: Conference, input: BracketInput) => {
  const seed = input.teamsBySeed
  const allTeams: BracketTeam[] = Object.values(seed).slice().sort(sortBySeedAsc)

  const wcGames: BracketGameViewModel[] = [
    {
      id: `${conf}-WC-54`,
      topTeam: seed[5],
      bottomTeam: seed[4],
      topScore: input.wildCard.game54.top,
      bottomScore: input.wildCard.game54.bottom,
      winnerTeamId: null
    },
    {
      id: `${conf}-WC-63`,
      topTeam: seed[6],
      bottomTeam: seed[3],
      topScore: input.wildCard.game63.top,
      bottomScore: input.wildCard.game63.bottom,
      winnerTeamId: null
    },
    {
      id: `${conf}-WC-72`,
      topTeam: seed[7],
      bottomTeam: seed[2],
      topScore: input.wildCard.game72.top,
      bottomScore: input.wildCard.game72.bottom,
      winnerTeamId: null
    }
  ].map(g => ({
    ...g,
    winnerTeamId: winnerIdFromScores(g.topTeam, g.bottomTeam, g.topScore, g.bottomScore)
  }))

  const wcWinners: BracketTeam[] = wcGames
    .map(g => pickTeamById(allTeams, g.winnerTeamId))
    .filter((t): t is BracketTeam => t !== null)

  const lowestRemaining =
    wcWinners.length === 3 ? wcWinners.slice().sort((a, b) => b.seed - a.seed)[0] : null

  const otherTwo =
    wcWinners.length === 3
      ? wcWinners.filter(t => t.id !== lowestRemaining?.id).slice().sort(sortBySeedAsc)
      : []

  const divGame1: BracketGameViewModel = {
    id: `${conf}-DIV-1L`,
    topTeam: lowestRemaining,
    bottomTeam: seed[1],
    topScore: input.divisional.game1L.top,
    bottomScore: input.divisional.game1L.bottom,
    winnerTeamId: null
  }
  divGame1.winnerTeamId = winnerIdFromScores(
    divGame1.topTeam,
    divGame1.bottomTeam,
    divGame1.topScore,
    divGame1.bottomScore
  )

  const divGame2: BracketGameViewModel = {
    id: `${conf}-DIV-X`,
    topTeam: otherTwo[1] ?? null,
    bottomTeam: otherTwo[0] ?? null,
    topScore: input.divisional.gameX.top,
    bottomScore: input.divisional.gameX.bottom,
    winnerTeamId: null
  }
  divGame2.winnerTeamId = winnerIdFromScores(
    divGame2.topTeam,
    divGame2.bottomTeam,
    divGame2.topScore,
    divGame2.bottomScore
  )

  const divWinners: BracketTeam[] = [
    pickTeamById(allTeams, divGame1.winnerTeamId),
    pickTeamById(allTeams, divGame2.winnerTeamId)
  ].filter((t): t is BracketTeam => t !== null)

  const confGame: BracketGameViewModel = {
    id: `${conf}-CONF`,
    topTeam: divWinners[1] ?? null,
    bottomTeam: divWinners[0] ?? null,
    topScore: input.conference.gameCC.top,
    bottomScore: input.conference.gameCC.bottom,
    winnerTeamId: null
  }
  confGame.winnerTeamId = winnerIdFromScores(
    confGame.topTeam,
    confGame.bottomTeam,
    confGame.topScore,
    confGame.bottomScore
  )

  const champion = pickTeamById(allTeams, confGame.winnerTeamId)

  return { wcGames, divGames: [divGame1, divGame2], confGame, champion }
}

/** DEMO DATA (replace w/ Pinia/store/API) */
const nfcInput = reactive<BracketInput>({
  teamsBySeed: {
    1: { id: 101, seed: 1, abbrev: 'CHI', name: 'Bears', logoUrl: '/logos/nfc/Bears.avif' },
    2: { id: 102, seed: 2, abbrev: 'LAR', name: 'Rams', logoUrl: '/logos/nfc/Rams.avif' },
    3: { id: 103, seed: 3, abbrev: 'PHI', name: 'Eagles', logoUrl: '/logos/nfc/Eagles.avif' },
    4: { id: 104, seed: 4, abbrev: 'TB', name: 'Buccaneers', logoUrl: '/logos/nfc/Buccaneers.avif' },
    5: { id: 105, seed: 5, abbrev: 'SEA', name: 'Seahawks', logoUrl: '/logos/nfc/Seahawks.avif' },
    6: { id: 106, seed: 6, abbrev: 'GB', name: 'Packers', logoUrl: '/logos/nfc/Packers.avif' },
    7: { id: 107, seed: 7, abbrev: 'SF', name: '49ers', logoUrl: '/logos/nfc/49ers.avif' }
  },
  wildCard: {
    game54: { top: 5, bottom: 4 },
    game63: { top: 6, bottom: 3 },
    game72: { top: 7, bottom: 2 }
  },
  divisional: {
    game1L: { top: null, bottom: null },
    gameX: { top: null, bottom: null }
  },
  conference: {
    gameCC: { top: null, bottom: null }
  }
})

const afcInput = reactive<BracketInput>({
  teamsBySeed: {
    1: { id: 201, seed: 1, abbrev: 'DEN', name: 'Broncos', logoUrl: '/logos/afc/Broncos.avif' },
    2: { id: 202, seed: 2, abbrev: 'NE', name: 'Patriots', logoUrl: '/logos/afc/Patriots.avif' },
    3: { id: 203, seed: 3, abbrev: 'JAX', name: 'Jaguars', logoUrl: '/logos/afc/Jaguars.avif' },
    4: { id: 204, seed: 4, abbrev: 'BAL', name: 'Ravens', logoUrl: '/logos/afc/Ravens.avif' },
    5: { id: 205, seed: 5, abbrev: 'LAC', name: 'Chargers', logoUrl: '/logos/afc/Chargers.webp' },
    6: { id: 206, seed: 6, abbrev: 'IND', name: 'Colts', logoUrl: '/logos/afc/Colts.avif' },
    7: { id: 207, seed: 7, abbrev: 'BUF', name: 'Bills', logoUrl: '/logos/afc/Bills.avif' }
  },
  wildCard: {
    game54: { top: 5, bottom: 4 },
    game63: { top: 6, bottom: 3 },
    game72: { top: 7, bottom: 2 }
  },
  divisional: {
    game1L: { top: null, bottom: null },
    gameX: { top: null, bottom: null }
  },
  conference: {
    gameCC: { top: null, bottom: null }
  }
})

const nfc = computed(() => computeConferenceBracket('NFC', nfcInput))
const afc = computed(() => computeConferenceBracket('AFC', afcInput))

const superBowl = computed<BracketGameViewModel>(() => {
  const topTeam = nfc.value.champion
  const bottomTeam = afc.value.champion
  return {
    id: 'SB',
    topTeam,
    bottomTeam,
    topScore: null,
    bottomScore: null,
    winnerTeamId: winnerIdFromScores(topTeam, bottomTeam, null, null)
  }
})

const nfcAlign: Align = 'left'
const afcAlign: Align = 'right'
</script>

<template>
  <div class="bracket-root">
    <div class="bracket-header">
      <h2 class="bracket-title">Playoff Bracket</h2>

      <div class="bracket-tabs">
        <TabView v-model:activeIndex="activeIndex">
          <TabPanel header="AFC" />
          <TabPanel header="NFC" />
          <TabPanel header="Full" />
        </TabView>
      </div>
    </div>

    <div v-if="activeTab === 'FULL'" class="bracket-grid">
      <!-- NFC -->
      <section class="side side--left">
        <div class="side-title">NFC</div>

        <div class="side-inner">
          <BracketGameCard class="pos wc-1" :game="nfc.wcGames[0]" :align="nfcAlign" title="Wild Card" />
          <BracketGameCard class="pos wc-2" :game="nfc.wcGames[1]" :align="nfcAlign" />
          <BracketGameCard class="pos wc-3" :game="nfc.wcGames[2]" :align="nfcAlign" />

          <BracketGameCard class="pos div-1" :game="nfc.divGames[0]" :align="nfcAlign" title="Divisional" />
          <BracketGameCard class="pos div-2" :game="nfc.divGames[1]" :align="nfcAlign" />

          <BracketGameCard class="pos conf-1" :game="nfc.confGame" :align="nfcAlign" title="Conference" />
        </div>
      </section>

      <!-- SUPER BOWL -->
      <section class="center">
        <div class="center-title">
          <div class="sb-label">SUPER BOWL</div>
        </div>

        <div class="center-slot">
          <BracketGameCard :game="superBowl" align="left" />
        </div>
      </section>

      <!-- AFC -->
      <section class="side side--right">
        <div class="side-title">AFC</div>

        <div class="side-inner side-inner--right">
          <BracketGameCard class="pos wc-1" :game="afc.wcGames[0]" :align="afcAlign" title="Wild Card" />
          <BracketGameCard class="pos wc-2" :game="afc.wcGames[1]" :align="afcAlign" />
          <BracketGameCard class="pos wc-3" :game="afc.wcGames[2]" :align="afcAlign" />

          <BracketGameCard class="pos div-1" :game="afc.divGames[0]" :align="afcAlign" title="Divisional" />
          <BracketGameCard class="pos div-2" :game="afc.divGames[1]" :align="afcAlign" />

          <BracketGameCard class="pos conf-1" :game="afc.confGame" :align="afcAlign" title="Conference" />
        </div>
      </section>
    </div>

    <div v-else class="bracket-grid bracket-grid--single">
      <section v-if="showNfc" class="side side--left">
        <div class="side-title">NFC</div>

        <div class="side-inner">
          <BracketGameCard class="pos wc-1" :game="nfc.wcGames[0]" :align="nfcAlign" title="Wild Card" />
          <BracketGameCard class="pos wc-2" :game="nfc.wcGames[1]" :align="nfcAlign" />
          <BracketGameCard class="pos wc-3" :game="nfc.wcGames[2]" :align="nfcAlign" />

          <BracketGameCard class="pos div-1" :game="nfc.divGames[0]" :align="nfcAlign" title="Divisional" />
          <BracketGameCard class="pos div-2" :game="nfc.divGames[1]" :align="nfcAlign" />

          <BracketGameCard class="pos conf-1" :game="nfc.confGame" :align="nfcAlign" title="Conference" />
        </div>
      </section>

      <section v-if="showAfc" class="side side--right">
        <div class="side-title">AFC</div>

        <div class="side-inner side-inner--right">
          <BracketGameCard class="pos wc-1" :game="afc.wcGames[0]" :align="afcAlign" title="Wild Card" />
          <BracketGameCard class="pos wc-2" :game="afc.wcGames[1]" :align="afcAlign" />
          <BracketGameCard class="pos wc-3" :game="afc.wcGames[2]" :align="afcAlign" />

          <BracketGameCard class="pos div-1" :game="afc.divGames[0]" :align="afcAlign" title="Divisional" />
          <BracketGameCard class="pos div-2" :game="afc.divGames[1]" :align="afcAlign" />

          <BracketGameCard class="pos conf-1" :game="afc.confGame" :align="afcAlign" title="Conference" />
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.bracket-root {
  min-height: 100vh;
  padding: 18px;
}

.bracket-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.bracket-title {
  margin: 0;
  font-weight: 900;
  letter-spacing: 0.5px;
}

.bracket-tabs :deep(.p-tabview-panels) {
  display: none;
}

.bracket-grid {
  display: grid;
  grid-template-columns: 1fr 320px 1fr;
  gap: 18px;
  align-items: stretch;
}

.bracket-grid--single {
  grid-template-columns: 1fr;
}

.side {
  border-radius: 14px;
  padding: 14px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.side-title {
  font-weight: 900;
  letter-spacing: 1px;
  opacity: 0.95;
  margin-bottom: 10px;
}

.center {
  border-radius: 14px;
  padding: 14px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: grid;
  grid-template-rows: auto 1fr;
}

.center-title {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

.sb-label {
  font-weight: 900;
  letter-spacing: 1px;
  opacity: 0.95;
}

.center-slot {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* KEY FIX: increase row height so a matchup can hold TWO teams inside one box */
.side-inner {
  --colW: 260px;
  --rowH: 60px;

  display: grid;
  grid-template-columns: var(--colW) var(--colW) var(--colW);
  grid-template-rows: repeat(12, var(--rowH));
  column-gap: 18px;
  row-gap: 14px;
  position: relative;
}

.side-inner--right {
  grid-template-columns: var(--colW) var(--colW) var(--colW);
}

/* Positioning */
.pos.wc-1 {
  grid-column: 1;
  grid-row: 1 / span 2;
}

.pos.wc-2 {
  grid-column: 1;
  grid-row: 5 / span 2;
}

.pos.wc-3 {
  grid-column: 1;
  grid-row: 9 / span 2;
}

.pos.div-1 {
  grid-column: 2;
  grid-row: 3 / span 2;
}

.pos.div-2 {
  grid-column: 2;
  grid-row: 7 / span 2;
}

.pos.conf-1 {
  grid-column: 3;
  grid-row: 5 / span 2;
}

.side--right .pos.wc-1,
.side--right .pos.wc-2,
.side--right .pos.wc-3 {
  grid-column: 3;
}

.side--right .pos.conf-1 {
  grid-column: 1;
}

/* Responsive */
@media (max-width: 1280px) {
  .bracket-grid {
    grid-template-columns: 1fr;
  }

  .side-inner {
    grid-template-columns: 1fr;
    grid-template-rows: none;
    row-gap: 12px;
  }

  .pos.wc-1,
  .pos.wc-2,
  .pos.wc-3,
  .pos.div-1,
  .pos.div-2,
  .pos.conf-1 {
    grid-column: 1;
    grid-row: auto;
  }
}
</style>
