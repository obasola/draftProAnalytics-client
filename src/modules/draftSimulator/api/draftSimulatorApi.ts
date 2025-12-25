// sports_mgmt_app_client/src/modules/draftSimulator/api/draftSimulatorApi.ts

import { api } from "@/services/api"

export type DraftSpeed = 'slow' | 'normal' | 'fast'
export type RankingSource = 'consensus' | 'pfsn' | 'espn' | 'pff' | 'athletic'

export interface CreateSimulationRequest {
  draftYear: number
  rounds: number
  draftSpeed: DraftSpeed
  rankingSource: RankingSource
  allowTrades: boolean
  cpuCpuTrades: boolean
  userTeamIds: number[]
}

export interface DraftedProspectDto {
  id: number
  fullName: string
  position: string
  college: string
}

export interface DraftPickDto {
  overallPick: number
  roundNbr: number
  pickInRound: number
  originalTeamId: number
  currentTeamId: number
  currentTeamAbbr: string | null
  draftedProspectId: number | null
  draftedAt: string | null
  draftedProspect: DraftedProspectDto | null
}

export interface DraftStateDto {
  simulationId: number
  draftYear: number
  rounds: number
  draftSpeed: string
  rankingSource: string
  allowTrades: boolean
  cpuCpuTrades: boolean
  status: 'setup' | 'live' | 'complete'
  currentOverallPick: number
  userTeamIds: number[]
  picks: DraftPickDto[]
}

export interface ProspectDto {
  id: number
  fullName: string
  position: string
  college: string
  overallRank: number
  grade: number | null
}

export interface TeamConsoleNeedDto {
  position: string
  priority: number
  baseWeight: number
  draftedCount: number
  adjustedWeight: number
}

export type RunSeverity = 'warm' | 'hot'

export interface PositionRunWarningDto {
  position: string
  count: number
  window: number
  severity: RunSeverity
  relevantToNeeds: boolean
}

export interface TeamConsoleOnClockDto {
  overallPick: number
  roundNbr: number
  pickInRound: number
  teamId: number
  teamAbbr: string | null
}

export interface TeamConsolePickDto {
  overallPick: number
  roundNbr: number
  pickInRound: number
  teamId: number
  teamAbbr: string | null
}

export interface TeamConsoleDto {
  simulationId: number
  draftYear: number
  onClock: TeamConsoleOnClockDto | null
  needsRemaining: TeamConsoleNeedDto[]
  runWarnings: PositionRunWarningDto[]
  nextPicks: TeamConsolePickDto[]
}



export async function getTeamConsole(id: number): Promise<TeamConsoleDto> {
  const { data } = await api.get<TeamConsoleDto>(`/draft-simulator/simulations/${id}/team-console`)
  return data
}

export async function createSimulation(req: CreateSimulationRequest): Promise<DraftStateDto> {
  const { data } = await api.post<DraftStateDto>('/draft-simulator/simulations', req)
  return data
}

export async function startSimulation(id: number): Promise<DraftStateDto> {
  const { data } = await api.post<DraftStateDto>(`/draft-simulator/simulations/${id}/start`)
  return data
}

export async function getDraftState(id: number): Promise<DraftStateDto> {
  const { data } = await api.get<DraftStateDto>(`/draft-simulator/simulations/${id}`)
  return data
}

export async function listProspects(
  id: number,
  params: { q?: string; side?: 'all' | 'offense' | 'defense' | 'st'; position?: string }
): Promise<ProspectDto[]> {
  const { data } = await api.get<ProspectDto[]>(`/draft-simulator/simulations/${id}/prospects`, { params })
  return data
}

export async function makePick(
  id: number,
  body: { overallPick: number; prospectId: number }
): Promise<DraftStateDto> {
  const { data } = await api.post<DraftStateDto>(`/draft-simulator/simulations/${id}/picks`, body)
  return data
}

export async function simulateNext(id: number): Promise<DraftStateDto> {
  const { data } = await api.post<DraftStateDto>(`/draft-simulator/simulations/${id}/simulate-next`)
  return data
}
