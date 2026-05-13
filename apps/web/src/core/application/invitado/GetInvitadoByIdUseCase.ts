import type { Invitado } from '../../domain/invitado/Invitado'
import type { IInvitadoRepository } from '../../ports/IInvitadoRepository'

export class GetInvitadoByIdUseCase {
  constructor(private readonly repo: IInvitadoRepository) {}

  async execute(id: string): Promise<Invitado> {
    const inv = await this.repo.findById(id)
    if (!inv) throw new Error(`Invitado ${id} no encontrado`)
    return inv
  }
}
