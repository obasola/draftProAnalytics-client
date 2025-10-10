// src/utils/paging.ts
import type { AxiosResponse } from 'axios'

export type Pagination = { total?: number; page?: number; pageSize?: number }
export type PageResponse<T> = { items: T[]; pagination?: Pagination }

const isObj = (v: any): v is Record<string, unknown> => v !== null && typeof v === 'object'

const has = (o: any, k: string) => isObj(o) && Object.prototype.hasOwnProperty.call(o, k)

// Safer header getter across Axios v1 / older shapes
const getHeader = (hdr: any, name: string): string | undefined => {
  if (!hdr) return undefined
  if (typeof hdr.get === 'function') {
    const v = hdr.get(name) // string | null
    return v ?? undefined
  }
  const v = hdr[name] as unknown
  return typeof v === 'string' ? v : undefined
}

// Broad “array-ish” detector (true arrays, proxies, iterables with numeric length)
const toRowsArray = <T>(data: any): T[] | undefined => {
  if (Array.isArray(data)) return data as T[]
  // iterable?
  if (data && typeof data[Symbol.iterator] === 'function') {
    try {
      return Array.from(data as Iterable<T>)
    } catch {
      /* ignore */
    }
  }
  // numeric length + index 0 present ⇒ likely array-like
  if (isObj(data) && typeof (data as any).length === 'number') {
    try {
      const len = (data as any).length
      if (len >= 0) return Array.from({ length: len }, (_, i) => (data as any)[i]) as T[]
    } catch {
      /* ignore */
    }
  }
  return undefined
}

export function normalizePaged<T>(res: AxiosResponse<any>): {
  rows: T[]
  total: number
  page?: number
  pageSize?: number
} {
  const hdr = res.headers as any
  const headerTotalStr = getHeader(hdr, 'x-total-count') || getHeader(hdr, 'X-Total-Count')
  const headerTotal = headerTotalStr ? parseInt(headerTotalStr, 10) : undefined

  //const data = res.data.data
  // before your existing shape checks
  const raw = res.data
  // prefer nested `data` if it’s an array/collection-ish; otherwise use top-level
  const data =
    raw &&
    typeof raw === 'object' &&
    'data' in raw &&
    (Array.isArray((raw as any).data) || typeof (raw as any).data === 'object')
      ? (raw as any).data
      : raw;

  // 0) Prefer broad array/array-like FIRST
  {
    const rows = toRowsArray<T>(data)
    if (rows) {
      const total = headerTotal ?? rows.length
      return { rows, total }
    }
  }

  // 1) { items, pagination }
  if (isObj(data) && Array.isArray((data as any).items)) {
    const items = (data as any).items as T[]
    const pg = (data as any).pagination || {}
    const total = (pg?.total ?? headerTotal ?? items.length) as number
    return { rows: items, total, page: pg?.page, pageSize: pg?.pageSize }
  }

  // 2) { rows, total }
  if (isObj(data) && Array.isArray((data as any).rows)) {
    const rows = (data as any).rows as T[]
    const total = (data as any).total ?? headerTotal ?? rows.length
    return { rows, total, page: (data as any).page, pageSize: (data as any).pageSize }
  }

  // 3) { results, count }
  if (isObj(data) && Array.isArray((data as any).results)) {
    const rows = (data as any).results as T[]
    const total = (data as any).count ?? headerTotal ?? rows.length
    return { rows, total }
  }

  // 4) { data: [...], meta: { total } }
  if (isObj(data) && Array.isArray((data as any).data) && isObj((data as any).meta)) {
    const rows = (data as any).data as T[]
    const total = (data as any).meta.total ?? headerTotal ?? rows.length
    const page = (data as any).meta.page ?? (data as any).meta.currentPage
    const pageSize = (data as any).meta.pageSize ?? (data as any).meta.perPage
    return { rows, total, page, pageSize }
  }

  // 5) Last resort
  return { rows: [], total: headerTotal ?? 0 }
}
