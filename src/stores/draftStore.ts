// src/stores/draftStore.ts

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DraftState, DraftOrder, DraftSelection, TradeOffer } from '@/types/draft'
import type { DraftPick, Prospect, Team } from '@/types'
import { draftService } from '@/services/draftService'

export const useDraftStore = defineStore('draft', () => {
  // State
  const draftState = ref<DraftState>({
    currentPick: 1,
    currentRound: 1,
    draftYear: new Date().getFullYear(),
    isActive: false,
    userControlledTeams: [],
    autoPickEnabled: true,
    pickTimer: 90
  })
  
  const draftOrder = ref<DraftOrder>({
    picks: [],
    currentPickIndex: 0
  })
  
  const completedPicks = ref<DraftSelection[]>([])
  const availableProspects = ref<Prospect[]>([])
  const pendingTrades = ref<TradeOffer[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const currentPickInfo = computed(() => {
    return draftOrder.value.picks[draftOrder.value.currentPickIndex]
  })
  
  const isUsersTurn = computed(() => {
    const currentPick = currentPickInfo.value
    return currentPick && draftState.value.userControlledTeams.includes(currentPick.teamId ? currentPick.teamId : 0)
  })
  
  const draftedProspects = computed(() => {
    return completedPicks.value.map(pick => pick.prospectId)
  })
  
  const availableUndraftedProspects = computed(() => {
    return availableProspects.value.filter(p => !draftedProspects.value.includes(p.id!))
  })

  // Actions
  const initializeDraft = async (year: number, userTeamIds: number[]) => {
    try {
      loading.value = true
      draftState.value.draftYear = year
      draftState.value.userControlledTeams = userTeamIds
      
      const [order, prospects] = await Promise.all([
        draftService.getDraftOrder(year),
        draftService.getAvailableProspects(year)
      ])
      
      draftOrder.value = order
      availableProspects.value = prospects
      draftState.value.isActive = true
    } catch (err) {
      error.value = 'Failed to initialize draft'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  const makePick = async (prospectId: number) => {
    try {
      const currentPick = currentPickInfo.value
      if (!currentPick) throw new Error('No current pick available')
      
      const selection = await draftService.makePick(currentPick.id!, prospectId)
      completedPicks.value.push(selection)
      
      // Move to next pick
      draftOrder.value.currentPickIndex++
      
      // Update pick counts
      if (draftOrder.value.currentPickIndex % 32 === 0) {
        draftState.value.currentRound++
      }
      draftState.value.currentPick++
      
      return selection
    } catch (err) {
      error.value = 'Failed to make pick'
      throw err
    }
  }

  const simulateAutoPick = async () => {
    try {
      const currentPick = currentPickInfo.value
      if (!currentPick) return
      
      const aiSelection = await draftService.getAIPick(currentPick.id!)
      return await makePick(aiSelection.prospectId)
    } catch (err) {
      error.value = 'Failed to simulate auto pick'
      throw err
    }
  }

  const proposeTrade = async (offer: Omit<TradeOffer, 'id' | 'createdAt'>) => {
    try {
      const trade = await draftService.proposeTrade(offer)
      pendingTrades.value.push(trade)
      return trade
    } catch (err) {
      error.value = 'Failed to propose trade'
      throw err
    }
  }

  const acceptTrade = async (tradeId: string) => {
    try {
      const updatedOrder = await draftService.acceptTrade(tradeId)
      draftOrder.value = updatedOrder
      pendingTrades.value = pendingTrades.value.filter(t => t.id !== tradeId)
    } catch (err) {
      error.value = 'Failed to accept trade'
      throw err
    }
  }

  const resetDraft = () => {
    draftState.value.isActive = false
    draftOrder.value.picks = []
    draftOrder.value.currentPickIndex = 0
    completedPicks.value = []
    pendingTrades.value = []
    error.value = null
  }

  return {
    // State
    draftState,
    draftOrder,
    completedPicks,
    availableProspects,
    pendingTrades,
    loading,
    error,
    
    // Computed
    currentPickInfo,
    isUsersTurn,
    draftedProspects,
    availableUndraftedProspects,
    
    // Actions
    initializeDraft,
    makePick,
    simulateAutoPick,
    proposeTrade,
    acceptTrade,
    resetDraft
  }
})