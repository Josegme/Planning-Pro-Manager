import { supabase } from './client'
import { toEvento } from './mappers/eventoMapper'
import type { Evento } from '../../core/domain/evento/Evento'
import type { IEventoRepository, CreateEventoData, UpdateEventoData } from '../../core/ports/IEventoRepository'

const TABLE = 'eventos'

export class SupabaseEventoRepository implements IEventoRepository {
  async findAll(): Promise<Evento[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('date', { ascending: true })
    if (error) throw error
    return (data ?? []).map(toEvento)
  }

  async findById(id: string): Promise<Evento | null> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return data ? toEvento(data) : null
  }

  async create(input: CreateEventoData): Promise<Evento> {
    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        name:       input.name,
        type:       input.type,
        date:       input.date,
        time:       input.time ?? null,
        venue_id:   input.venueId ?? null,
        venue_name: input.venueName ?? null,
        location:   input.location ?? null,
        capacity:   input.capacity,
        has_tables: input.hasTables ?? false,
        status:     'draft',
      })
      .select()
      .single()
    if (error) throw error
    return toEvento(data)
  }

  async update(id: string, input: UpdateEventoData): Promise<Evento> {
    const patch: Record<string, unknown> = {}
    if (input.name !== undefined)               patch.name                 = input.name
    if (input.type !== undefined)               patch.type                 = input.type
    if (input.status !== undefined)             patch.status               = input.status
    if (input.date !== undefined)               patch.date                 = input.date
    if (input.time !== undefined)               patch.time                 = input.time
    if (input.venueId !== undefined)            patch.venue_id             = input.venueId
    if (input.venueName !== undefined)          patch.venue_name           = input.venueName
    if (input.location !== undefined)           patch.location             = input.location
    if (input.capacity !== undefined)           patch.capacity             = input.capacity
    if (input.hasTables !== undefined)          patch.has_tables           = input.hasTables
    if (input.rsvpSlug !== undefined)           patch.rsvp_slug            = input.rsvpSlug
    if (input.rsvpFields !== undefined)         patch.rsvp_fields          = input.rsvpFields
    if (input.rsvpWelcomeMessage !== undefined) patch.rsvp_welcome_message = input.rsvpWelcomeMessage
    if (input.rsvpBannerUrl !== undefined)      patch.rsvp_banner_url      = input.rsvpBannerUrl

    const { data, error } = await supabase
      .from(TABLE)
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return toEvento(data)
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id)
    if (error) throw error
  }

  async generateRsvpSlug(name: string, date: string): Promise<string> {
    const base = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40)
    const year   = date.slice(0, 4)
    const suffix = Math.random().toString(36).slice(2, 6)
    return `${base}-${year}-${suffix}`
  }
}
