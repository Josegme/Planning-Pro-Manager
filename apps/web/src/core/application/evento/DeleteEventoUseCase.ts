import type { IEventoRepository } from '../../ports/IEventoRepository'

export class DeleteEventoUseCase {
  constructor(private readonly repo: IEventoRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.repo.findById(id)
    if (!existing) throw new Error(`Evento ${id} no encontrado`)
    if (existing.status === 'active') {
      throw new Error('No se puede eliminar un evento en curso')
    }
    return this.repo.delete(id)
  }
}
