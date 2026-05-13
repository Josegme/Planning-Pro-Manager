import type { EventLayout } from '../../domain/layout/EventLayout'
import type { IEventLayoutRepository } from '../../ports/IEventLayoutRepository'

export class GetLayoutUseCase {
  constructor(private readonly repo: IEventLayoutRepository) {}

  async execute(eventoId: string): Promise<EventLayout | null> {
    return this.repo.findByEvento(eventoId)
  }
}
