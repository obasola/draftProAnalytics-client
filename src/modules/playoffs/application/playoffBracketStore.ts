import { defineStore } from 'pinia'
import { fetchPlayoffBracket } from '@/modules/playoffs/infrastructure/playoffBracketApi'
import type { PlayoffBracketEventDto } from '@/modules/playoffs/domain/dtos/PlayoffBracketEventDto'

import type { BracketGameViewModel } from '@/modules/playoffs/presentation/components/BracketGameCard.vue'
import type { BracketTeam } from '@/modules/playoffs/presentation/components/BracketTeamRow.vue'

import { useStandingsStore } from '@/stores/standingsStore'
import type { TeamStandingDto } from '@/types/TeamStandingDto'

type Conference = 'AFC' | 'NFC'
type Round = 'WILD_CARD' | 'DIVISIONAL' | 'CONFERENCE' | 'SUPER_BOWL'

function isFinalish(status: string): boolean {
  const s = status.trim().toLowerCase()
  return s.includes('final') || s.includes('complete') || s.includes('completed')
}

function isScheduled(status: string): boolean {
  return status.trim().toLowerCase() === 'scheduled'
}

function safeTime(date: string | null): number {
  if (!date) return Number.MAX_SAFE_INTEGER
  const t = Date.parse(date)
  return Number.isFinite(t) ? t : Number.MAX_SAFE_INTEGER
}

function emptyGame(id: string): BracketGameViewModel {
  return {
    id,
    topTeam: null,
    bottomTeam: null,
    topScore: null,
    bottomScore: null,
    winnerTeamId: null,
  }
}

function standingsCompare(a: TeamStandingDto, b: TeamStandingDto): number {
  if (b.winPct !== a.winPct) return b.winPct - a.winPct
  if (b.wins !== a.wins) return b.wins - a.wins
  if (b.pointDiff !== a.pointDiff) return b.pointDiff - a.pointDiff
  return a.teamName.localeCompare(b.teamName)
}

function seedKey(e: PlayoffBracketEventDto): string | null {
  const a = e.awaySeed ?? null
  const h = e.homeSeed ?? null
  if (a === null || h === null) return null
  const lo = Math.min(a, h)
  const hi = Math.max(a, h)
  return `${lo}-${hi}`
}

function buildSeedMapFromStandings(rows: TeamStandingDto[]): Record<number, number> {
  const map: Record<number, number> = {}
  for (const r of rows) {
    const seed = r.playoffSeed ?? null
    if (typeof seed === 'number' && seed >= 1 && seed <= 7) {
      map[r.teamId] = seed
    }
  }
  return map
}


/**
 * NOTE: We intentionally keep returning BracketTeam with `abbrev` populated.
 * To “drop abbrev and show W/L”, you can render this.abbrev as the record.
 */
function toTeam(
  e: PlayoffBracketEventDto,
  side: 'HOME' | 'AWAY',
  confFallback: Conference,
  seedByTeamId: Record<number, number>
): BracketTeam | null {
  const standings = useStandingsStore()

  const dbId = side === 'HOME' ? e.homeTeamDbId : e.awayTeamDbId
  const espnTeamId = side === 'HOME' ? e.homeTeamId : e.awayTeamId
  const teamNameRaw = side === 'HOME' ? e.homeTeamName : e.awayTeamName
  const logoLocal = side === 'HOME' ? e.homeLogoLocal : e.awayLogoLocal

  const stableId = dbId ?? espnTeamId ?? null
  if (stableId === null || stableId <= 0) return null
  if (!teamNameRaw || teamNameRaw.trim().toUpperCase() === 'TBD') return null

  const apiSeed = side === 'HOME' ? (e.homeSeed ?? null) : (e.awaySeed ?? null)
  const computedSeed = dbId ? (seedByTeamId[dbId] ?? null) : null
  const seedMaybe = apiSeed ?? computedSeed

  // BracketTeam often expects a number; use 0 to mean "unknown" (UI can hide 0).
  const seed: number = typeof seedMaybe === 'number' ? seedMaybe : 0

  // Use standings-derived display values when possible
  const displayName = dbId ? standings.getDisplayNameByTeamId(dbId) : teamNameRaw
  const record = stableId ? standings.getRecordByTeamId(stableId) : null
  // If your BracketTeam.record is required:
  const recordText: string = record ?? ''
  const logoInfo = dbId ? standings.getLogoInfoByTeamId(dbId) : null

  const logoUrl =
    logoInfo?.logoUrl || (typeof logoLocal === 'string' && logoLocal.length > 0 ? logoLocal : '')

  // ✅ "abbrev" becomes record text (W-L). Keeps type compatibility + matches your desired UI.
  const abbrev = record ?? ''

  return {
    id: stableId,
    seed,
    name: displayName,
    logoUrl,
    record,
  }
}

function toVm(
  id: string,
  e: PlayoffBracketEventDto,
  confFallback: Conference,
  seedByTeamId: Record<number, number>
): BracketGameViewModel {
  const topTeam = toTeam(e, 'AWAY', confFallback, seedByTeamId)
  const bottomTeam = toTeam(e, 'HOME', confFallback, seedByTeamId)

  const showScores = !isScheduled(e.status)
  const topScore = showScores ? (e.awayScore ?? null) : null
  const bottomScore = showScores ? (e.homeScore ?? null) : null

  const winnerTeamId = (() => {
    if (!topTeam || !bottomTeam) return null
    if (!isFinalish(e.status)) return null
    if (topScore === null || bottomScore === null) return null
    if (topScore === bottomScore) return null
    return topScore > bottomScore ? topTeam.id : bottomTeam.id
  })()

  return { id, topTeam, bottomTeam, topScore, bottomScore, winnerTeamId }
}

function buildConferenceBracket(
  conf: Conference,
  events: PlayoffBracketEventDto[],
  seedByTeamId: Record<number, number>
): {
  wcGames: BracketGameViewModel[]
  divGames: BracketGameViewModel[]
  confGame: BracketGameViewModel
  champion: BracketTeam | null
} {
  const list = events.filter(e => e.playoffConference === conf)

  // ---- Wild Card (3) ----
  const wc = list
    .filter(e => e.playoffRound === 'WILD_CARD')
    .slice()
    .sort((a, b) => safeTime(a.date) - safeTime(b.date))

  const wcOrder = ['4-5', '3-6', '2-7'] as const
  const placed = new Map<string, PlayoffBracketEventDto>()
  const remainder: PlayoffBracketEventDto[] = []

  for (const e of wc) {
    const k = seedKey(e)
    if (k && (wcOrder as readonly string[]).includes(k) && !placed.has(k)) placed.set(k, e)
    else remainder.push(e)
  }

  const wcGames: BracketGameViewModel[] = wcOrder.map((k, idx) => {
    const e = placed.get(k) ?? remainder[idx] ?? null
    return e ? toVm(`${conf}-WC-${k}`, e, conf, seedByTeamId) : emptyGame(`${conf}-WC-${k}`)
  })

  // ---- Divisional (2) ----
  const div = list
    .filter(e => e.playoffRound === 'DIVISIONAL')
    .slice()
    .sort((a, b) => safeTime(a.date) - safeTime(b.date))

  const hasSeed1 = (e: PlayoffBracketEventDto): boolean =>
    (e.homeSeed ?? null) === 1 || (e.awaySeed ?? null) === 1

  const div1 = div.find(hasSeed1) ?? div[0] ?? null
  const div2 = div.find(e => e !== div1) ?? div[1] ?? null

  const divGames: BracketGameViewModel[] = [
    div1 ? toVm(`${conf}-DIV-1`, div1, conf, seedByTeamId) : emptyGame(`${conf}-DIV-1`),
    div2 ? toVm(`${conf}-DIV-2`, div2, conf, seedByTeamId) : emptyGame(`${conf}-DIV-2`),
  ]

  // ---- Conference (1) ----
  const cg =
    list
      .filter(e => e.playoffRound === 'CONFERENCE')
      .slice()
      .sort((a, b) => safeTime(a.date) - safeTime(b.date))[0] ?? null

  const confGame = cg ? toVm(`${conf}-CONF`, cg, conf, seedByTeamId) : emptyGame(`${conf}-CONF`)

  const champion =
    confGame.winnerTeamId && confGame.topTeam && confGame.bottomTeam
      ? confGame.topTeam.id === confGame.winnerTeamId
        ? confGame.topTeam
        : confGame.bottomTeam
      : null

  return { wcGames, divGames, confGame, champion }
}

export const usePlayoffBracketStore = defineStore('playoffBracket', {
  state: () => ({
    seasonYear: 0 as number,
    seasonType: 3 as 1 | 2 | 3,
    seasonWeek: 1 as number,

    events: [] as PlayoffBracketEventDto[],
    seedByTeamId: {} as Record<number, number>,

    loading: false,
    error: null as string | null,
  }),

  getters: {
    afcBracket(state): {
      wcGames: BracketGameViewModel[]
      divGames: BracketGameViewModel[]
      confGame: BracketGameViewModel
      champion: BracketTeam | null
    } {
      return buildConferenceBracket('AFC', state.events, state.seedByTeamId)
    },

    nfcBracket(state): {
      wcGames: BracketGameViewModel[]
      divGames: BracketGameViewModel[]
      confGame: BracketGameViewModel
      champion: BracketTeam | null
    } {
      return buildConferenceBracket('NFC', state.events, state.seedByTeamId)
    },

    superBowl(state): BracketGameViewModel {
      const sb = state.events.find(e => e.playoffRound === 'SUPER_BOWL') ?? null
      if (sb) return toVm('SB', sb, 'AFC', state.seedByTeamId)

      const afc = buildConferenceBracket('AFC', state.events, state.seedByTeamId)
      const nfc = buildConferenceBracket('NFC', state.events, state.seedByTeamId)

      return {
        id: 'SB',
        topTeam: nfc.champion,
        bottomTeam: afc.champion,
        topScore: null,
        bottomScore: null,
        winnerTeamId: null,
      }
    },
  },

  actions: {
    async load(seasonYear: number, seasonType: 1 | 2 | 3 = 3, week?: number): Promise<void> {
      this.loading = true
      this.error = null

      try {
        this.seasonYear = seasonYear
        this.seasonType = seasonType
        this.seasonWeek = typeof week === 'number' ? week : 1

        // standings are used for W-L and computed seeds (when ESPN seeds are null)
        const standings = useStandingsStore()
        await standings.fetchStandings(seasonYear, 2)
        this.seedByTeamId = buildSeedMapFromStandings(standings.standings)

        const list = await fetchPlayoffBracket(seasonYear, seasonType, week)
        const byId = new Map<number, PlayoffBracketEventDto>()
        for (const e of list) byId.set(e.id, e)
        this.events = Array.from(byId.values())
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load playoff bracket'
        this.error = msg
        throw err
      } finally {
        this.loading = false
      }
    },
  },
})
