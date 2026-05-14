import { createHash } from 'node:crypto'
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { supabaseAdmin } from '../infrastructure/supabaseAdmin'
import { sendQrEmail } from '../services/emailService'
import { rsvpGetLimiter, rsvpSubmitLimiter, rsvpResendLimiter } from '../middleware/rateLimiter'

export const rsvpRoutes = new Hono()

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateToken(): string {
  const array = new Uint8Array(24)
  crypto.getRandomValues(array)
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('')
}

// C-2: tokens se almacenan como SHA-256; nunca el valor crudo
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

async function getEventoBySlug(slug: string) {
  const { data, error } = await supabaseAdmin
    .from('eventos')
    .select('id, name, date, time, venue_name, location, capacity, status, rsvp_fields, rsvp_welcome_message, rsvp_banner_url')
    .eq('rsvp_slug', slug)
    .maybeSingle()
  if (error) throw error
  return data
}

async function countConfirmados(eventoId: string): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from('invitados')
    .select('id', { count: 'exact', head: true })
    .eq('evento_id', eventoId)
    .in('status', ['confirmado', 'checkin'])
  if (error) throw error
  return count ?? 0
}

// ── GET /rsvp/:slug ───────────────────────────────────────────────────────────

rsvpRoutes.get('/:slug', rsvpGetLimiter, async (c) => {
  try {
    const slug = c.req.param('slug')
    const evento = await getEventoBySlug(slug)

    if (!evento) return c.json({ error: 'Evento no encontrado' }, 404)
    if (!['published', 'active'].includes(evento.status)) {
      return c.json({ error: 'El formulario RSVP no está disponible', code: 'CLOSED' }, 410)
    }

    const confirmados = await countConfirmados(evento.id)
    const isFull = confirmados >= evento.capacity

    // M-2: no exponer capacity ni confirmados exactos al público
    return c.json({
      slug,
      name:           evento.name,
      date:           evento.date,
      time:           evento.time,
      venueName:      evento.venue_name,
      location:       evento.location,
      welcomeMessage: evento.rsvp_welcome_message,
      bannerUrl:      evento.rsvp_banner_url,
      fields:         evento.rsvp_fields ?? [],
      isFull,
    })
  } catch (e) {
    console.error('[GET /rsvp/:slug]', e)
    return c.json({ error: 'Error interno del servidor' }, 500)
  }
})

// ── POST /rsvp/:slug ─────────────────────────────────────────────────────────

const submissionSchema = z.object({
  nombre:               z.string().min(1).max(100),
  apellido:             z.string().min(1).max(100),
  dni:                  z.string().max(20).optional(),
  email:                z.string().email().optional(),
  whatsapp:             z.string().max(30).optional(),
  acompanantesEsperados: z.number().int().min(0).max(20).default(0),
  dietaryRestrictions:  z.array(z.string().max(50)).default([]),
})

rsvpRoutes.post('/:slug', rsvpSubmitLimiter, zValidator('json', submissionSchema), async (c) => {
  try {
    const slug = c.req.param('slug')
    const body = c.req.valid('json')
    const evento = await getEventoBySlug(slug)

    if (!evento) return c.json({ error: 'Evento no encontrado' }, 404)
    if (!['published', 'active'].includes(evento.status)) {
      return c.json({ error: 'El formulario RSVP no está disponible', code: 'CLOSED' }, 410)
    }

    const confirmados = await countConfirmados(evento.id)
    if (confirmados >= evento.capacity) {
      return c.json({ error: 'El evento ya alcanzó su capacidad máxima', code: 'FULL' }, 409)
    }

    // DNI deduplication
    if (body.dni) {
      const { data: existing } = await supabaseAdmin
        .from('invitados')
        .select('id')
        .eq('evento_id', evento.id)
        .eq('dni', body.dni)
        .maybeSingle()
      if (existing) {
        return c.json({ error: 'Ya existe una confirmación con ese DNI para este evento', code: 'DUPLICATE_DNI' }, 409)
      }
    }

    const { data: eventoFull } = await supabaseAdmin
      .from('eventos')
      .select('org_id')
      .eq('id', evento.id)
      .single()

    // C-2: generar token crudo (solo vive en el QR), almacenar su hash
    const qrToken = generateToken()
    const qrTokenHash = hashToken(qrToken)

    const { data: invitado, error: insertError } = await supabaseAdmin
      .from('invitados')
      .insert({
        evento_id:              evento.id,
        org_id:                 eventoFull!.org_id,
        nombre:                 body.nombre,
        apellido:               body.apellido,
        dni:                    body.dni ?? null,
        email:                  body.email ?? null,
        whatsapp:               body.whatsapp ?? null,
        acompanantes_esperados: body.acompanantesEsperados,
        dietary_restrictions:   body.dietaryRestrictions,
        status:                 'confirmado',
        qr_token_hash:          qrTokenHash,
      })
      .select('id')
      .single()

    if (insertError || !invitado) {
      console.error('[rsvp insert]', insertError)
      return c.json({ error: 'Error al registrar la asistencia' }, 500)
    }

    const finalQrValue = `EVT-${evento.id}:INV-${invitado.id}:TOKEN-${qrToken}`

    if (body.email) {
      sendQrEmail({
        to:                  body.email,
        invitadoNombre:      body.nombre,
        eventoName:          evento.name,
        eventoDate:          evento.date,
        eventoTime:          evento.time,
        eventoVenueName:     evento.venue_name,
        eventoLocation:      evento.location,
        eventoWelcomeMessage: evento.rsvp_welcome_message,
        qrValue:             finalQrValue,
      }).catch((err) => console.error('[sendQrEmail]', err))
    }

    // C-3: no devolver qrToken crudo al cliente — solo el valor compuesto para renderizar
    return c.json({
      invitadoId: invitado.id,
      nombre:     body.nombre,
      apellido:   body.apellido,
      qrValue:    finalQrValue,
    }, 201)
  } catch (e) {
    console.error('[POST /rsvp/:slug]', e)
    return c.json({ error: 'Error interno del servidor' }, 500)
  }
})

// ── POST /rsvp/:slug/resend ──────────────────────────────────────────────────

const resendSchema = z.object({
  dni:   z.string().min(1),
  email: z.string().email(),
})

rsvpRoutes.post('/:slug/resend', rsvpResendLimiter, zValidator('json', resendSchema), async (c) => {
  try {
    const slug = c.req.param('slug')
    const { dni, email } = c.req.valid('json')
    const evento = await getEventoBySlug(slug)

    if (!evento) return c.json({ error: 'Evento no encontrado' }, 404)

    const { data: invitado } = await supabaseAdmin
      .from('invitados')
      .select('id, nombre, apellido, status')
      .eq('evento_id', evento.id)
      .eq('dni', dni)
      .eq('email', email)
      .maybeSingle()

    if (!invitado) {
      return c.json({ error: 'No se encontró una confirmación con esos datos' }, 404)
    }

    // C-2: no podemos reconstruir el token desde el hash — generamos uno nuevo
    const newToken = generateToken()
    const newTokenHash = hashToken(newToken)

    await supabaseAdmin
      .from('invitados')
      .update({ qr_token_hash: newTokenHash })
      .eq('id', invitado.id)

    const qrValue = `EVT-${evento.id}:INV-${invitado.id}:TOKEN-${newToken}`

    await sendQrEmail({
      to:                  email,
      invitadoNombre:      invitado.nombre,
      eventoName:          evento.name,
      eventoDate:          evento.date,
      eventoTime:          evento.time,
      eventoVenueName:     evento.venue_name,
      eventoLocation:      evento.location,
      eventoWelcomeMessage: evento.rsvp_welcome_message,
      qrValue,
    })

    return c.json({ message: 'QR regenerado y reenviado correctamente' })
  } catch (e) {
    console.error('[POST /rsvp/:slug/resend]', e)
    return c.json({ error: 'Error al reenviar el QR' }, 500)
  }
})
