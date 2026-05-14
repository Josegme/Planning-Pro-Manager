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
    orgId: string,
    token: string,
    acompanantesPresentes?: number,
    scannedBy?: string,
  ): Promise<CheckInByTokenResult | CheckInByTokenFailure> {
    const invitado = await this.repo.findByQrToken(eventoId, token)

    if (!invitado) {
      // A-5: log failed attempt
      this.repo.logCheckinAttempt(eventoId, orgId, 'token_not_found', undefined, scannedBy)
      return { success: false, error: 'TOKEN_NOT_FOUND' }
    }

    if (invitado.status === 'checkin') {
      this.repo.logCheckinAttempt(eventoId, orgId, 'already_checked_in', invitado.id, scannedBy)
      return { success: false, error: 'ALREADY_CHECKED_IN', invitado }
    }

    if (invitado.status !== 'confirmado') {
      this.repo.logCheckinAttempt(eventoId, orgId, 'not_confirmed', invitado.id, scannedBy)
      return { success: false, error: 'NOT_CONFIRMED', invitado }
    }

    const updated = await this.repo.checkIn(invitado.id, acompanantesPresentes, scannedBy)
    return { success: true, invitado: updated }
  }
}
