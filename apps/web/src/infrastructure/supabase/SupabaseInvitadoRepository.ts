import { supabase } from './client'
import { toInvitado } from './mappers/invitadoMapper'
import type { Invitado } from '../../core/domain/invitado/Invitado'
import type {
  IInvitadoRepository,
  CreateInvitadoData,
  UpdateInvitadoData,
  ImportResult,
} from '../../core/ports/IInvitadoRepository'

const TABLE = 'invitados'

function toRow(data: CreateInvitadoData | UpdateInvitadoData): Record<string, unknown> {
  const row: Record<string, unknown> = {}
  if ('eventoId' in data && data.eventoId !== undefined) row.evento_id = data.eventoId
  if ('nombre' in data && data.nombre !== undefined) row.nombre = data.nombre
  if ('apellido' in data && data.apellido !== undefined) row.apellido = data.apellido
  if ('dni' in data) row.dni = (data as UpdateInvitadoData).dni
  if ('email' in data) row.email = (data as UpdateInvitadoData).email
  if ('whatsapp' in data) row.whatsapp = (data as UpdateInvitadoData).whatsapp
  if ('grupo' in data) row.grupo = (data as UpdateInvitadoData).grupo
  if ('acompanantesEsperados' in data && data.acompanantesEsperados !== undefined)
    row.acompanantes_esperados = data.acompanantesEsperados
  if ('acompanantesPresentes' in data)
    row.acompanantes_presentes = (data as UpdateInvitadoData).acompanantesPresentes
  if ('dietaryRestrictions' in data && data.dietaryRestrictions !== undefined)
    row.dietary_restrictions = data.dietaryRestrictions
  if ('mesaId' in data) row.mesa_id = (data as UpdateInvitadoData).mesaId
  if ('status' in data && (data as UpdateInvitadoData).status !== undefined)
    row.status = (data as UpdateInvitadoData).status
  if ('qrToken' in data) row.qr_token = (data as UpdateInvitadoData).qrToken
  if ('checkinAt' in data) row.checkin_at = (data as UpdateInvitadoData).checkinAt
  return row
}

export class SupabaseInvitadoRepository implements IInvitadoRepository {
  async findByEvento(eventoId: string): Promise<Invitado[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('evento_id', eventoId)
      .order('apellido', { ascending: true })
    if (error) throw error
    return (data ?? []).map(toInvitado)
  }

  async findById(id: string): Promise<Invitado | null> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return data ? toInvitado(data) : null
  }

  async isDniTaken(eventoId: string, dni: string, excludeId?: string): Promise<boolean> {
    let query = supabase
      .from(TABLE)
      .select('id')
      .eq('evento_id', eventoId)
      .eq('dni', dni)
    if (excludeId) query = query.neq('id', excludeId)
    const { data, error } = await query.maybeSingle()
    if (error) throw error
    return data !== null
  }

  async create(input: CreateInvitadoData): Promise<Invitado> {
    const row = toRow(input)
    row.status = 'pendiente'
    const { data, error } = await supabase
      .from(TABLE)
      .insert(row)
      .select()
      .single()
    if (error) throw error
    return toInvitado(data)
  }

  async update(id: string, input: UpdateInvitadoData): Promise<Invitado> {
    const { data, error } = await supabase
      .from(TABLE)
      .update(toRow(input))
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return toInvitado(data)
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id)
    if (error) throw error
  }

  async importBatch(rows: CreateInvitadoData[]): Promise<ImportResult> {
    const inserts = rows.map((r) => ({ ...toRow(r), status: 'pendiente' }))
    const { data, error } = await supabase.from(TABLE).insert(inserts).select('id')
    if (error) throw error
    return { created: (data ?? []).length, errors: [] }
  }

  async generateQrToken(id: string): Promise<Invitado> {
    const array = new Uint8Array(24)
    crypto.getRandomValues(array)
    const token = Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('')

    const { data, error } = await supabase
      .from(TABLE)
      .update({ qr_token: token, status: 'confirmado' })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return toInvitado(data)
  }

  async findByQrToken(eventoId: string, token: string): Promise<Invitado | null> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('evento_id', eventoId)
      .eq('qr_token', token)
      .maybeSingle()
    if (error) throw error
    return data ? toInvitado(data) : null
  }

  async checkIn(id: string, acompanantesPresentes?: number): Promise<Invitado> {
    const now = new Date().toISOString()
    const patch: Record<string, unknown> = {
      status: 'checkin',
      checkin_at: now,
      qr_used_at: now,
    }
    if (acompanantesPresentes !== undefined) {
      patch.acompanantes_presentes = acompanantesPresentes
    }
    const { data, error } = await supabase
      .from(TABLE)
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return toInvitado(data)
  }
}
