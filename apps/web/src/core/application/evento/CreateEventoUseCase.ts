import type { Evento } from '../../domain/evento/Evento'
import type { IEventoRepository, CreateEventoData } from '../../ports/IEventoRepository'

export class CreateEventoUseCase {
  constructor(private readonly repo: IEventoRepository) {}

  async execute(data: CreateEventoData): Promise<Evento> {
    if (!data.name.trim()) throw new Error('El nombre del evento es obligatorio')
    if (!data.date) throw new Error('La fecha del evento es obligatoria')
    if (data.capacity < 1) throw new Error('La capacidad debe ser mayor a 0')
    return this.repo.create(data)
  }
}
