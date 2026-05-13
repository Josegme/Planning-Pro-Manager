// ── Evento ───────────────────────────────────────────────────────────────────
export type EventoStatus = 'draft' | 'published' | 'active' | 'completed' | 'cancelled'
export type EventoType = 'boda' | 'cumpleanos' | 'corporativo' | 'social' | 'otro'
export type UserRole = 'organizador' | 'recepcion' | 'chef'
export type OrgPlan = 'starter' | 'pro' | 'agency'

// ── RSVP ─────────────────────────────────────────────────────────────────────
export type RsvpFieldKey = 'dni' | 'email' | 'whatsapp' | 'acompanantes' | 'dietary'

export interface RsvpFieldConfig {
  key: RsvpFieldKey
  shown: boolean
  required: boolean
}

export interface RsvpEventoPublicDTO {
  slug: string
  name: string
  date: string
  time: string | null
  venueName: string | null
  location: string | null
  welcomeMessage: string | null
  bannerUrl: string | null
  fields: RsvpFieldConfig[]
  isFull: boolean
}

export interface RsvpSubmissionDTO {
  nombre: string
  apellido: string
  dni?: string
  email?: string
  whatsapp?: string
  acompanantesEsperados?: number
  dietaryRestrictions?: string[]
}

/** @deprecated Use RsvpFieldConfig instead */
export interface RsvpField {
  id: string
  label: string
  type: 'text' | 'email' | 'phone' | 'select' | 'checkbox'
  required: boolean
  options?: string[]
}

export interface CreateEventoDTO {
  name: string
  type: EventoType
  date: string
  time?: string
  venueId?: string
  venueName?: string
  location?: string
  capacity: number
  hasTables?: boolean
}

export interface UpdateEventoDTO {
  name?: string
  type?: EventoType
  status?: EventoStatus
  date?: string
  time?: string | null
  venueId?: string | null
  venueName?: string | null
  location?: string | null
  capacity?: number
  hasTables?: boolean
  rsvpSlug?: string | null
  rsvpFields?: RsvpFieldConfig[] | null
  rsvpWelcomeMessage?: string | null
  rsvpBannerUrl?: string | null
}

export interface EventoDTO {
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

// ── Invitado ─────────────────────────────────────────────────────────────────
export type InvitadoStatus =
  | 'pendiente'
  | 'invitado'
  | 'visto'
  | 'confirmado'
  | 'checkin'
  | 'rechazo'

export interface CreateInvitadoDTO {
  eventoId: string
  nombre: string
  apellido: string
  dni?: string
  email?: string
  whatsapp?: string
  grupo?: string
  acompanantesEsperados?: number
  dietaryRestrictions?: string[]
  mesaId?: string
}

export interface UpdateInvitadoDTO {
  nombre?: string
  apellido?: string
  dni?: string | null
  email?: string | null
  whatsapp?: string | null
  grupo?: string | null
  acompanantesEsperados?: number
  acompanantesPresentes?: number | null
  dietaryRestrictions?: string[]
  mesaId?: string | null
  status?: InvitadoStatus
  qrToken?: string | null
  checkinAt?: string | null
}

export interface InvitadoDTO {
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
