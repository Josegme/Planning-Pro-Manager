import type { ServiceTemplate } from '../../../core/domain/serviceTemplate/ServiceTemplate'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toServiceTemplate(raw: any): ServiceTemplate {
  return {
    id: raw.id,
    orgId: raw.org_id,
    name: raw.name,
    category: raw.category,
    description: raw.description ?? null,
    isRequired: raw.is_required ?? false,
    displayOrder: raw.display_order ?? 0,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  }
}
