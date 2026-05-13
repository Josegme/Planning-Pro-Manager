export type InvitadoStatus =
  | 'pendiente'
  | 'invitado'
  | 'visto'
  | 'confirmado'
  | 'checkin'
  | 'rechazo'

export interface Invitado {
  id: string
  eventoId: string
  orgId: string
  mesaId: string | null
  nombre: string
  apellido: string
  dni: string | null
  email: string | null
  whatsapp: string | null
  grupo: string | null
  acompanantesEsperados: number
  acompanantesPresentes: number | null
  dietaryRestrictions: string[]
  status: InvitadoStatus
  rsvpToken: string | null
  qrToken: string | null
  qrUsedAt: string | null
  checkinAt: string | null
  createdAt: string
  updatedAt: string
}

export const DIETARY_OPTIONS = [
  { id: 'vegetariano',     label: 'Vegetariano' },
  { id: 'vegano',          label: 'Vegano' },
  { id: 'sin_tacc',        label: 'Sin TACC (celíaco)' },
  { id: 'sin_lactosa',     label: 'Sin lactosa' },
  { id: 'kosher',          label: 'Kosher' },
  { id: 'halal',           label: 'Halal' },
  { id: 'sin_mariscos',    label: 'Sin mariscos' },
  { id: 'sin_frutos_secos', label: 'Sin frutos secos' },
  { id: 'otro',            label: 'Otro' },
] as const

export const INVITADO_STATUS_LABEL: Record<InvitadoStatus, string> = {
  pendiente:  'Pendiente',
  invitado:   'Invitado',
  visto:      'Visto',
  confirmado: 'Confirmado',
  checkin:    'Check-in',
  rechazo:    'Rechazó',
}

export function nombreCompleto(inv: Pick<Invitado, 'nombre' | 'apellido'>): string {
  return `${inv.nombre} ${inv.apellido}`
}

export function canDelete(inv: Invitado): boolean {
  return inv.status !== 'checkin'
}

export function canGenerateManualQr(inv: Invitado): boolean {
  return inv.qrToken === null
}
