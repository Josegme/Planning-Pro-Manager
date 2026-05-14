import type { Provider } from '../../../core/domain/provider/Provider'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toProvider(raw: any): Provider {
  return {
    id: raw.id,
    orgId: raw.org_id,
    name: raw.name,
    phone: raw.phone ?? null,
    email: raw.email ?? null,
    address: raw.address ?? null,
    notes: raw.notes ?? null,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  }
}
