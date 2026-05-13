import { useEffect, useState, useCallback } from 'react'
import { useInvitadoStore } from '../stores/invitadoStore'
import { SupabaseInvitadoRepository } from '../../infrastructure/supabase/SupabaseInvitadoRepository'
import { GetInvitadosByEventoUseCase } from '../../core/application/invitado/GetInvitadosByEventoUseCase'
import { CreateInvitadoUseCase } from '../../core/application/invitado/CreateInvitadoUseCase'
import { UpdateInvitadoUseCase } from '../../core/application/invitado/UpdateInvitadoUseCase'
import { DeleteInvitadoUseCase } from '../../core/application/invitado/DeleteInvitadoUseCase'
import { ImportInvitadosUseCase } from '../../core/application/invitado/ImportInvitadosUseCase'
import { GenerateManualQrUseCase } from '../../core/application/invitado/GenerateManualQrUseCase'
import { RegenerateQrUseCase } from '../../core/application/invitado/RegenerateQrUseCase'
import { supabase } from '../../infrastructure/supabase/client'
import type { CreateInvitadoData, UpdateInvitadoData } from '../../core/ports/IInvitadoRepository'
import type { ImportRow } from '../../core/application/invitado/ImportInvitadosUseCase'

const repo = new SupabaseInvitadoRepository()
const getByEvento = new GetInvitadosByEventoUseCase(repo)
const createUC    = new CreateInvitadoUseCase(repo)
const updateUC    = new UpdateInvitadoUseCase(repo)
const deleteUC    = new DeleteInvitadoUseCase(repo)
const importUC    = new ImportInvitadosUseCase(repo)
const generateQrUC    = new GenerateManualQrUseCase(repo)
const regenerateQrUC  = new RegenerateQrUseCase(repo)

export function useInvitados(eventoId: string) {
  const { getInvitados, setInvitados, upsertInvitado, removeInvitado } = useInvitadoStore()
  const invitados = getInvitados(eventoId)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getByEvento.execute(eventoId)
      setInvitados(eventoId, data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar invitados')
    } finally {
      setIsLoading(false)
    }
  }, [eventoId, setInvitados])

  useEffect(() => {
    load()
    const channel = supabase
      .channel(`invitados-${eventoId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'invitados', filter: `evento_id=eq.${eventoId}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            removeInvitado(eventoId, (payload.old as { id: string }).id)
          } else {
            load()
          }
        },
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [eventoId, load, removeInvitado])

  return {
    invitados,
    isLoading,
    error,
    reload: load,
    create: async (data: Omit<CreateInvitadoData, 'eventoId'>) => {
      const inv = await createUC.execute({ ...data, eventoId })
      upsertInvitado(eventoId, inv)
      return inv
    },
    update: async (id: string, data: UpdateInvitadoData) => {
      const inv = await updateUC.execute(id, data)
      upsertInvitado(eventoId, inv)
      return inv
    },
    remove: async (id: string) => {
      await deleteUC.execute(id)
      removeInvitado(eventoId, id)
    },
    importRows: async (rows: ImportRow[]) => {
      const result = await importUC.execute(eventoId, rows)
      await load()
      return result
    },
    generateQr: async (id: string) => {
      const inv = await generateQrUC.execute(id)
      upsertInvitado(eventoId, inv)
      return inv
    },
    regenerateQr: async (id: string) => {
      const inv = await regenerateQrUC.execute(id)
      upsertInvitado(eventoId, inv)
      return inv
    },
  }
}
