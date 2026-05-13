import type { IMesaRepository } from '../../ports/IMesaRepository'
import type { IInvitadoRepository } from '../../ports/IInvitadoRepository'
import { calcOccupied } from '../../domain/mesa/Mesa'

export class AssignInvitadoUseCase {
  constructor(
    private readonly mesaRepo: IMesaRepository,
    private readonly invitadoRepo: IInvitadoRepository,
  ) {}

  async execute(invitadoId: string, mesaId: string): Promise<void> {
    const mesa = await this.mesaRepo.findById(mesaId)
    if (!mesa) throw new Error('Mesa no encontrada')

    const allInvitados = await this.invitadoRepo.findByEvento(mesa.eventoId)
    const invitado = allInvitados.find((i) => i.id === invitadoId)
    if (!invitado) throw new Error('Invitado no encontrado')

    const asignados = allInvitados.filter(
      (i) => i.mesaId === mesaId && i.id !== invitadoId,
    )
    const occupied = calcOccupied(asignados)
    const need = 1 + invitado.acompanantesEsperados

    if (occupied + need > mesa.capacity) {
      throw new Error(
        `La mesa ${mesa.number} no tiene capacidad suficiente (libre: ${mesa.capacity - occupied}, necesario: ${need})`,
      )
    }

    await this.mesaRepo.assignInvitado(invitadoId, mesaId)
  }
}
