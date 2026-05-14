import { Hono } from 'hono'
import { supabaseAdmin } from '../infrastructure/supabaseAdmin'

export const paymentRoutes = new Hono()

const MOCK_CHECKOUT_BASE = process.env.FRONTEND_URL ?? 'http://localhost:5173'

// POST /payments/checkout
// Receives org_id, creates a mock Mercado Pago preference, returns checkout URL
paymentRoutes.post('/checkout', async (c) => {
  const body = await c.req.json().catch(() => null)
  const orgId: string | undefined = body?.org_id

  if (!orgId) {
    return c.json({ error: 'org_id requerido' }, 400)
  }

  const { data: org, error } = await supabaseAdmin
    .from('organizations')
    .select('id, subscription_status')
    .eq('id', orgId)
    .maybeSingle()

  if (error || !org) {
    return c.json({ error: 'Organización no encontrada' }, 404)
  }

  if (org.subscription_status === 'active') {
    return c.json({ error: 'La suscripción ya está activa' }, 400)
  }

  // Mock: generate a preference_id and return checkout URL
  const preferenceId = `mock_pref_${orgId.slice(0, 8)}_${Date.now()}`

  await supabaseAdmin
    .from('organizations')
    .update({ mercado_pago_preference_id: preferenceId })
    .eq('id', orgId)

  const checkoutUrl = `${MOCK_CHECKOUT_BASE}/payment/mock?preference_id=${preferenceId}&org_id=${orgId}`

  return c.json({ checkout_url: checkoutUrl, preference_id: preferenceId })
})

// POST /payments/mock-confirm
// Simulates Mercado Pago webhook: upgrades org to active
paymentRoutes.post('/mock-confirm', async (c) => {
  const body = await c.req.json().catch(() => null)
  const orgId: string | undefined = body?.org_id
  const preferenceId: string | undefined = body?.preference_id

  if (!orgId || !preferenceId) {
    return c.json({ error: 'org_id y preference_id requeridos' }, 400)
  }

  const { data: org, error } = await supabaseAdmin
    .from('organizations')
    .select('id, mercado_pago_preference_id')
    .eq('id', orgId)
    .maybeSingle()

  if (error || !org) {
    return c.json({ error: 'Organización no encontrada' }, 404)
  }

  if (org.mercado_pago_preference_id !== preferenceId) {
    return c.json({ error: 'Preference ID no coincide' }, 400)
  }

  const expiresAt = new Date()
  expiresAt.setFullYear(expiresAt.getFullYear() + 1)

  const { error: updateError } = await supabaseAdmin
    .from('organizations')
    .update({
      subscription_status: 'active',
      subscription_expires_at: expiresAt.toISOString(),
      subscription_updated_at: new Date().toISOString(),
    })
    .eq('id', orgId)

  if (updateError) {
    return c.json({ error: 'Error actualizando suscripción' }, 500)
  }

  return c.json({ success: true, expires_at: expiresAt.toISOString() })
})

// GET /payments/status?org_id=...
paymentRoutes.get('/status', async (c) => {
  const orgId = c.req.query('org_id')

  if (!orgId) {
    return c.json({ error: 'org_id requerido' }, 400)
  }

  const { data: org, error } = await supabaseAdmin
    .from('organizations')
    .select('subscription_status, subscription_expires_at, trial_event_limit')
    .eq('id', orgId)
    .maybeSingle()

  if (error || !org) {
    return c.json({ error: 'Organización no encontrada' }, 404)
  }

  const { count } = await supabaseAdmin
    .from('eventos')
    .select('id', { count: 'exact', head: true })
    .eq('org_id', orgId)

  return c.json({
    status: org.subscription_status,
    expires_at: org.subscription_expires_at,
    trial_event_limit: org.trial_event_limit,
    event_count: count ?? 0,
  })
})
