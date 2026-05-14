import type { MenuCourse, MenuCourseTipo, MenuCourseStatus } from '../../../core/domain/menuCourse/MenuCourse'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toMenuCourse(raw: any): MenuCourse {
  return {
    id: raw.id,
    eventoId: raw.evento_id,
    nombre: raw.nombre,
    tipo: (raw.tipo ?? 'otro') as MenuCourseTipo,
    // postgres TIME comes back as "HH:MM:SS" — slice to "HH:MM"
    horaSalida: raw.hora_salida ? String(raw.hora_salida).slice(0, 5) : null,
    displayOrder: raw.display_order ?? 0,
    notasCocina: raw.notas_cocina ?? null,
    status: (raw.status ?? 'pendiente') as MenuCourseStatus,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  }
}
