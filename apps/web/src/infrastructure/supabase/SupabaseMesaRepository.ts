import { supabase } from './client'
import { toMesa } from './mappers/mesaMapper'
import type { Mesa } from '../../core/domain/mesa/Mesa'
import type {
  IMesaRepository,
  CreateMesaData,
  UpdateMesaData,
} from '../../core/ports/IMesaRepository'

const TABLE = 'mesas'

export class SupabaseMesaRepository implements IMesaRepository {
  async findByEvento(eventoId: string): Promise<Mesa[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('evento_id', eventoId)
      .order('number', { ascending: true })
    if (error) throw error
    return (data ?? []).map(toMesa)
  }

  async findById(id: string): Promise<Mesa | null> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return data ? toMesa(data) : null
  }

  async isNumberTaken(
    eventoId: string,
    number: number,
    excludeId?: string,
  ): Promise<boolean> {
    let query = supabase
      .from(TABLE)
      .select('id')
      .eq('evento_id', eventoId)
      .eq('number', number)
    if (excludeId) query = query.neq('id', excludeId)
    const { data, error } = await query.maybeSingle()
    if (error) throw error
    return data !== null
  }

  async create(input: CreateMesaData): Promise<Mesa> {
    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        evento_id: input.eventoId,
        number: input.number,
        name: input.name ?? null,
        capacity: input.capacity,
        menu_especial: input.menuEspecial ?? null,
      })
      .select()
      .single()
    if (error) throw error
    return toMesa(data)
  }

  async update(id: string, input: UpdateMesaData): Promise<Mesa> {
    const row: Record<string, unknown> = {}
    if (input.number !== undefined) row.number = input.number
    if ('name' in input) row.name = input.name
    if (input.capacity !== undefined) row.capacity = input.capacity
    if ('menuEspecial' in input) row.menu_especial = input.menuEspecial
    if ('position' in input) row.position = input.position

    const { data, error } = await supabase
      .from(TABLE)
      .update(row)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return toMesa(data)
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id)
    if (error) throw error
  }

  async assignInvitado(invitadoId: string, mesaId: string | null): Promise<void> {
    const { error } = await supabase
      .from('invitados')
      .update({ mesa_id: mesaId })
      .eq('id', invitadoId)
    if (error) throw error
  }

  async bulkAssign(
    assignments: { invitadoId: string; mesaId: string }[],
  ): Promise<void> {
    if (assignments.length === 0) return

    // Batch via individual updates — Supabase doesn't support multi-row UPDATE with different values in one call
    await Promise.all(
      assignments.map(({ invitadoId, mesaId }) =>
        supabase
          .from('invitados')
          .update({ mesa_id: mesaId })
          .eq('id', invitadoId)
          .then(({ error }) => { if (error) throw error }),
      ),
    )
  }
}
