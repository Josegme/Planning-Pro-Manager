import type { TimelineEtapa } from '../../domain/timeline/TimelineEtapa'
import type { ITimelineRepository, UpdateEtapaData } from '../../ports/ITimelineRepository'

export class UpdateEtapaUseCase {
  constructor(private readonly repo: ITimelineRepository) {}

  async execute(id: string, data: UpdateEtapaData): Promise<TimelineEtapa> {
    const etapa = await this.repo.findById(id)
    if (!etapa) throw new Error('Etapa no encontrada')
    return this.repo.update(id, data)
  }
}
