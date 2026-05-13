import type { Evento } from '../../domain/evento/Evento'
import type { IEventoRepository } from '../../ports/IEventoRepository'

export class GetEventosUseCase {
  constructor(private readonly repo: IEventoRepository) {}

  async execute(): Promise<Evento[]> {
    return this.repo.findAll()
  }
}
