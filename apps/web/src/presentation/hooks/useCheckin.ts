import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../../infrastructure/supabase/client'
import { SupabaseInvitadoRepository } from '../../infrastructure/supabase/SupabaseInvitadoRepository'
import { useAuth } from '../providers/AuthProvider'
import { CheckInByTokenUseCase } from '../../core/application/invitado/CheckInByTokenUseCase'
import { CheckInManualUseCase } from '../../core/application/invitado/CheckInManualUseCase'
import { GetInvitadosByEventoUseCase } from '../../core/application/invitado/GetInvitadosByEventoUseCase'
import type { Invitado } from '../../core/domain/invitado/Invitado'
import { toInvitado } from '../../infrastructure/supabase/mappers/invitadoMapper'
import type {
  CheckInByTokenResult,
  CheckInByTokenFailure,
} from '../../core/application/invitado/CheckInByTokenUseCase'
import type {
  CheckInManualResult,
  CheckInManualFailure,
} from '../../core/application/invitado/CheckInManualUseCase'

const repo = new SupabaseInvitadoRepository()
const getInvitadosUC = new GetInvitadosByEventoUseCase(repo)
const checkInByTokenUC = new CheckInByTokenUseCase(repo)
const checkInManualUC = new CheckInManualUseCase(repo)

export interface CheckinStats {
  total: number
  confirmados: number
  checkinCount: number
  pct: number
}

export function useCheckin(eventoId: string) {
  const { user, orgId } = useAuth()
  const [invitados, setInvitados] = useState<Invitado[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await getInvitadosUC.execute(eventoId)
      setInvitados(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error cargando invitados')
    } finally {
      setIsLoading(false)
    }
  }, [eventoId])

  useEffect(() => {
    load()

    channelRef.current = supabase
      .channel(`checkin-${eventoId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'invitados', filter: `evento_id=eq.${eventoId}` },
        (payload) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const raw = payload.new as any
          if (!raw?.id) return
          const updated = toInvitado(raw)
          setInvitados((prev) => {
            const idx = prev.findIndex((i) => i.id === updated.id)
            if (idx === -1) return [...prev, updated]
            const next = [...prev]
            next[idx] = updated
            return next
          })
        },
      )
      .subscribe()

    return () => {
      channelRef.current?.unsubscribe()
    }
  }, [eventoId, load])

  const stats = useMemo<CheckinStats>(() => {
    const confirmados = invitados.filter((i) => i.status === 'confirmado' || i.status === 'checkin')
    const checkinCount = invitados.filter((i) => i.status === 'checkin').length
    return {
      total: invitados.length,
      confirmados: confirmados.length,
      checkinCount,
      pct: confirmados.length > 0 ? Math.round((checkinCount / confirmados.length) * 100) : 0,
    }
  }, [invitados])

  const recentCheckins = useMemo(() => {
    return invitados
      .filter((i) => i.status === 'checkin' && i.checkinAt)
      .sort((a, b) => (b.checkinAt ?? '').localeCompare(a.checkinAt ?? ''))
      .slice(0, 10)
  }, [invitados])

  async function checkInByToken(
    token: string,
    acompanantesPresentes?: number,
  ): Promise<CheckInByTokenResult | CheckInByTokenFailure> {
    return checkInByTokenUC.execute(eventoId, orgId ?? '', token, acompanantesPresentes, user?.id)
  }

  async function checkInManual(
    invitadoId: string,
    acompanantesPresentes?: number,
  ): Promise<CheckInManualResult | CheckInManualFailure> {
    return checkInManualUC.execute(invitadoId, acompanantesPresentes)
  }

  function searchInvitados(query: string): Invitado[] {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return invitados
      .filter((i) =>
        `${i.nombre} ${i.apellido} ${i.dni ?? ''}`.toLowerCase().includes(q),
      )
      .slice(0, 8)
  }

  return {
    invitados,
    isLoading,
    error,
    stats,
    recentCheckins,
    checkInByToken,
    checkInManual,
    searchInvitados,
  }
}
