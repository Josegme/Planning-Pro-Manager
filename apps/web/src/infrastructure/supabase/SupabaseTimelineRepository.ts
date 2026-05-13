import { supabase } from './client'
import { toTimelineEtapa } from './mappers/timelineMapper'
import type { TimelineEtapa } from '../../core/domain/timeline/TimelineEtapa'
import type {
  ITimelineRepository,
  CreateEtapaData,
  UpdateEtapaData,
} from '../../core/ports/ITimelineRepository'

const TABLE = 'timeline_etapas'

export class SupabaseTimelineRepository implements ITimelineRepository {
  async findByEvento(eventoId: string): Promise<TimelineEtapa[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('evento_id', eventoId)
      .order('display_order', { ascending: true })
    if (error) throw error
    return (data ?? []).map(toTimelineEtapa)
  }

  async findById(id: string): Promise<TimelineEtapa | null> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return data ? toTimelineEtapa(data) : null
  }

  async create(input: CreateEtapaData): Promise<TimelineEtapa> {
    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        evento_id:         input.eventoId,
        nombre:            input.nombre,
        hora_planificada:  input.horaPlanificada,
        duracion_estimada: input.duracionEstimada ?? null,
        display_order:     input.displayOrder ?? 0,
      })
      .select()
      .single()
    if (error) throw error
    return toTimelineEtapa(data)
  }

  async update(id: string, input: UpdateEtapaData): Promise<TimelineEtapa> {
    const row: Record<string, unknown> = {}
    if (input.nombre !== undefined)          row.nombre = input.nombre
    if (input.horaPlanificada !== undefined)  row.hora_planificada = input.horaPlanificada
    if ('duracionEstimada' in input)         row.duracion_estimada = input.duracionEstimada
    if ('horaInicioReal' in input)           row.hora_inicio_real = input.horaInicioReal
    if ('horaFinReal' in input)              row.hora_fin_real = input.horaFinReal
    if (input.status !== undefined)          row.status = input.status
    if (input.displayOrder !== undefined)    row.display_order = input.displayOrder
    if ('menuCourseId' in input)             row.menu_course_id = input.menuCourseId

    const { data, error } = await supabase
      .from(TABLE)
      .update(row)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return toTimelineEtapa(data)
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id)
    if (error) throw error
  }

  async reorder(orderedIds: string[]): Promise<void> {
    await Promise.all(
      orderedIds.map((id, idx) =>
        supabase
          .from(TABLE)
          .update({ display_order: idx })
          .eq('id', id)
          .then(({ error }) => { if (error) throw error }),
      ),
    )
  }
}
