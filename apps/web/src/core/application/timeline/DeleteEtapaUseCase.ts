import type { ITimelineRepository } from '../../ports/ITimelineRepository'

export class DeleteEtapaUseCase {
  constructor(private readonly repo: ITimelineRepository) {}

  async execute(id: string): Promise<void> {
    const etapa = await this.repo.findById(id)
    if (!etapa) throw new Error('Etapa no encontrada')
    if (etapa.status === 'en_curso') throw new Error('No se puede eliminar una etapa en curso')
    await this.repo.delete(id)
  }
}
