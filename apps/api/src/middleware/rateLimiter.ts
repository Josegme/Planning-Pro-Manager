import type { MiddlewareHandler } from 'hono'

interface Entry { count: number; resetAt: number }
const store = new Map<string, Entry>()

function limiter(max: number, windowMs: number): MiddlewareHandler {
  return async (c, next) => {
    const ip =
      c.req.header('x-forwarded-for')?.split(',')[0].trim() ??
      c.req.header('x-real-ip') ??
      'unknown'
    const key = `${c.req.routePath}:${ip}`
    const now = Date.now()

    const entry = store.get(key)
    if (!entry || now > entry.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs })
      return next()
    }
    if (entry.count >= max) {
      c.header('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)))
      return c.json({ error: 'Demasiadas solicitudes. Intentá de nuevo en unos minutos.' }, 429)
    }
    entry.count++
    return next()
  }
}

// 5 submissions por IP cada 10 minutos (anti-bot / protege cuota Resend)
export const rsvpSubmitLimiter = limiter(5, 10 * 60 * 1000)
// 3 reenvíos por IP por hora (anti-enumeración DNI+email)
export const rsvpResendLimiter = limiter(3, 60 * 60 * 1000)
// 60 GETs por IP por minuto (carga normal del formulario)
export const rsvpGetLimiter = limiter(60, 60 * 1000)
