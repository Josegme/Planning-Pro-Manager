import type { Invitado } from '../../domain/invitado/Invitado'
import type { IInvitadoRepository } from '../../ports/IInvitadoRepository'

export class GetInvitadosByEventoUseCase {
  constructor(private readonly repo: IInvitadoRepository) {}

  async execute(eventoId: string): Promise<Invitado[]> {
    return this.repo.findByEvento(eventoId)
  }
}
