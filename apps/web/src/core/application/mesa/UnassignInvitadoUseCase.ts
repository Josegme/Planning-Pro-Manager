import type { IMesaRepository } from '../../ports/IMesaRepository'

export class UnassignInvitadoUseCase {
  constructor(private readonly repo: IMesaRepository) {}

  async execute(invitadoId: string): Promise<void> {
    await this.repo.assignInvitado(invitadoId, null)
  }
}
