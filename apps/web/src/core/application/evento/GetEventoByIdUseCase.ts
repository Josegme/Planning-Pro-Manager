import type { Evento } from '../../domain/evento/Evento'
import type { IEventoRepository } from '../../ports/IEventoRepository'

export class GetEventoByIdUseCase {
  constructor(private readonly repo: IEventoRepository) {}

  async execute(id: string): Promise<Evento> {
    const evento = await this.repo.findById(id)
    if (!evento) throw new Error(`Evento ${id} no encontrado`)
    return evento
  }
}
