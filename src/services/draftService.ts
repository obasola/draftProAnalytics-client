// src/services/draftService.ts
 
import axios from 'axios'
import type { DraftOrder, DraftSelection, TradeOffer } from '@/types/draft'
import type { Prospect } from '@/types'

const API_BASE = process.env.VUE_APP_API_URL || 'http://localhost:3000/api'

export const draftService = {
  async getDraftOrder(year: number): Promise<DraftOrder> {
    const response = await axios.get(`${API_BASE}/draft/${year}/order`)
    return response.data.data
  },

  async getAvailableProspects(year: number): Promise<Prospect[]> {
    const response = await axios.get(`${API_BASE}/prospects`, {
      params: { draftYear: year, drafted: false }
    })
    return response.data.data
  },

  async makePick(pickId: number, prospectId: number): Promise<DraftSelection> {
    const response = await axios.post(`${API_BASE}/draft/pick`, {
      pickId,
      prospectId
    })
    return response.data.data
  },

  async getAIPick(pickId: number): Promise<{ prospectId: number }> {
    const response = await axios.get(`${API_BASE}/draft/${pickId}/ai-pick`)
    return response.data.data
  },

  async proposeTrade(offer: Omit<TradeOffer, 'id' | 'createdAt'>): Promise<TradeOffer> {
    const response = await axios.post(`${API_BASE}/draft/trade`, offer)
    return response.data.data
  },

  async acceptTrade(tradeId: string): Promise<DraftOrder> {
    const response = await axios.post(`${API_BASE}/draft/trade/${tradeId}/accept`)
    return response.data.data
  },

  async getTeamNeeds(teamId: number): Promise<string[]> {
    const response = await axios.get(`${API_BASE}/teams/${teamId}/needs`)
    return response.data.data.map((need: any) => need.position)
  }
}
