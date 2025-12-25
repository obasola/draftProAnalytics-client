// sports_mgmt_app_client/src/modules/draftSimulator/stores/draftSimulatorStore.ts
import { defineStore } from 'pinia'
import type { DraftStateDto, ProspectDto, CreateSimulationRequest } from '../api/draftSimulatorApi'
import { createSimulation, getDraftState, listProspects, makePick, simulateNext, startSimulation } from '../api/draftSimulatorApi'
import type { TeamConsoleDto } from '../api/draftSimulatorApi'
import { getTeamConsole } from '../api/draftSimulatorApi'

interface DraftSimulatorState {
  // existing...
  teamConsole: TeamConsoleDto | null
}

interface FiltersState {
  q: string
  side: 'all' | 'offense' | 'defense' | 'st'
  position: string
}

interface DraftSimulatorState {
  loading: boolean
  error: string | null
  draft: DraftStateDto | null
  prospects: ProspectDto[]
  filters: FiltersState
  
}

export const useDraftSimulatorStore = defineStore('draftSimulator', {
  state: (): DraftSimulatorState => ({
    loading: false,
    error: null,
    draft: null,
    prospects: [],
    filters: { q: '', side: 'all', position: '' },
    teamConsole: null
  }),

  actions: {
    async createAndLoad(payload: CreateSimulationRequest): Promise<void> {
      this.loading = true
      this.error = null
      try {
        this.draft = await createSimulation(payload)
      } catch (e: unknown) {
        this.error = e instanceof Error ? e.message : 'Failed to create simulation'
      } finally {
        this.loading = false
      }
    },

    async loadDraft(id: number): Promise<void> {
      this.loading = true
      this.error = null
      try {
        this.draft = await getDraftState(id)
        await this.refreshTeamConsole()
      } catch (e: unknown) {
        this.error = e instanceof Error ? e.message : 'Failed to load draft'
      } finally {
        this.loading = false
      }
    },

    async start(id: number): Promise<void> {
      this.loading = true
      this.error = null
      try {
        this.draft = await startSimulation(id)
        await this.refreshTeamConsole()
      } catch (e: unknown) {
        this.error = e instanceof Error ? e.message : 'Failed to start draft'
      } finally {
        this.loading = false
      }
    },

    async refreshProspects(): Promise<void> {
      if (!this.draft) return
      this.prospects = await listProspects(this.draft.simulationId, {
        q: this.filters.q || undefined,
        side: this.filters.side,
        position: this.filters.position || undefined
      })
    },

    async refreshTeamConsole(): Promise<void> {
      if (!this.draft) return
      this.teamConsole = await getTeamConsole(this.draft.simulationId)
    },

    async draftProspect(prospectId: number): Promise<void> {
      if (!this.draft) return
      const id = this.draft.simulationId
      const overallPick = this.draft.currentOverallPick
      this.draft = await makePick(id, { overallPick, prospectId })
      await this.refreshProspects()
      await this.refreshTeamConsole()
    },

    async simNext(): Promise<void> {
      if (!this.draft) return
      this.draft = await simulateNext(this.draft.simulationId)
      await this.refreshProspects()
      await this.refreshTeamConsole()
    }
  }
})
