import type { TimelineEtapa } from '../../domain/timeline/TimelineEtapa'
import type { ITimelineRepository } from '../../ports/ITimelineRepository'

export class CompleteEtapaUseCase {
  constructor(private readonly repo: ITimelineRepository) {}

  async execute(id: string): Promise<TimelineEtapa> {
    const etapa = await this.repo.findById(id)
    if (!etapa) throw new Error('Etapa no encontrada')
    if (etapa.status !== 'en_curso') throw new Error('Solo se puede completar una etapa en curso')

    return this.repo.update(id, {
      status: 'completada',
      horaFinReal: new Date().toISOString(),
    })
  }
}
