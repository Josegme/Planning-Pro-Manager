import type { Evento } from '../../domain/evento/Evento'
import type { IEventoRepository } from '../../ports/IEventoRepository'
import { isPublishable } from '../../domain/evento/Evento'

export class PublishEventoUseCase {
  constructor(private readonly repo: IEventoRepository) {}

  async execute(id: string): Promise<Evento> {
    const existing = await this.repo.findById(id)
    if (!existing) throw new Error(`Evento ${id} no encontrado`)
    if (!isPublishable(existing)) {
      throw new Error('El evento no cumple los requisitos para publicarse')
    }
    const slug = await this.repo.generateRsvpSlug(existing.name, existing.date)
    return this.repo.update(id, { status: 'published', rsvpSlug: slug })
  }
}
