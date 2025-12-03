// File: src/services/teamService.ts
import { apiService } from './api'
import type { Team, PaginatedResponse, ApiResponse } from '@/types'

export class TeamService {
  private readonly endpoint = '/teams'

  async getAll(page = 1, limit = 10): Promise<PaginatedResponse<Team>> {
 
    const pageNum = Number(page)
    const limitNum = Number(limit)
    
    // Build URL manually to avoid axios params encoding issues
    const url = `${this.endpoint}?page=${pageNum}&limit=${limitNum}`
  
    try {
      const response = await apiService.get<ApiResponse<Team[], any>>(url)
      
      // Check if backend respected our parameters
      const backendPage = response.data.pagination?.page
      const backendLimit = response.data.pagination?.limit
      console.log(`🔍 Parameter check: requested page=${pageNum}, got page=${backendPage}`)
      console.log(`🔍 Parameter check: requested limit=${limitNum}, got limit=${backendLimit}`)
      
      if (backendPage !== pageNum) {
        console.warn(`⚠️ Backend page mismatch! Requested: ${pageNum}, Got: ${backendPage}`)
      }
      if (backendLimit !== limitNum) {
        console.warn(`⚠️ Backend limit mismatch! Requested: ${limitNum}, Got: ${backendLimit}`)
      }
      
      const result = {
        data: response.data.data,
        pagination: response.data.pagination
      }
      
      console.log('🎯 Returning to store:', result)
      return result
      
    } catch (error) {
      console.error('❌ API call failed:', error)
      throw error
    }
  }

    async getAllTeams(page = 1, limit = 10): Promise<Team[]> {
 
    const pageNum = Number(page)
    const limitNum = Number(limit)
    
    // Build URL manually to avoid axios params encoding issues
    const url = `${this.endpoint}?page=${pageNum}&limit=${limitNum}`
  
    try {
      const response = await apiService.get<ApiResponse<Team[], any>>(url)
      
      // Check if backend respected our parameters
      const backendPage = response.data.pagination?.page
      const backendLimit = response.data.pagination?.limit
      console.log(`🔍 Parameter check: requested page=${pageNum}, got page=${backendPage}`)
      console.log(`🔍 Parameter check: requested limit=${limitNum}, got limit=${backendLimit}`)
      
      if (backendPage !== pageNum) {
        console.warn(`⚠️ Backend page mismatch! Requested: ${pageNum}, Got: ${backendPage}`)
      }
      if (backendLimit !== limitNum) {
        console.warn(`⚠️ Backend limit mismatch! Requested: ${limitNum}, Got: ${backendLimit}`)
      }
      
      const data = response.data.data
      
      return data
      
    } catch (error) {
      console.error('❌ API call failed:', error)
      throw error
    }
  }

  async getById(id: number): Promise<Team> {
    const response = await apiService.get<ApiResponse<Team>>(
      `${this.endpoint}/${id}`
    )
    return response.data.data
  }

  async getByName(name: string, page = 1, limit = 10): Promise<PaginatedResponse<Team>> {
    const pageNum = Number(page)
    const limitNum = Number(limit)
    
    // Build URL manually to avoid axios params encoding issues
    const url = `${this.endpoint}/filter?name=${encodeURIComponent(name)}&page=${pageNum}&limit=${limitNum}`
    console.log('🚀 Making filter request to:', url)
    
    const response = await apiService.get<ApiResponse<Team[], any>>(url)
    return {
      data: response.data.data,
      pagination: response.data.pagination || null
    }
  }

  async getTeamNames(): Promise<{ id: number; name: string }[]> {
  try {
    // Request all teams with a high limit (32 NFL teams)
    const url = `${this.endpoint}?page=1&limit=32`;
    const response = await apiService.get<ApiResponse<Team[], any>>(url);
    
    // Map the response to simple id/name pairs
    const teamNames = response.data.data.map(team => ({
      id: team.id ? team.id : 0,
      name: team.name
    }));
    
    console.log('📋 Team names loaded:', teamNames.length);
    return teamNames;
    
  } catch (error) {
    console.error('❌ Failed to load team names:', error);
    throw error;
  }
}
  async create(data: Omit<Team, 'id'>): Promise<Team> {
    const response = await apiService.post<ApiResponse<Team>>(this.endpoint, data)
    return response.data.data
  }

  async update(id: number, data: Partial<Team>): Promise<Team> {
    const response = await apiService.put<ApiResponse<Team>>(
      `${this.endpoint}/${id}`, 
      data
    )
    return response.data.data
  }

  async delete(id: number): Promise<void> {
    await apiService.delete(`${this.endpoint}/${id}`)
  }
}

export const teamService = new TeamService()