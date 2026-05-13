export type EventoStatus = 'draft' | 'published' | 'active' | 'completed' | 'cancelled'
export type EventoType = 'boda' | 'cumpleanos' | 'corporativo' | 'social' | 'otro'

// ── RSVP Config ───────────────────────────────────────────────────────────────

export type RsvpFieldKey = 'dni' | 'email' | 'whatsapp' | 'acompanantes' | 'dietary'

export interface RsvpFieldConfig {
  key: RsvpFieldKey
  shown: boolean
  required: boolean
}

export interface RsvpConfig {
  fields: RsvpFieldConfig[]
}

export const DEFAULT_RSVP_FIELDS: RsvpFieldConfig[] = [
  { key: 'dni',          shown: true,  required: false },
  { key: 'email',        shown: true,  required: true  },
  { key: 'whatsapp',     shown: true,  required: false },
  { key: 'acompanantes', shown: true,  required: false },
  { key: 'dietary',      shown: true,  required: false },
]

export const RSVP_FIELD_LABEL: Record<RsvpFieldKey, string> = {
  dni:          'DNI',
  email:        'Email',
  whatsapp:     'WhatsApp',
  acompanantes: 'Cantidad de acompañantes',
  dietary:      'Restricciones dietarias',
}

// ── Evento entity ─────────────────────────────────────────────────────────────

export interface Evento {
  id: string
  orgId: string
  venueId: string | null
  name: string
  type: EventoType
  status: EventoStatus
  date: string
  time: string | null
  venueName: string | null
  location: string | null
  capacity: number
  hasTables: boolean
  rsvpSlug: string | null
  rsvpFields: RsvpFieldConfig[] | null
  rsvpWelcomeMessage: string | null
  rsvpBannerUrl: string | null
  createdAt: string
  updatedAt: string
}

export function isPublishable(evento: Evento): boolean {
  return evento.status === 'draft' && !!evento.date && !!evento.name
}

export function isEditable(evento: Evento): boolean {
  return evento.status !== 'completed' && evento.status !== 'cancelled'
}

export const EVENTO_STATUS_LABEL: Record<EventoStatus, string> = {
  draft:     'Borrador',
  published: 'Publicado',
  active:    'En curso',
  completed: 'Completado',
  cancelled: 'Cancelado',
}

export const EVENTO_TYPE_LABEL: Record<EventoType, string> = {
  boda:        'Boda',
  cumpleanos:  'Cumpleaños',
  corporativo: 'Corporativo',
  social:      'Social',
  otro:        'Otro',
}
