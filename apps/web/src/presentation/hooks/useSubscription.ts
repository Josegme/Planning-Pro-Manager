import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../providers/AuthProvider'

export interface SubscriptionStatus {
  status: 'free_trial' | 'active' | 'cancelled'
  eventCount: number
  trialEventLimit: number
  expiresAt: string | null
  canCreate: boolean
  isLimitReached: boolean
  isLoading: boolean
  error: string | null
  refresh: () => void
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

export function useSubscription(): SubscriptionStatus {
  const { orgId } = useAuth()
  const [status, setStatus] = useState<'free_trial' | 'active' | 'cancelled'>('free_trial')
  const [eventCount, setEventCount] = useState(0)
  const [trialEventLimit, setTrialEventLimit] = useState(2)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!orgId) return
    try {
      setIsLoading(true)
      const res = await fetch(`${API_URL}/payments/status?org_id=${orgId}`)
      if (!res.ok) throw new Error('Error obteniendo estado de suscripción')
      const data = await res.json()
      setStatus(data.status)
      setEventCount(data.event_count ?? 0)
      setTrialEventLimit(data.trial_event_limit ?? 2)
      setExpiresAt(data.expires_at ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }, [orgId])

  useEffect(() => { load() }, [load])

  const isLimitReached = status === 'free_trial' && eventCount >= trialEventLimit
  const canCreate = status === 'active' || !isLimitReached

  return { status, eventCount, trialEventLimit, expiresAt, canCreate, isLimitReached, isLoading, error, refresh: load }
}
