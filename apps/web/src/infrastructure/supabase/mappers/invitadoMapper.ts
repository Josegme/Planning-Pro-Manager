import type { Invitado, InvitadoStatus } from '../../../core/domain/invitado/Invitado'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toInvitado(raw: any): Invitado {
  return {
    id: raw.id,
    eventoId: raw.evento_id,
    orgId: raw.org_id,
    mesaId: raw.mesa_id ?? null,
    nombre: raw.nombre,
    apellido: raw.apellido,
    dni: raw.dni ?? null,
    email: raw.email ?? null,
    whatsapp: raw.whatsapp ?? null,
    grupo: raw.grupo ?? null,
    acompanantesEsperados: raw.acompanantes_esperados ?? 0,
    acompanantesPresentes: raw.acompanantes_presentes ?? null,
    dietaryRestrictions: raw.dietary_restrictions ?? [],
    status: raw.status as InvitadoStatus,
    rsvpToken: raw.rsvp_token ?? null,
    qrToken: raw.qr_token ?? null,
    qrUsedAt: raw.qr_used_at ?? null,
    checkinAt: raw.checkin_at ?? null,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  }
}
