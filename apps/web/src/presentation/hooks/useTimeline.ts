import { useEffect, useState, useCallback } from 'react'
import { useTimelineStore } from '../stores/timelineStore'
import { SupabaseTimelineRepository } from '../../infrastructure/supabase/SupabaseTimelineRepository'
import { CreateEtapaUseCase } from '../../core/application/timeline/CreateEtapaUseCase'
import { UpdateEtapaUseCase } from '../../core/application/timeline/UpdateEtapaUseCase'
import { DeleteEtapaUseCase } from '../../core/application/timeline/DeleteEtapaUseCase'
import { ReorderEtapasUseCase } from '../../core/application/timeline/ReorderEtapasUseCase'
import { StartEtapaUseCase } from '../../core/application/timeline/StartEtapaUseCase'
import { CompleteEtapaUseCase } from '../../core/application/timeline/CompleteEtapaUseCase'
import { supabase } from '../../infrastructure/supabase/client'
import type { CreateEtapaData, UpdateEtapaData } from '../../core/ports/ITimelineRepository'

const repo       = new SupabaseTimelineRepository()
const createUC   = new CreateEtapaUseCase(repo)
const updateUC   = new UpdateEtapaUseCase(repo)
const deleteUC   = new DeleteEtapaUseCase(repo)
const reorderUC  = new ReorderEtapasUseCase(repo)
const startUC    = new StartEtapaUseCase(repo)
const completeUC = new CompleteEtapaUseCase(repo)

export function useTimeline(eventoId: string) {
  const { getEtapas, setEtapas, upsertEtapa, removeEtapa } = useTimelineStore()
  const etapas = getEtapas(eventoId)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]         = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await repo.findByEvento(eventoId)
      setEtapas(eventoId, data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar el timeline')
    } finally {
      setIsLoading(false)
    }
  }, [eventoId, setEtapas])

  useEffect(() => {
    load()
    const channel = supabase
      .channel(`timeline-${eventoId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'timeline_etapas', filter: `evento_id=eq.${eventoId}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            removeEtapa(eventoId, (payload.old as { id: string }).id)
          } else {
            load()
          }
        },
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [eventoId, load, removeEtapa])

  return {
    etapas,
    isLoading,
    error,
    reload: load,

    create: async (data: Omit<CreateEtapaData, 'eventoId'>) => {
      const e = await createUC.execute({ ...data, eventoId })
      upsertEtapa(eventoId, e)
      return e
    },

    update: async (id: string, data: UpdateEtapaData) => {
      const e = await updateUC.execute(id, data)
      upsertEtapa(eventoId, e)
      return e
    },

    remove: async (id: string) => {
      await deleteUC.execute(id)
      removeEtapa(eventoId, id)
    },

    reorder: async (orderedIds: string[]) => {
      await reorderUC.execute(orderedIds)
      await load()
    },

    start: async (id: string) => {
      const e = await startUC.execute(id)
      upsertEtapa(eventoId, e)
      return e
    },

    complete: async (id: string) => {
      const e = await completeUC.execute(id)
      upsertEtapa(eventoId, e)
      return e
    },
  }
}
