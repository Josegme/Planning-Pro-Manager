import type { Evento, EventoStatus, EventoType, RsvpFieldConfig } from '../../../core/domain/evento/Evento'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toEvento(raw: any): Evento {
  return {
    id:                 raw.id,
    orgId:              raw.org_id,
    venueId:            raw.venue_id ?? null,
    name:               raw.name,
    type:               raw.type as EventoType,
    status:             raw.status as EventoStatus,
    date:               raw.date,
    time:               raw.time ?? null,
    venueName:          raw.venue_name ?? null,
    location:           raw.location ?? null,
    capacity:           raw.capacity,
    hasTables:          raw.has_tables ?? false,
    rsvpSlug:           raw.rsvp_slug ?? null,
    rsvpFields:         raw.rsvp_fields as RsvpFieldConfig[] | null ?? null,
    rsvpWelcomeMessage: raw.rsvp_welcome_message ?? null,
    rsvpBannerUrl:      raw.rsvp_banner_url ?? null,
    createdAt:          raw.created_at,
    updatedAt:          raw.updated_at,
  }
}
