import type { EventLayout } from '../../../core/domain/layout/EventLayout'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toEventLayout(raw: any): EventLayout {
  return {
    id: raw.id,
    eventoId: raw.evento_id,
    elements: raw.elements ?? [],
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  }
}
