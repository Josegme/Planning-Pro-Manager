import type { TimelineEtapa, EtapaStatus } from '../domain/timeline/TimelineEtapa'

export interface CreateEtapaData {
  eventoId: string
  nombre: string
  horaPlanificada: string
  duracionEstimada?: number
  displayOrder?: number
}

export interface UpdateEtapaData {
  nombre?: string
  horaPlanificada?: string
  duracionEstimada?: number | null
  horaInicioReal?: string | null
  horaFinReal?: string | null
  status?: EtapaStatus
  displayOrder?: number
  menuCourseId?: string | null
}

export interface ITimelineRepository {
  findByEvento(eventoId: string): Promise<TimelineEtapa[]>
  findById(id: string): Promise<TimelineEtapa | null>
  create(data: CreateEtapaData): Promise<TimelineEtapa>
  update(id: string, data: UpdateEtapaData): Promise<TimelineEtapa>
  delete(id: string): Promise<void>
  reorder(orderedIds: string[]): Promise<void>
}
