import type { TimelineEtapa } from '../../../core/domain/timeline/TimelineEtapa'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toTimelineEtapa(raw: any): TimelineEtapa {
  // postgres TIME comes as "HH:MM:SS" — normalize to "HH:MM"
  const hora = (raw.hora_planificada as string ?? '00:00').slice(0, 5)
  return {
    id: raw.id,
    eventoId: raw.evento_id,
    nombre: raw.nombre,
    horaPlanificada: hora,
    duracionEstimada: raw.duracion_estimada ?? null,
    horaInicioReal: raw.hora_inicio_real ?? null,
    horaFinReal: raw.hora_fin_real ?? null,
    status: raw.status,
    displayOrder: raw.display_order ?? 0,
    menuCourseId: raw.menu_course_id ?? null,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  }
}
