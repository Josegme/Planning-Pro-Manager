import type { Invitado } from '../../domain/invitado/Invitado'
import type { IInvitadoRepository } from '../../ports/IInvitadoRepository'

export type CheckInByTokenError =
  | 'TOKEN_NOT_FOUND'
  | 'ALREADY_CHECKED_IN'
  | 'NOT_CONFIRMED'

export interface CheckInByTokenResult {
  success: true
  invitado: Invitado
}

export interface CheckInByTokenFailure {
  success: false
  error: CheckInByTokenError
  invitado?: Invitado
}

export class CheckInByTokenUseCase {
  constructor(private readonly repo: IInvitadoRepository) {}

  async execute(
    eventoId: string,
    token: string,
    acompanantesPresentes?: number,
  ): Promise<CheckInByTokenResult | CheckInByTokenFailure> {
    const invitado = await this.repo.findByQrToken(eventoId, token)

    if (!invitado) {
      return { success: false, error: 'TOKEN_NOT_FOUND' }
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
