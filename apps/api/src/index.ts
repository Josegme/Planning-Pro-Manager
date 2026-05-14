import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { rsvpRoutes } from './routes/rsvp'
import { paymentRoutes } from './routes/payments'

// C-1: Advertir si dev usa credenciales de producción sin NODE_ENV=production
if (process.env.NODE_ENV !== 'production' && process.env.SUPABASE_URL?.includes('supabase.co')) {
  console.warn(
    '[SECURITY WARNING] Estás usando credenciales de Supabase en modo dev.\n' +
    'Asegurate de usar un proyecto separado para desarrollo/staging.\n' +
    'Referencia: PLANNING_PRO_MASTER_DOC.md → Fase 6 → Separación de entornos',
  )
}

const app = new Hono()

const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[]

app.use('*', logger())

// M-5: CORS solo permite GET y POST (los únicos métodos usados en la API actual)
app.use('*', cors({
  origin: allowedOrigins,
  allowMethods: ['GET', 'POST'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))

app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'planning-pro-api', version: '0.0.0' })
})

app.route('/rsvp', rsvpRoutes)
app.route('/payments', paymentRoutes)

const port = parseInt(process.env.PORT ?? '3001', 10)

serve({ fetch: app.fetch, port }, () => {
  console.log(`API corriendo en http://localhost:${port}`)
})
