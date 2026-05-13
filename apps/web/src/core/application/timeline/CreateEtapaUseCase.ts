import type { TimelineEtapa } from '../../domain/timeline/TimelineEtapa'
import type { ITimelineRepository, CreateEtapaData } from '../../ports/ITimelineRepository'

export class CreateEtapaUseCase {
  constructor(private readonly repo: ITimelineRepository) {}

  async execute(data: CreateEtapaData): Promise<TimelineEtapa> {
    if (!data.nombre.trim()) throw new Error('El nombre de la etapa es obligatorio')
    if (!data.horaPlanificada) throw new Error('La hora planificada es obligatoria')

    const existing = await this.repo.findByEvento(data.eventoId)
    const nextOrder = existing.length > 0
      ? Math.max(...existing.map((e) => e.displayOrder)) + 1
      : 0

    return this.repo.create({ ...data, displayOrder: data.displayOrder ?? nextOrder })
  }
}
