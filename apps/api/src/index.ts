import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { rsvpRoutes } from './routes/rsvp'

const app = new Hono()

const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[]

app.use('*', logger())

app.use('*', cors({
  origin: allowedOrigins,
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))

app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'planning-pro-api', version: '0.0.0' })
})

app.route('/rsvp', rsvpRoutes)

const port = parseInt(process.env.PORT ?? '3001', 10)

serve({ fetch: app.fetch, port }, () => {
  console.log(`API corriendo en http://localhost:${port}`)
})
