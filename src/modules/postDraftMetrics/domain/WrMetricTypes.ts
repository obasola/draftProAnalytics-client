export const WR_METRIC_KEYS = [
  'yardsPerRouteRun',
  'receivingGrade',
  'contestedCatchRate',
  'behindLosTargetRate',
  'catchRate',
  'missedTacklesForcedPerReception',
  'yacAfterContactPerReception',
] as const

export type WrMetricKey = (typeof WR_METRIC_KEYS)[number]
export type WrMetricSourceType = 'MANUAL' | 'CSV_IMPORT' | 'LICENSED_PROVIDER' | 'DERIVED' | 'DPA' | 'B4ME' | string

export interface ProspectOption { id: number; label: string; firstName: string; lastName: string; position: string; college: string; draftYear?: number }
export interface ResolvedMetricValue {
  value: number | null
  sourceType?: WrMetricSourceType | null
  sourceName?: string | null
  sourceReference?: string | null
  verified?: boolean
  recordId?: number | null
  providerPriority?: number | null
  seasonYear?: number | null
  resolutionSource?: string | null
  verificationNotes?: string | null
  verifiedAt?: string | null
  verifiedBy?: string | null
}
export type ResolvedWrMetrics = Partial<Record<WrMetricKey, ResolvedMetricValue>> & {
  prospectId?: number
  draftYear?: number
  providerPriority?: unknown
  records?: WrMetricRecord[]
}
export interface WrMetricRecord {
  id: number
  prospectId: number
  draftYear: number
  seasonYear: number
  sourceName: string
  sourceType: WrMetricSourceType
  sourceReference?: string | null
  notes?: string | null
  verified: boolean
  verifiedAt?: string | null
  verifiedBy?: string | null
  verificationNotes?: string | null
  yardsPerRouteRun?: number | null
  receivingGrade?: number | null
  contestedCatchRate?: number | null
  behindLosTargetRate?: number | null
  catchRate?: number | null
  missedTacklesForcedPerReception?: number | null
  yacAfterContactPerReception?: number | null
}
export interface ManualWrMetricRequest {
  id?: number
  prospectId: number
  draftYear: number
  seasonYear: number
  yardsPerRouteRun: number | null
  receivingGrade: number | null
  contestedCatchRate: number | null
  behindLosTargetRate: number | null
  catchRate: number | null
  missedTacklesForcedPerReception: number | null
  yacAfterContactPerReception: number | null
  sourceName: string
  sourceType: WrMetricSourceType
  sourceReference: string | null
  notes: string | null
  verified?: boolean
}
export interface CsvPreviewRow { rowNumber?: number; prospectId?: number; valid?: boolean; action?: string; errors?: string[]; warnings?: string[]; [key: string]: unknown }
export interface CsvPreviewResult {
  validRows?: CsvPreviewRow[]
  invalidRows?: CsvPreviewRow[]
  missingProspects?: CsvPreviewRow[]
  duplicates?: CsvPreviewRow[]
  updates?: CsvPreviewRow[]
  protectedVerifiedRecords?: CsvPreviewRow[]
  skippedRows?: CsvPreviewRow[]
  summary?: Record<string, number>
  [key: string]: unknown
}
export interface CsvImportResult { imported?: number; updated?: number; skipped?: number; failed?: number; rows?: CsvPreviewRow[]; [key: string]: unknown }
export interface VerificationRequest { notes?: string | null }
