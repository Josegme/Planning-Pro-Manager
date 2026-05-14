import { useEffect, useState, useCallback } from 'react'
import { useEventoStore } from '../stores/eventoStore'
import { SupabaseEventoRepository } from '../../infrastructure/supabase/SupabaseEventoRepository'
import { GetEventosUseCase } from '../../core/application/evento/GetEventosUseCase'
import { GetEventoByIdUseCase } from '../../core/application/evento/GetEventoByIdUseCase'
import { CreateEventoUseCase } from '../../core/application/evento/CreateEventoUseCase'
import { UpdateEventoUseCase } from '../../core/application/evento/UpdateEventoUseCase'
import { DeleteEventoUseCase } from '../../core/application/evento/DeleteEventoUseCase'
import { PublishEventoUseCase } from '../../core/application/evento/PublishEventoUseCase'
import { supabase } from '../../infrastructure/supabase/client'
import type { CreateEventoData, UpdateEventoData } from '../../core/ports/IEventoRepository'

const repo = new SupabaseEventoRepository()
const getEventos = new GetEventosUseCase(repo)
const getEventoById = new GetEventoByIdUseCase(repo)
const createEvento = new CreateEventoUseCase(repo)
const updateEvento = new UpdateEventoUseCase(repo)
const deleteEvento = new DeleteEventoUseCase(repo)
const publishEvento = new PublishEventoUseCase(repo)

export function useEventos() {
  const { eventos, setEventos, upsertEvento, removeEvento } = useEventoStore()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getEventos.execute()
      setEventos(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar eventos')
    } finally {
      setIsLoading(false)
    }
  }, [setEventos])

  useEffect(() => {
    load()
    const channel = supabase
      .channel('eventos-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'eventos' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          removeEvento((payload.old as { id: string }).id)
        } else {
          load()
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [load, removeEvento])

  return {
    eventos,
    isLoading,
    error,
    reload: load,
    create: async (data: CreateEventoData) => {
      const e = await createEvento.execute(data)
      upsertEvento(e)
      return e
    },
    update: async (id: string, data: UpdateEventoData) => {
      const e = await updateEvento.execute(id, data)
      upsertEvento(e)
      return e
    },
    remove: async (id: string) => {
      await deleteEvento.execute(id)
      removeEvento(id)
    },
    publish: async (id: string) => {
      const e = await publishEvento.execute(id)
      upsertEvento(e)
      return e
    },
    fetchById: async (id: string) => {
      return getEventoById.execute(id)
    },
  }
}
