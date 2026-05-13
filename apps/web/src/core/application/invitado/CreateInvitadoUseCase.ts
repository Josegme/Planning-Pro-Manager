import type { Invitado } from '../../domain/invitado/Invitado'
import type { IInvitadoRepository, CreateInvitadoData } from '../../ports/IInvitadoRepository'

export class CreateInvitadoUseCase {
  constructor(private readonly repo: IInvitadoRepository) {}

  async execute(data: CreateInvitadoData): Promise<Invitado> {
    if (!data.nombre.trim()) throw new Error('El nombre es obligatorio')
    if (!data.apellido.trim()) throw new Error('El apellido es obligatorio')

    if (data.dni?.trim()) {
      const taken = await this.repo.isDniTaken(data.eventoId, data.dni.trim())
      if (taken) throw new Error(`Ya existe un invitado con el DNI ${data.dni} en este evento`)
    }

    return this.repo.create(data)
  }
}
