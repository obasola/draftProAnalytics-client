import { computed, ref } from 'vue'
import type { Prospect } from '@/types'
import { postDraftWrMetricsApi } from '../infrastructure/PostDraftWrMetricsApi'
import type { ManualWrMetricRequest, ResolvedWrMetrics, WrMetricRecord } from '../domain/WrMetricTypes'

export function useWrMetricManagement() {
  const draftYear = ref(new Date().getFullYear())
  const prospects = ref<Prospect[]>([])
  const selectedProspect = ref<Prospect | null>(null)
  const resolved = ref<ResolvedWrMetrics | null>(null)
  const loading = ref(false)
  const errorMessage = ref('')
  const records = computed<WrMetricRecord[]>(() => resolved.value?.records ?? [])

  async function searchProspects(query = ''): Promise<void> {
    loading.value = true; errorMessage.value = ''
    try { prospects.value = await postDraftWrMetricsApi.searchProspects(draftYear.value, query) }
    catch (error: unknown) { errorMessage.value = getErrorMessage(error) }
    finally { loading.value = false }
  }
  async function loadResolved(): Promise<void> {
    if (!selectedProspect.value?.id) { resolved.value = null; return }
    loading.value = true; errorMessage.value = ''
    try { resolved.value = await postDraftWrMetricsApi.getResolved(selectedProspect.value.id, draftYear.value) }
    catch (error: unknown) { errorMessage.value = getErrorMessage(error); resolved.value = null }
    finally { loading.value = false }
  }
  async function saveManual(payload: ManualWrMetricRequest): Promise<void> { await postDraftWrMetricsApi.saveManual(payload); await loadResolved() }
  return { draftYear, prospects, selectedProspect, resolved, records, loading, errorMessage, searchProspects, loadResolved, saveManual }
}

export function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: unknown } }).response
    const data = response?.data
    if (typeof data === 'object' && data !== null) {
      if ('message' in data && typeof (data as { message?: unknown }).message === 'string') return (data as { message: string }).message
      if ('errors' in data && Array.isArray((data as { errors?: unknown }).errors)) return (data as { errors: unknown[] }).errors.map(String).join('; ')
    }
  }
  return error instanceof Error ? error.message : 'The request failed.'
}
