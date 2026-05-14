import { supabase } from './client'
import { toServicio } from './mappers/servicioMapper'
import type { Servicio } from '../../core/domain/servicio/Servicio'
import type {
  IServicioRepository,
  CreateServicioData,
  UpdateServicioData,
} from '../../core/ports/IServicioRepository'

const TABLE = 'servicios'

function toRow(data: CreateServicioData | UpdateServicioData): Record<string, unknown> {
  const row: Record<string, unknown> = {}
  if ('eventoId' in data && data.eventoId) row.evento_id = data.eventoId
  if ('providerId' in data) row.provider_id = data.providerId
  if ('nombre' in data && data.nombre !== undefined) row.nombre = data.nombre
  if ('descripcion' in data) row.descripcion = data.descripcion
  if ('costoUnitario' in data && data.costoUnitario !== undefined) row.costo_unitario = data.costoUnitario
  if ('cantidad' in data && data.cantidad !== undefined) row.cantidad = data.cantidad
  if ('moneda' in data && data.moneda !== undefined) row.moneda = data.moneda
  if ('montoPagado' in data && data.montoPagado !== undefined) row.monto_pagado = data.montoPagado
  if ('vencimiento' in data) row.vencimiento = data.vencimiento
  if ('estado' in data && data.estado !== undefined) row.estado = data.estado
  if ('checklistStatus' in data && (data as UpdateServicioData).checklistStatus !== undefined)
    row.checklist_status = (data as UpdateServicioData).checklistStatus
  if ('checklistNote' in data) row.checklist_note = (data as UpdateServicioData).checklistNote
  return row
}

export class SupabaseServicioRepository implements IServicioRepository {
  async findByEvento(eventoId: string): Promise<Servicio[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('evento_id', eventoId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return (data ?? []).map(toServicio)
  }

  async findById(id: string): Promise<Servicio | null> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return data ? toServicio(data) : null
  }

  async create(input: CreateServicioData): Promise<Servicio> {
    const { data, error } = await supabase
      .from(TABLE)
      .insert(toRow(input))
      .select()
      .single()
    if (error) throw error
    return toServicio(data)
  }

  async update(id: string, input: UpdateServicioData): Promise<Servicio> {
    const { data, error } = await supabase
      .from(TABLE)
      .update(toRow(input))
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return toServicio(data)
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id)
    if (error) throw error
  }
}
