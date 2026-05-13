import type { EventLayout, StructuralElement } from '../../domain/layout/EventLayout'
import type { IEventLayoutRepository } from '../../ports/IEventLayoutRepository'

export class SaveLayoutUseCase {
  constructor(private readonly repo: IEventLayoutRepository) {}

  async execute(eventoId: string, elements: StructuralElement[]): Promise<EventLayout> {
    return this.repo.save(eventoId, elements)
  }
}
