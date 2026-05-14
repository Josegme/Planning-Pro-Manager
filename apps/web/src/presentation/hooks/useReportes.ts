import { useState, useEffect, useCallback } from 'react'
import { SupabaseReportRepository } from '../../infrastructure/supabase/SupabaseReportRepository'
import { GetEventReportUseCase } from '../../core/application/report/GetEventReportUseCase'
import { GetHistoricoUseCase } from '../../core/application/report/GetHistoricoUseCase'
import type { EventReport, HistoricoItem } from '../../core/domain/report/EventReport'

const repo = new SupabaseReportRepository()
const getEventReportUC = new GetEventReportUseCase(repo)
const getHistoricoUC = new GetHistoricoUseCase(repo)

export function useReportes(eventoId: string) {
  const [report, setReport] = useState<EventReport | null>(null)
  const [historico, setHistorico] = useState<HistoricoItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!eventoId) return
    setIsLoading(true)
    setError(null)
    try {
      const [r, h] = await Promise.all([
        getEventReportUC.execute(eventoId),
        getHistoricoUC.execute(eventoId),
      ])
      setReport(r)
      setHistorico(h)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar los reportes')
    } finally {
      setIsLoading(false)
    }
  }, [eventoId])

  useEffect(() => { load() }, [load])

  return { report, historico, isLoading, error, reload: load }
}
