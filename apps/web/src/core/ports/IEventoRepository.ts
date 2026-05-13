import type { Evento, EventoStatus, EventoType, RsvpFieldConfig } from '../domain/evento/Evento'

export interface CreateEventoData {
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

export interface UpdateEventoData {
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

export interface IEventoRepository {
  findAll(): Promise<Evento[]>
  findById(id: string): Promise<Evento | null>
  create(data: CreateEventoData): Promise<Evento>
  update(id: string, data: UpdateEventoData): Promise<Evento>
  delete(id: string): Promise<void>
  generateRsvpSlug(name: string, date: string): Promise<string>
}
