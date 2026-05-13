import type { Invitado } from '../../domain/invitado/Invitado'
import type { IInvitadoRepository } from '../../ports/IInvitadoRepository'

export class RegenerateQrUseCase {
  constructor(private readonly repo: IInvitadoRepository) {}

  async execute(id: string): Promise<Invitado> {
    const existing = await this.repo.findById(id)
    if (!existing) throw new Error(`Invitado ${id} no encontrado`)
    // Regeneration is allowed regardless of whether they already have a QR
    // The old token is overwritten — it becomes invalid immediately
    return this.repo.generateQrToken(id)
  }
}
