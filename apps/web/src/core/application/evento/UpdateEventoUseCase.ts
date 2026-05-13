import type { Evento } from '../../domain/evento/Evento'
import type { IEventoRepository, UpdateEventoData } from '../../ports/IEventoRepository'
import { isEditable } from '../../domain/evento/Evento'

export class UpdateEventoUseCase {
  constructor(private readonly repo: IEventoRepository) {}

  async execute(id: string, data: UpdateEventoData): Promise<Evento> {
    const existing = await this.repo.findById(id)
    if (!existing) throw new Error(`Evento ${id} no encontrado`)
    if (!isEditable(existing)) throw new Error('No se puede editar un evento completado o cancelado')
    if (data.capacity !== undefined && data.capacity < 1) {
      throw new Error('La capacidad debe ser mayor a 0')
    }
    return this.repo.update(id, data)
  }
}
