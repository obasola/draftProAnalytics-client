// src/services/draftPickApiService.ts
import axios, { AxiosInstance } from 'axios'
import type {
  DraftPick,
  DraftPickWithRelations,
  CreateDraftPickData,
  UpdateDraftPickData,
} from '../domain/entities/draftPick'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export class DraftPickApiService {
  private readonly api: AxiosInstance
  private readonly baseUrl: string = `${API_BASE_URL}/draftpicks`

  constructor(apiInstance: AxiosInstance) {
    this.api = apiInstance
  }

  async create(data: CreateDraftPickData): Promise<DraftPick> {
    const response = await this.api.post<DraftPick>(this.baseUrl, data)
    return response.data
  }

  async findById(id: number): Promise<DraftPick> {
    const response = await this.api.get<DraftPick>(`${this.baseUrl}/${id}`)
    return response.data
  }

  async findAll(filters?: {
    draftYear?: number
    currentTeamId?: number
    used?: boolean
    round?: number
  }): Promise<DraftPick[]> {
    const params = new URLSearchParams()
    if (filters?.draftYear !== undefined) {
      params.append('draftYear', filters.draftYear.toString())
    }
    if (filters?.currentTeamId !== undefined) {
      params.append('currentTeamId', filters.currentTeamId.toString())
    }
    if (filters?.used !== undefined) {
      params.append('used', filters.used.toString())
    }
    if (filters?.round !== undefined) {
      params.append('round', filters.round.toString())
    }

    const response = await this.api.get<DraftPick[]>(`${this.baseUrl}?${params.toString()}`)
    return response.data
  }

  async update(id: number, data: UpdateDraftPickData): Promise<DraftPick> {
    const response = await this.api.put<DraftPick>(`${this.baseUrl}/${id}`, data)
    return response.data
  }

  async delete(id: number): Promise<void> {
    await this.api.delete(`${this.baseUrl}/${id}`)
  }

  async fetchAllWithRelations(): Promise<DraftPickWithRelations[]> {
    const response = await this.api.get<DraftPickWithRelations[]>(`${this.baseUrl}/relations/all`)
    return response.data
  }

  async fetchByYear(year: number): Promise<DraftPickWithRelations[]> {
    const response = await this.api.get<DraftPickWithRelations[]>(
      `${this.baseUrl}/relations/year/${year}`
    )
    return response.data
  }

  async fetchByTeamAndYear(teamId: number, year: number): Promise<DraftPickWithRelations[]> {
    try {
      const url = `${this.baseUrl}/relations/team/${teamId}/year/${year}`
    //  alert(`📡 (src/services/draftPickApiService.ts) Calling: ${url}`)
      console.log(`📡 Calling: ${url}`)

      const response = await this.api.get<DraftPickWithRelations[]>(url)

      console.log('📊 Response type:', typeof response.data)
      console.log('📊 Is Array:', Array.isArray(response.data))

      // Check if we got HTML instead of JSON
      if (typeof response.data === 'string') {
        console.error('❌ Received HTML instead of JSON!')
        console.error('This means the API endpoint does not exist on the server.')
        throw new Error('API endpoint not found - received HTML instead of JSON')
      }

      if (!Array.isArray(response.data)) {
        console.error('❌ Invalid response format:', response.data)
        throw new Error('Expected array response')
      }

      console.log(`✅ Received ${response.data.length} draft picks`)
      return response.data
    } catch (error: any) {
      console.error('❌ API Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
      })
      throw error
    }
  }
}

// Export singleton instance
export const draftPickApiService = new DraftPickApiService(axios)
