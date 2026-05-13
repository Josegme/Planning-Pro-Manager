import type { ITimelineRepository } from '../../ports/ITimelineRepository'

export class ReorderEtapasUseCase {
  constructor(private readonly repo: ITimelineRepository) {}

  async execute(orderedIds: string[]): Promise<void> {
    if (orderedIds.length === 0) return
    await this.repo.reorder(orderedIds)
  }
}
