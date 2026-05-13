import type { Invitado } from '../../domain/invitado/Invitado'
import type { IInvitadoRepository, UpdateInvitadoData } from '../../ports/IInvitadoRepository'

export class UpdateInvitadoUseCase {
  constructor(private readonly repo: IInvitadoRepository) {}

  async execute(id: string, data: UpdateInvitadoData): Promise<Invitado> {
    const existing = await this.repo.findById(id)
    if (!existing) throw new Error(`Invitado ${id} no encontrado`)

    if (data.dni?.trim() && data.dni !== existing.dni) {
      const taken = await this.repo.isDniTaken(existing.eventoId, data.dni.trim(), id)
      if (taken) throw new Error(`Ya existe un invitado con el DNI ${data.dni} en este evento`)
    }

    return this.repo.update(id, data)
  }
}
