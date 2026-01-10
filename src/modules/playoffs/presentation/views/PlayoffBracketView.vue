<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'

import { usePlayoffBracketStore } from '@/modules/playoffs/application/playoffBracketStore'
import BracketConnectorOverlay from '../components/BracketConnectorOverlay.vue'
import BracketGameCard from '../components/BracketGameCard.vue'

import ProgressSpinner from 'primevue/progressspinner'

type Align = 'left' | 'right'
type BracketTab = 'AFC' | 'NFC' | 'FULL'

const route = useRoute()
const store = usePlayoffBracketStore()
const isLoading = computed<boolean>(() => store.loading)


/* --- Tabs --- */
const activeIndex = ref<number>(2) // default Full
const activeTab = computed<BracketTab>(() => {
  if (activeIndex.value === 0) return 'AFC'
  if (activeIndex.value === 1) return 'NFC'
  return 'FULL'
})
const showAfc = computed<boolean>(() => activeTab.value === 'AFC' || activeTab.value === 'FULL')
const showNfc = computed<boolean>(() => activeTab.value === 'NFC' || activeTab.value === 'FULL')

const nfcAlign: Align = 'left'
const afcAlign: Align = 'right'

/* --- Defaults --- */
const inferDefaultSeasonYear = (): number => {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  // Jan/Feb belong to prior NFL season
  return month <= 2 ? year - 1 : year
}

const seasonYear = ref<number>(inferDefaultSeasonYear())

const seasonType = computed<1 | 2 | 3>(() => {
  const q = route.query.seasonType
  const n = typeof q === 'string' ? Number(q) : 3
  return n === 1 || n === 2 || n === 3 ? n : 3
})

const seasonWeek = ref<number>(1)

/* --- options --- */
const seasonYearOptions = computed(() => {
  const base = inferDefaultSeasonYear()
  const years: number[] = []
  for (let y = base; y >= base - 5; y--) years.push(y)
  return years.map((y) => ({ label: String(y), value: y }))
})

const seasonTypeOptions = [
  { label: 'Preseason', value: 1 as const },
  { label: 'Regular', value: 2 as const },
  { label: 'Postseason', value: 3 as const },
]

const weekOptions = [1, 2, 3, 4].map((w) => ({ label: `Week ${w}`, value: w }))

const reload = async (): Promise<void> => {
  await store.load(seasonYear.value, seasonType.value, seasonWeek.value)
}

onMounted(async () => {
  await reload()
})

const nfc = computed(() => store.nfcBracket)
const afc = computed(() => store.afcBracket)
const superBowl = computed(() => store.superBowl)
</script>

<template>
  <div class="bracket-root">
    <!-- Loading overlay -->
    <div v-if="isLoading" class="loading-overlay" aria-live="polite" aria-busy="true">
      <div class="loading-card">
        <ProgressSpinner />
        <div class="loading-text">Loading playoff bracket…</div>
      </div>
    </div>

    <div class="bracket-header">
      <h2 class="bracket-title">Playoff Bracket</h2>

      <div class="bracket-tabs">
        <div class="season-picker">
          <span class="season-label">Season</span>
          <Dropdown
            v-model="seasonYear"
            :options="seasonYearOptions"
            optionLabel="label"
            optionValue="value"
            class="season-dd"
          />
        </div>

        <TabView v-model:activeIndex="activeIndex">
          <TabPanel header="AFC" />
          <TabPanel header="NFC" />
          <TabPanel header="Full" />
        </TabView>
      </div>
    </div>

    <!-- FULL -->
    <div v-if="activeTab === 'FULL'" class="bracket-grid">
      <!-- NFC -->
      <section class="side side--left">
        <div class="side-title">NFC</div>
        <div class="side-inner">
          <BracketConnectorOverlay side="left" />
          <BracketGameCard class="pos wc-1" :game="nfc.wcGames[0]" :align="nfcAlign" title="Wild Card" />
          <BracketGameCard class="pos wc-2" :game="nfc.wcGames[1]" :align="nfcAlign" />
          <BracketGameCard class="pos wc-3" :game="nfc.wcGames[2]" :align="nfcAlign" />
          <BracketGameCard class="pos div-1" :game="nfc.divGames[0]" :align="nfcAlign" title="Divisional" />
          <BracketGameCard class="pos div-2" :game="nfc.divGames[1]" :align="nfcAlign" />
          <BracketGameCard class="pos conf-1" :game="nfc.confGame" :align="nfcAlign" title="Conference" />
        </div>
      </section>

      <!-- SB -->
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
          <BracketConnectorOverlay side="right" />
          <BracketGameCard class="pos wc-1" :game="afc.wcGames[0]" :align="afcAlign" title="Wild Card" />
          <BracketGameCard class="pos wc-2" :game="afc.wcGames[1]" :align="afcAlign" />
          <BracketGameCard class="pos wc-3" :game="afc.wcGames[2]" :align="afcAlign" />
          <BracketGameCard class="pos div-1" :game="afc.divGames[0]" :align="afcAlign" title="Divisional" />
          <BracketGameCard class="pos div-2" :game="afc.divGames[1]" :align="afcAlign" />
          <BracketGameCard class="pos conf-1" :game="afc.confGame" :align="afcAlign" title="Conference" />
        </div>
      </section>
    </div>

    <!-- SINGLE -->
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
          <BracketConnectorOverlay side="left" />
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
          <BracketConnectorOverlay side="right" />
        </div>
      </section>
    </div>
  </div>
</template>



<style scoped>
.bracket-root {
  position: relative; /* add this */
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

/* ===== Tabs (restore requested styling) ===== */
.bracket-tabs :deep(.p-tabview) {
  background: transparent;
}

.bracket-tabs :deep(.p-tabview-nav) {
  background: transparent;
  border: none;
  gap: 10px;
}

.bracket-tabs :deep(.p-tabview-nav li) {
  margin: 0;
}

.bracket-tabs :deep(.p-tabview-nav-link) {
  border: none !important;
  border-radius: 12px;
  padding: 10px 14px;

  background: #b66e00;
  /* inactive bg */
  color: #054dbc;
  /* inactive text */

  font-weight: 900;
  letter-spacing: 0.3px;
}

.bracket-tabs :deep(.p-highlight .p-tabview-nav-link) {
  background: #044dbe;
  /* active bg */
  color: #ffffff;
  /* active text */
}

.bracket-tabs :deep(.p-tabview-panels) {
  display: none;
}

/* LATEST */
/* Inactive AFC tab text = bright red */
.bracket-tabs :deep(.p-tabview-nav li:nth-child(1):not(.p-highlight) .p-tabview-nav-link) {
  color: hsl(0, 79%, 27%) !important;
}

/* Inactive NFC tab text = blue */
.bracket-tabs :deep(.p-tabview-nav li:nth-child(2):not(.p-highlight) .p-tabview-nav-link) {
  color: #054dbc !important;
}

/* Optional: Inactive Full tab text stays blue (or change if you want) */
.bracket-tabs :deep(.p-tabview-nav li:nth-child(3):not(.p-highlight) .p-tabview-nav-link) {
  color: #054dbc !important;
}

.side-inner {
  --colW: 200px;
  --colGap: 14px;
  --rowH: 60px;
  --rowGap: 14px;

  display: grid;
  grid-template-columns: var(--colW) var(--colW) var(--colW);
  grid-template-rows: repeat(12, var(--rowH));
  column-gap: var(--colGap);
  row-gap: var(--rowGap);
  position: relative;
}

/* ensure cards sit above connector overlay */
.pos {
  position: relative;
  z-index: 1;
}

.season-picker {
  display: flex;
  align-items: center;
  gap: 10px;
}

.season-label {
  font-weight: 900;
  color: #ffffff;
}

.season-dd {
  min-width: 120px;
}
/* make overlay cover viewport reliably */
.loading-overlay {
  position: fixed; /* change from absolute -> fixed */
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
}

.loading-card {
  display: grid;
  place-items: center;
  gap: 10px;
  padding: 16px 18px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.14);
}

.loading-text {
  font-weight: 900;
  color: #ffffff;
  letter-spacing: 0.3px;
  font-size: 14px;
}
</style>
