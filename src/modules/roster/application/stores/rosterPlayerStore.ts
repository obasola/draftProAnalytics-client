// src/modules/roster/domain/stores/rosterPlayerStore.ts

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import type {
  RosterPlayerResponseDto,
  RosterPlayerListDto,
  CreateRosterPlayerDto,
  UpdateRosterPlayerDto,
  RosterPlayersByTeamDto
} from '@/modules/roster/application/dto/rosterPlayer.dto'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export const useRosterPlayerStore = defineStore('rosterPlayer', () => {
  // State
  const rosterPlayers = ref<RosterPlayerListDto[]>([])
  const currentRosterPlayer = ref<RosterPlayerResponseDto | null>(null)
  const rosterPlayersByTeam = ref<Map<number, RosterPlayerListDto[]>>(new Map())
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const starters = computed(() => 
    rosterPlayers.value.filter(player => player.isStarter)
  )

  const backups = computed(() => 
    rosterPlayers.value.filter(player => !player.isStarter)
  )

  const getPlayersByPositionGroup = computed(() => 
    (positionGroup: string) => 
      rosterPlayers.value.filter(player => player.positionGroup === positionGroup)
  )

  // Actions
  async function fetchAll(): Promise<void> {
    loading.value = true
    error.value = null
    
    try {
      const response = await axios.get<RosterPlayerListDto[]>(
        `${API_BASE_URL}/roster-players`
      )
      rosterPlayers.value = response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch roster players'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id: string): Promise<void> {
    loading.value = true
    error.value = null
    
    try {
      const response = await axios.get<RosterPlayerResponseDto>(
        `${API_BASE_URL}/roster-players/${id}`
      )
      currentRosterPlayer.value = response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch roster player'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchByTeamId(teamId: number): Promise<void> {
    loading.value = true
    error.value = null
    
    try {
      const response = await axios.get<RosterPlayerListDto[]>(
        `${API_BASE_URL}/roster-players/team/${teamId}`
      )
      rosterPlayersByTeam.value.set(teamId, response.data)
      rosterPlayers.value = response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch team roster'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchStarters(teamId: number): Promise<void> {
    loading.value = true
    error.value = null
    
    try {
      const response = await axios.get<RosterPlayerListDto[]>(
        `${API_BASE_URL}/roster-players/team/${teamId}/starters`
      )
      rosterPlayers.value = response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch starters'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchByPositionGroup(
    teamId: number, 
    positionGroup: string
  ): Promise<void> {
    loading.value = true
    error.value = null
    
    try {
      const response = await axios.get<RosterPlayerListDto[]>(
        `${API_BASE_URL}/roster-players/team/${teamId}/position-group/${positionGroup}`
      )
      rosterPlayers.value = response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch players by position group'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function create(data: CreateRosterPlayerDto): Promise<RosterPlayerResponseDto> {
    loading.value = true
    error.value = null
    
    try {
      const response = await axios.post<RosterPlayerResponseDto>(
        `${API_BASE_URL}/roster-players`,
        data
      )
      
      // Add to local state
      const newPlayer = {
        id: response.data.id,
        teamId: response.data.teamId,
        playerName: response.data.playerName,
        position: response.data.position,
        positionGroup: response.data.positionGroup,
        depthChartOrder: response.data.depthChartOrder,
        age: response.data.age,
        yearsExperience: response.data.yearsExperience,
        performanceGrade: response.data.performanceGrade,
        isStarter: response.data.isStarter,
        injuryStatus: response.data.injuryStatus
      }
      
      rosterPlayers.value.push(newPlayer)
      currentRosterPlayer.value = response.data
      
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to create roster player'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function update(
    id: string, 
    data: UpdateRosterPlayerDto
  ): Promise<RosterPlayerResponseDto> {
    loading.value = true
    error.value = null
    
    try {
      const response = await axios.patch<RosterPlayerResponseDto>(
        `${API_BASE_URL}/roster-players/${id}`,
        data
      )
      
      // Update local state
      const index = rosterPlayers.value.findIndex(p => p.id === id)
      if (index !== -1) {
        rosterPlayers.value[index] = {
          id: response.data.id,
          teamId: response.data.teamId,
          playerName: response.data.playerName,
          position: response.data.position,
          positionGroup: response.data.positionGroup,
          depthChartOrder: response.data.depthChartOrder,
          age: response.data.age,
          yearsExperience: response.data.yearsExperience,
          performanceGrade: response.data.performanceGrade,
          isStarter: response.data.isStarter,
          injuryStatus: response.data.injuryStatus
        }
      }
      
      currentRosterPlayer.value = response.data
      
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to update roster player'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function remove(id: string): Promise<void> {
    loading.value = true
    error.value = null
    
    try {
      await axios.delete(`${API_BASE_URL}/roster-players/${id}`)
      
      // Remove from local state
      rosterPlayers.value = rosterPlayers.value.filter(p => p.id !== id)
      
      if (currentRosterPlayer.value?.id === id) {
        currentRosterPlayer.value = null
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete roster player'
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearCurrent(): void {
    currentRosterPlayer.value = null
  }

  function clearAll(): void {
    rosterPlayers.value = []
    currentRosterPlayer.value = null
    rosterPlayersByTeam.value.clear()
    error.value = null
  }

  return {
    // State
    rosterPlayers,
    currentRosterPlayer,
    rosterPlayersByTeam,
    loading,
    error,
    
    // Computed
    starters,
    backups,
    getPlayersByPositionGroup,
    
    // Actions
    fetchAll,
    fetchById,
    fetchByTeamId,
    fetchStarters,
    fetchByPositionGroup,
    create,
    update,
    remove,
    clearCurrent,
    clearAll
  }
})