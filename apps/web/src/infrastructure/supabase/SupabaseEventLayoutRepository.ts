import { supabase } from './client'
import { toEventLayout } from './mappers/eventLayoutMapper'
import type { EventLayout, StructuralElement } from '../../core/domain/layout/EventLayout'
import type { IEventLayoutRepository } from '../../core/ports/IEventLayoutRepository'

const TABLE = 'event_layouts'

export class SupabaseEventLayoutRepository implements IEventLayoutRepository {
  async findByEvento(eventoId: string): Promise<EventLayout | null> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('evento_id', eventoId)
      .maybeSingle()
    if (error) throw error
    return data ? toEventLayout(data) : null
  }

  async save(eventoId: string, elements: StructuralElement[]): Promise<EventLayout> {
    const { data, error } = await supabase
      .from(TABLE)
      .upsert({ evento_id: eventoId, elements }, { onConflict: 'evento_id' })
      .select()
      .single()
    if (error) throw error
    return toEventLayout(data)
  }
}
