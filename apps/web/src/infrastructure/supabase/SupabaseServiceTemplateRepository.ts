import { supabase } from './client'
import { toServiceTemplate } from './mappers/serviceTemplateMapper'
import type { ServiceTemplate } from '../../core/domain/serviceTemplate/ServiceTemplate'
import type {
  IServiceTemplateRepository,
  CreateServiceTemplateData,
  UpdateServiceTemplateData,
} from '../../core/ports/IServiceTemplateRepository'

const TABLE = 'service_templates'

export class SupabaseServiceTemplateRepository implements IServiceTemplateRepository {
  async findByOrg(): Promise<ServiceTemplate[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('category', { ascending: true })
      .order('display_order', { ascending: true })
    if (error) throw error
    return (data ?? []).map(toServiceTemplate)
  }

  async create(input: CreateServiceTemplateData): Promise<ServiceTemplate> {
    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        name: input.name,
        category: input.category,
        description: input.description ?? null,
        is_required: input.isRequired ?? false,
        display_order: input.displayOrder ?? 0,
      })
      .select()
      .single()
    if (error) throw error
    return toServiceTemplate(data)
  }

  async update(id: string, input: UpdateServiceTemplateData): Promise<ServiceTemplate> {
    const row: Record<string, unknown> = {}
    if (input.name !== undefined) row.name = input.name
    if (input.category !== undefined) row.category = input.category
    if ('description' in input) row.description = input.description
    if (input.isRequired !== undefined) row.is_required = input.isRequired
    if (input.displayOrder !== undefined) row.display_order = input.displayOrder

    const { data, error } = await supabase
      .from(TABLE)
      .update(row)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return toServiceTemplate(data)
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id)
    if (error) throw error
  }
}
