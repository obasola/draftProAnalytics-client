import { apiService } from '@/services/api'
import type { Prospect } from '@/types'
import type { CsvImportResult, CsvPreviewResult, ManualWrMetricRequest, ResolvedWrMetrics, VerificationRequest, WrMetricRecord } from '../domain/WrMetricTypes'

function unwrap<T>(value: T | { data: T }): T {
  return typeof value === 'object' && value !== null && 'data' in value ? (value as { data: T }).data : value as T
}

function asProspects(value: unknown): Prospect[] {
  if (Array.isArray(value)) return value as Prospect[]
  if (typeof value === 'object' && value !== null && 'data' in value && Array.isArray((value as { data: unknown }).data)) return (value as { data: Prospect[] }).data
  return []
}

export const postDraftWrMetricsApi = {
  async searchProspects(draftYear: number, query: string): Promise<Prospect[]> {
    const response = await apiService.get<unknown>('/prospects/filter', { draftYear, position: 'WR', name: query || undefined })
    return asProspects(response.data)
  },
  async getResolved(prospectId: number, draftYear: number): Promise<ResolvedWrMetrics> {
    const response = await apiService.get<ResolvedWrMetrics | { data: ResolvedWrMetrics }>(`/post-draft-metrics/wr/prospects/${prospectId}/years/${draftYear}/resolved`)
    return unwrap(response.data)
  },
  async saveManual(payload: ManualWrMetricRequest): Promise<WrMetricRecord> {
    const response = payload.id
      ? await apiService.put<WrMetricRecord | { data: WrMetricRecord }>(`/post-draft-metrics/wr/manual/${payload.id}`, payload)
      : await apiService.post<WrMetricRecord | { data: WrMetricRecord }>('/post-draft-metrics/wr/manual', payload)
    return unwrap(response.data)
  },
  async previewCsv(file: File): Promise<CsvPreviewResult> {
    const form = new FormData(); form.append('file', file)
    const response = await apiService.post<CsvPreviewResult | { data: CsvPreviewResult }>('/post-draft-metrics/wr/import/preview', form)
    return unwrap(response.data)
  },
  async importCsv(file: File): Promise<CsvImportResult> {
    const form = new FormData(); form.append('file', file)
    const response = await apiService.post<CsvImportResult | { data: CsvImportResult }>('/post-draft-metrics/wr/import', form)
    return unwrap(response.data)
  },
  async verify(id: number, request: VerificationRequest): Promise<WrMetricRecord> {
    const response = await apiService.patch<WrMetricRecord | { data: WrMetricRecord }>(`/post-draft-metrics/wr/${id}/verify`, request)
    return unwrap(response.data)
  },
  async unverify(id: number, request: VerificationRequest): Promise<WrMetricRecord> {
    const response = await apiService.patch<WrMetricRecord | { data: WrMetricRecord }>(`/post-draft-metrics/wr/${id}/unverify`, request)
    return unwrap(response.data)
  },
}
