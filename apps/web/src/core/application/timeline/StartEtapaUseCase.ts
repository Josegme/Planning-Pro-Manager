import type { TimelineEtapa } from '../../domain/timeline/TimelineEtapa'
import type { ITimelineRepository } from '../../ports/ITimelineRepository'

export class StartEtapaUseCase {
  constructor(private readonly repo: ITimelineRepository) {}

  async execute(id: string): Promise<TimelineEtapa> {
    const etapa = await this.repo.findById(id)
    if (!etapa) throw new Error('Etapa no encontrada')
    if (etapa.status === 'completada') throw new Error('La etapa ya fue completada')
    if (etapa.status === 'en_curso') throw new Error('La etapa ya está en curso')

    return this.repo.update(id, {
      status: 'en_curso',
      horaInicioReal: new Date().toISOString(),
    })
  }
}
