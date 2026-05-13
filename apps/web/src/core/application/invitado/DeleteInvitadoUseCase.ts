import type { IInvitadoRepository } from '../../ports/IInvitadoRepository'

export class DeleteInvitadoUseCase {
  constructor(private readonly repo: IInvitadoRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.repo.findById(id)
    if (!existing) throw new Error(`Invitado ${id} no encontrado`)
    if (existing.status === 'checkin') {
      throw new Error('No se puede eliminar un invitado que ya hizo check-in')
    }
    return this.repo.delete(id)
  }
}
