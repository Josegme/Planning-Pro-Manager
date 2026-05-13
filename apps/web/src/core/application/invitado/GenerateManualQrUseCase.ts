import type { Invitado } from '../../domain/invitado/Invitado'
import type { IInvitadoRepository } from '../../ports/IInvitadoRepository'

export class GenerateManualQrUseCase {
  constructor(private readonly repo: IInvitadoRepository) {}

  async execute(id: string): Promise<Invitado> {
    const existing = await this.repo.findById(id)
    if (!existing) throw new Error(`Invitado ${id} no encontrado`)
    if (existing.qrToken) throw new Error('Este invitado ya tiene un QR generado')
    return this.repo.generateQrToken(id)
  }
}
