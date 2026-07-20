<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import ProgressSpinner from 'primevue/progressspinner'
import Message from 'primevue/message'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import { fetchPlayoffGameDetails } from '@/modules/playoffs/infrastructure/playoffGameDetailsApi'
import type {
  PlayoffGameDetailsDto,
  PlayoffGamePlayDto,
} from '@/modules/playoffs/domain/dtos/PlayoffGameDetailsDto'

const props = defineProps<{
  visible: boolean
  gameId: number | null
  fallbackAwayRecord?: string | null
  fallbackHomeRecord?: string | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const details = ref<PlayoffGameDetailsDto | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
})


const displayAwayRecord = computed<string>(() =>
  details.value?.awayTeam.record?.trim()
  || props.fallbackAwayRecord?.trim()
  || 'Record unavailable'
)

const displayHomeRecord = computed<string>(() =>
  details.value?.homeTeam.record?.trim()
  || props.fallbackHomeRecord?.trim()
  || 'Record unavailable'
)

const formattedDate = computed(() => {
  if (!details.value?.date) return 'Date unavailable'
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(details.value.date))
})

const periodCount = computed(() =>
  Math.max(details.value?.awayTeam.linescores.length ?? 0, details.value?.homeTeam.linescores.length ?? 0)
)

const periods = computed(() => Array.from({ length: periodCount.value }, (_, index) => index + 1))

const playLabel = (play: PlayoffGamePlayDto): string => {
  const period = play.period ? `Q${play.period}` : ''
  const clock = play.clock ?? ''
  return [period, clock].filter(Boolean).join(' ')
}

const scoreText = (play: PlayoffGamePlayDto): string | null => {
  if (play.awayScore === null || play.homeScore === null) return null
  return `${play.awayScore}-${play.homeScore}`
}

const load = async (): Promise<void> => {
  if (!props.visible || props.gameId === null || props.gameId <= 0) return
  loading.value = true
  error.value = null
  try {
    details.value = await fetchPlayoffGameDetails(props.gameId)
  } catch (caught: unknown) {
    details.value = null
    error.value = caught instanceof Error ? caught.message : 'Unable to load playoff game details'
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.visible, props.gameId] as const,
  async ([visible]) => {
    if (visible) await load()
  },
  { immediate: true }
)
</script>

<template>
  <Dialog
    v-model:visible="dialogVisible"
    modal
    dismissable-mask
    :draggable="false"
    class="playoff-game-dialog"
    :style="{ width: 'min(1100px, 96vw)' }"
    :breakpoints="{ '900px': '96vw' }"
  >
    <template #header>
      <div class="dialog-heading">
        <span class="trophy" aria-hidden="true">🏆</span>
        <div>
          <div class="eyebrow">NFL PLAYOFFS</div>
          <div class="dialog-title">{{ details?.title ?? 'Playoff Game' }}</div>
        </div>
      </div>
    </template>

    <div v-if="loading" class="state-panel">
      <ProgressSpinner />
      <span>Loading game details…</span>
    </div>

    <Message v-else-if="error" severity="error" :closable="false">{{ error }}</Message>

    <div v-else-if="details" class="details-shell">
      <section class="score-hero">
        <div class="game-meta">
          <span class="status-pill">{{ details.status }}</span>
          <span>{{ formattedDate }}</span>
          <span v-if="details.venue">{{ details.venue }}</span>
          <span v-if="details.location">{{ details.location }}</span>
        </div>

        <div class="matchup">
          <article class="team team--away" :class="{ champion: details.awayTeam.winner }">
            <img v-if="details.awayTeam.logoUrl" :src="details.awayTeam.logoUrl" :alt="details.awayTeam.displayName" />
            <div class="team-copy">
              <span class="abbrev">{{ details.awayTeam.abbreviation }}</span>
              <strong>{{ details.awayTeam.displayName }}</strong>
              <span>{{ displayAwayRecord }}</span>
            </div>
            <div class="final-score">{{ details.awayTeam.score ?? '—' }}</div>
          </article>

          <div class="versus">FINAL</div>

          <article class="team team--home" :class="{ champion: details.homeTeam.winner }">
            <div class="final-score">{{ details.homeTeam.score ?? '—' }}</div>
            <div class="team-copy team-copy--right">
              <span class="abbrev">{{ details.homeTeam.abbreviation }}</span>
              <strong>{{ details.homeTeam.displayName }}</strong>
              <span>{{ displayHomeRecord }}</span>
            </div>
            <img v-if="details.homeTeam.logoUrl" :src="details.homeTeam.logoUrl" :alt="details.homeTeam.displayName" />
          </article>
        </div>
      </section>

      <section class="line-score-card">
        <table>
          <thead>
            <tr>
              <th>Team</th>
              <th v-for="period in periods" :key="period">Q{{ period }}</th>
              <th>T</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>{{ details.awayTeam.abbreviation }}</th>
              <td v-for="period in periods" :key="period">{{ details.awayTeam.linescores[period - 1] ?? '—' }}</td>
              <td class="total">{{ details.awayTeam.score ?? '—' }}</td>
            </tr>
            <tr>
              <th>{{ details.homeTeam.abbreviation }}</th>
              <td v-for="period in periods" :key="period">{{ details.homeTeam.linescores[period - 1] ?? '—' }}</td>
              <td class="total">{{ details.homeTeam.score ?? '—' }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <TabView class="details-tabs">
        <TabPanel header="Team Stats">
          <div class="comparison-table">
            <div class="comparison-head">
              <strong>{{ details.awayTeam.abbreviation }}</strong>
              <span>STAT</span>
              <strong>{{ details.homeTeam.abbreviation }}</strong>
            </div>
            <div v-for="stat in details.teamStats" :key="stat.label" class="comparison-row">
              <strong>{{ stat.away }}</strong>
              <span>{{ stat.label }}</span>
              <strong>{{ stat.home }}</strong>
            </div>
          </div>
        </TabPanel>

        <TabPanel header="Leaders">
          <div class="leader-grid">
            <article v-for="leader in details.leaders" :key="leader.category" class="leader-card">
              <h3>{{ leader.category }}</h3>
              <div><strong>{{ details.awayTeam.abbreviation }}</strong><span>{{ leader.away ?? 'Unavailable' }}</span></div>
              <div><strong>{{ details.homeTeam.abbreviation }}</strong><span>{{ leader.home ?? 'Unavailable' }}</span></div>
            </article>
          </div>
        </TabPanel>

        <TabPanel header="Scoring Plays">
          <div class="plays-list">
            <article v-for="(play, index) in details.scoringPlays" :key="`${index}-${play.text}`" class="play-row">
              <div class="play-time">{{ playLabel(play) }}</div>
              <div class="play-text">{{ play.text }}</div>
              <div v-if="scoreText(play)" class="play-score">{{ scoreText(play) }}</div>
            </article>
            <div v-if="details.scoringPlays.length === 0" class="empty-copy">No scoring plays available.</div>
          </div>
        </TabPanel>

        <TabPanel header="Recent Plays">
          <div class="plays-list">
            <article v-for="(play, index) in details.recentPlays" :key="`${index}-${play.text}`" class="play-row">
              <div class="play-time">{{ playLabel(play) }}</div>
              <div class="play-text">{{ play.text }}</div>
              <div v-if="scoreText(play)" class="play-score">{{ scoreText(play) }}</div>
            </article>
            <div v-if="details.recentPlays.length === 0" class="empty-copy">No recent plays available.</div>
          </div>
        </TabPanel>
      </TabView>
    </div>
  </Dialog>
</template>

<style scoped>
.dialog-heading { display: flex; align-items: center; gap: 12px; }
.trophy { font-size: 2rem; }
.eyebrow { color: #b66e00; font-size: .72rem; font-weight: 900; letter-spacing: .14em; }
.dialog-title { color: #fff; font-size: 1.45rem; font-weight: 900; }
.state-panel { min-height: 300px; display: grid; place-items: center; gap: 12px; }
.details-shell { display: grid; gap: 16px; }
.score-hero, .line-score-card { border: 1px solid rgba(255,255,255,.14); border-radius: 18px; background: linear-gradient(135deg, #031c4b, #0757cc); }
.score-hero { padding: 20px; }
.game-meta { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px 18px; color: rgba(255,255,255,.82); font-size: .9rem; }
.status-pill { padding: 3px 10px; border-radius: 999px; background: #b66e00; color: #fff; font-weight: 900; }
.matchup { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 18px; margin-top: 22px; }
.team { display: flex; align-items: center; gap: 14px; min-width: 0; padding: 14px; border-radius: 14px; }
.team.champion { background: rgba(255,255,255,.1); box-shadow: inset 0 0 0 1px rgba(255,215,0,.45); }
.team img { width: 72px; height: 72px; object-fit: contain; }
.team-copy { display: grid; gap: 3px; color: rgba(255,255,255,.76); }
.team-copy strong { color: #fff; font-size: 1.05rem; }
.team-copy--right { text-align: right; }
.abbrev { color: #ffd27c; font-size: .8rem; font-weight: 900; letter-spacing: .12em; }
.final-score { color: #fff; font-size: clamp(2.5rem, 6vw, 4.5rem); font-weight: 900; line-height: 1; }
.team--away .final-score { margin-left: auto; }
.versus { color: rgba(255,255,255,.62); font-weight: 900; font-size: .78rem; letter-spacing: .12em; }
.line-score-card { overflow: hidden; background: #071a38; }
table { width: 100%; border-collapse: collapse; color: #fff; }
th, td { padding: 11px 14px; text-align: center; border-bottom: 1px solid rgba(255,255,255,.1); }
th:first-child { text-align: left; }
thead th { color: #9fc3ff; font-size: .78rem; letter-spacing: .08em; }
.total { color: #ffd27c; font-weight: 900; }
.details-tabs :deep(.p-tabview-nav), .details-tabs :deep(.p-tabview-panels) { background: transparent; }
.details-tabs :deep(.p-tabview-panels) { padding: 16px 0 0; }
.comparison-table { display: grid; border: 1px solid rgba(255,255,255,.12); border-radius: 14px; overflow: hidden; }
.comparison-head, .comparison-row { display: grid; grid-template-columns: 1fr 1.4fr 1fr; text-align: center; padding: 10px 14px; }
.comparison-head { background: #084db2; color: #fff; }
.comparison-row { border-top: 1px solid rgba(255,255,255,.1); }
.comparison-row span { color: rgba(255,255,255,.68); }
.leader-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.leader-card { border: 1px solid rgba(255,255,255,.12); border-radius: 14px; padding: 14px; }
.leader-card h3 { margin: 0 0 12px; color: #ffd27c; }
.leader-card div { display: grid; grid-template-columns: 48px 1fr; gap: 10px; margin-top: 10px; }
.plays-list { display: grid; gap: 8px; max-height: 390px; overflow: auto; }
.play-row { display: grid; grid-template-columns: 78px 1fr auto; gap: 12px; align-items: start; padding: 11px; border: 1px solid rgba(255,255,255,.1); border-radius: 12px; }
.play-time, .play-score { color: #ffd27c; font-weight: 900; }
.play-text { color: rgba(255,255,255,.88); }
.empty-copy { padding: 20px; text-align: center; color: rgba(255,255,255,.62); }
@media (max-width: 760px) {
  .matchup { grid-template-columns: 1fr; }
  .versus { text-align: center; }
  .team--home { flex-direction: row-reverse; }
  .team-copy--right { text-align: left; }
  .team--away .final-score { margin-left: auto; }
  .leader-grid { grid-template-columns: 1fr; }
  .play-row { grid-template-columns: 70px 1fr; }
  .play-score { grid-column: 2; }
}
</style>

<style>
.playoff-game-dialog .p-dialog-header,
.playoff-game-dialog .p-dialog-content { background: #071426; color: #fff; }
.playoff-game-dialog .p-dialog-header { border-radius: 18px 18px 0 0; }
.playoff-game-dialog .p-dialog-content { border-radius: 0 0 18px 18px; }
</style>
