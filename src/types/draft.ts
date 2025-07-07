// src/types/draft.ts

import { Prospect, Team, DraftPick, TeamNeed } from './index'

export interface DraftState {
  currentPick: number
  currentRound: number
  draftYear: number
  isActive: boolean
  userControlledTeams: number[]
  autoPickEnabled: boolean
  pickTimer: number
}

export interface DraftOrder {
  picks: DraftPick[]
  currentPickIndex: number
}

export interface ProspectRanking {
  prospectId: number
  overallRank: number
  positionRank: number
  grade: string
  projectedRound: number
}

export interface TradeOffer {
  id?: string
  fromTeamId: number
  toTeamId: number
  offeredPicks: number[]
  requestedPicks: number[]
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: Date
}

export interface DraftSelection {
  pickId: number
  prospectId: number
  teamId: number
  selectionTime: Date
}
