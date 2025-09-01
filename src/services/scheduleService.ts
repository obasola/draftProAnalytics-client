import { apiService } from './api'
import type { Schedule, ApiResponse, PaginatedResponse } from '@/types'

export class ScheduleService {
  private readonly endpoint = '/schedules'

  // paginated-queries: Fix for double nesting on server
  async getAll(page = 1, limit = 10): Promise<PaginatedResponse<Schedule>> {
    const pageNum = Number(page)
    const limitNum = Number(limit)
    
    // Build URL manually to avoid axios params encoding issues
    const url = `${this.endpoint}?page=${pageNum}&limit=${limitNum}`
  
    try {
      const response = await apiService.get<ApiResponse<Schedule[], any>>(url)
      
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
      
      return result
      
    } catch (error) {
      console.error('❌ API call failed:', error)
      throw error
    }
  }

  // non-paginated queries: fix for double nesting from server
  async getById(id: number): Promise<Schedule> {
    const response = await apiService.get<ApiResponse<Schedule>>(
      `${this.endpoint}/${id}`
    )
    return response.data.data
  }

  async getByTeam(teamId: number): Promise<Schedule[]> {
    const response = await apiService.get<ApiResponse<Schedule[]>>(
      `${this.endpoint}/team/${teamId}`
    )
    return response.data.data
  }

  async getBySeason(seasonYear: number): Promise<Schedule[]> {
    const response = await apiService.get<ApiResponse<Schedule[]>>(
      `${this.endpoint}/season/${seasonYear}`
    )
    return response.data.data
  }
  // '/team/:teamId/season/:seasonYear'
  async getByTeamSeason(teamId: number, seasonYear: number): Promise<Schedule[]> {
    const response = await apiService.get<ApiResponse<Schedule[]>>(
      `${this.endpoint}/teamId/${teamId}/season/${seasonYear}`
    )
    return response.data.data
  }

  async create(data: Omit<Schedule, 'id'>): Promise<Schedule> {
    const response = await apiService.post<ApiResponse<Schedule>>(this.endpoint, data)
    return response.data.data
  }

  async update(id: number, data: Partial<Schedule>): Promise<Schedule> {
    const response = await apiService.put<ApiResponse<Schedule>>(`${this.endpoint}/${id}`, data)
    return response.data.data
  }

  async delete(id: number): Promise<void> {
    await apiService.delete(`${this.endpoint}/${id}`)
  }
}

export const scheduleService = new ScheduleService()