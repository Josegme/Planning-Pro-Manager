import { supabase } from './client'
import { toMenuCourse } from './mappers/menuCourseMapper'
import type { MenuCourse } from '../../core/domain/menuCourse/MenuCourse'
import type {
  IMenuCourseRepository,
  CreateMenuCourseData,
  UpdateMenuCourseData,
} from '../../core/ports/IMenuCourseRepository'

const TABLE = 'menu_courses'

export class SupabaseMenuCourseRepository implements IMenuCourseRepository {
  async findByEvento(eventoId: string): Promise<MenuCourse[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('evento_id', eventoId)
      .order('display_order', { ascending: true })
    if (error) throw error
    return (data ?? []).map(toMenuCourse)
  }

  async create(input: CreateMenuCourseData): Promise<MenuCourse> {
    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        evento_id: input.eventoId,
        nombre: input.nombre,
        tipo: input.tipo,
        hora_salida: input.horaSalida ?? null,
        display_order: input.displayOrder ?? 0,
        notas_cocina: input.notasCocina ?? null,
      })
      .select()
      .single()
    if (error) throw error
    return toMenuCourse(data)
  }

  async update(id: string, input: UpdateMenuCourseData): Promise<MenuCourse> {
    const row: Record<string, unknown> = {}
    if (input.nombre !== undefined) row.nombre = input.nombre
    if (input.tipo !== undefined) row.tipo = input.tipo
    if ('horaSalida' in input) row.hora_salida = input.horaSalida
    if (input.displayOrder !== undefined) row.display_order = input.displayOrder
    if ('notasCocina' in input) row.notas_cocina = input.notasCocina
    if (input.status !== undefined) row.status = input.status

    const { data, error } = await supabase
      .from(TABLE)
      .update(row)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return toMenuCourse(data)
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id)
    if (error) throw error
  }
}
