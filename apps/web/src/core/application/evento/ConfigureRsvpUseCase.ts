import type { Evento, RsvpFieldConfig } from '../../domain/evento/Evento'
import type { IEventoRepository } from '../../ports/IEventoRepository'

export interface ConfigureRsvpInput {
  eventoId: string
  fields: RsvpFieldConfig[]
  welcomeMessage?: string
  bannerUrl?: string
  publishNow?: boolean
}

export class ConfigureRsvpUseCase {
  constructor(private readonly repo: IEventoRepository) {}

  async execute(input: ConfigureRsvpInput): Promise<Evento> {
    const evento = await this.repo.findById(input.eventoId)
    if (!evento) throw new Error(`Evento ${input.eventoId} no encontrado`)

    const update: Parameters<typeof this.repo.update>[1] = {
      rsvpFields:         input.fields,
      rsvpWelcomeMessage: input.welcomeMessage ?? null,
      rsvpBannerUrl:      input.bannerUrl ?? null,
    }

    if (input.publishNow && evento.status === 'draft') {
      if (!evento.date || !evento.name) {
        throw new Error('El evento debe tener nombre y fecha para publicarse')
      }
      const slug = await this.repo.generateRsvpSlug(evento.name, evento.date)
      update.status   = 'published'
      update.rsvpSlug = slug
    }

    return this.repo.update(input.eventoId, update)
  }
}
