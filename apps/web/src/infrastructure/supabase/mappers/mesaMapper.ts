import type { Mesa } from '../../../core/domain/mesa/Mesa'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toMesa(raw: any): Mesa {
  return {
    id: raw.id,
    eventoId: raw.evento_id,
    number: raw.number,
    name: raw.name ?? null,
    capacity: raw.capacity,
    menuEspecial: raw.menu_especial ?? null,
    position: raw.position ?? null,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  }
}
