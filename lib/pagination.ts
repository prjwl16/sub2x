import { z } from 'zod'
import { PaginationSchema } from './zod-schemas'

export interface PaginationMeta {
  total: number
  offset: number
  limit: number
}

export function parsePagination(searchParams: URLSearchParams) {
  return PaginationSchema.parse({
    offset: searchParams.get('offset'),
    limit: searchParams.get('limit'),
  })
}

export function buildMeta(total: number, offset: number, limit: number): PaginationMeta {
  return {
    total,
    offset,
    limit,
  }
}
