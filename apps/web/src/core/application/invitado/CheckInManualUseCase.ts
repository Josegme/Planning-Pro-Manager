import type { Invitado } from '../../domain/invitado/Invitado'
import type { IInvitadoRepository } from '../../ports/IInvitadoRepository'

export type CheckInManualError = 'NOT_FOUND' | 'ALREADY_CHECKED_IN' | 'NOT_CONFIRMED'

export interface CheckInManualResult {
  success: true
  invitado: Invitado
}

export interface CheckInManualFailure {
  success: false
  error: CheckInManualError
  invitado?: Invitado
}

export class CheckInManualUseCase {
  constructor(private readonly repo: IInvitadoRepository) {}

  async execute(
    invitadoId: string,
    acompanantesPresentes?: number,
  ): Promise<CheckInManualResult | CheckInManualFailure> {
    const invitado = await this.repo.findById(invitadoId)

    if (!invitado) {
      return { success: false, error: 'NOT_FOUND' }
    }

    if (invitado.status === 'checkin') {
      return { success: false, error: 'ALREADY_CHECKED_IN', invitado }
    }

    if (invitado.status !== 'confirmado') {
      return { success: false, error: 'NOT_CONFIRMED', invitado }
    }

    const updated = await this.repo.checkIn(invitado.id, acompanantesPresentes)
    return { success: true, invitado: updated }
  }
}
