// src/composables/useDraftImportService.ts

import { apiService as apiClient } from '@/services/api';

export interface DraftImportResponse {
  success: boolean;
  message: string;
  jobId: string;
}

export interface DraftImportStats {
  year: number;
  totalPicks: number;
  newPlayers: number;
  existingPlayers: number;
  newPlayerTeams: number;
  errors: number;
  startTime: string;
  endTime?: string;
}

export interface JobStatusResponse {
  success: boolean;
  job: {
    id: string;
    type: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
    metadata?: {
      year?: number;
      result?: DraftImportStats;
      error?: string;
    };
    createdAt: string;
    updatedAt: string;
  };
}

class DraftImportService {
  private readonly baseUrl = '/api/draft-import';

  async importDraft(year: number): Promise<DraftImportResponse> {
    const response = await apiClient.post<DraftImportResponse>(this.baseUrl, { year });
    return response.data;
  }

  async getImportStatus(jobId: string): Promise<JobStatusResponse> {
    const response = await apiClient.get<JobStatusResponse>(`${this.baseUrl}/status/${jobId}`);
    return response.data;
  }
}

const draftImportService = new DraftImportService();

export function useDraftImportService() {
  return draftImportService;
}