import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../providers/AuthProvider'

const storageKey = (orgId: string) => `planning_pro_onboarding_seen_${orgId}`

export function useOnboarding(eventCount: number) {
  const { orgId, role } = useAuth()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!orgId || role !== 'organizador') return
    if (eventCount > 0) return
    const seen = localStorage.getItem(storageKey(orgId))
    if (!seen) setShow(true)
  }, [orgId, role, eventCount])

  const dismiss = useCallback(() => {
    if (orgId) localStorage.setItem(storageKey(orgId), '1')
    setShow(false)
  }, [orgId])

  return { show, dismiss }
}
