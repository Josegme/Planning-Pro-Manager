import { supabase } from './client'
import { toProvider } from './mappers/providerMapper'
import type { Provider } from '../../core/domain/provider/Provider'
import type {
  IProviderRepository,
  CreateProviderData,
  UpdateProviderData,
} from '../../core/ports/IProviderRepository'

const TABLE = 'providers'

function toRow(data: CreateProviderData | UpdateProviderData): Record<string, unknown> {
  const row: Record<string, unknown> = {}
  if ('name' in data && data.name !== undefined) row.name = data.name
  if ('phone' in data) row.phone = data.phone
  if ('email' in data) row.email = data.email
  if ('address' in data) row.address = data.address
  if ('notes' in data) row.notes = data.notes
  return row
}

export class SupabaseProviderRepository implements IProviderRepository {
  async findByOrg(): Promise<Provider[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('name', { ascending: true })
    if (error) throw error
    return (data ?? []).map(toProvider)
  }

  async findById(id: string): Promise<Provider | null> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return data ? toProvider(data) : null
  }

  async create(input: CreateProviderData): Promise<Provider> {
    const { data, error } = await supabase
      .from(TABLE)
      .insert(toRow(input))
      .select()
      .single()
    if (error) throw error
    return toProvider(data)
  }

  async update(id: string, input: UpdateProviderData): Promise<Provider> {
    const { data, error } = await supabase
      .from(TABLE)
      .update(toRow(input))
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return toProvider(data)
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id)
    if (error) throw error
  }
}
