import { useCallback, useEffect } from 'react'
import { supabase } from '../../infrastructure/supabase/client'
import { SupabaseServicioRepository } from '../../infrastructure/supabase/SupabaseServicioRepository'
import { SupabaseProviderRepository } from '../../infrastructure/supabase/SupabaseProviderRepository'
import { GetServiciosByEventoUseCase } from '../../core/application/servicio/GetServiciosByEventoUseCase'
import { CreateServicioUseCase } from '../../core/application/servicio/CreateServicioUseCase'
import { UpdateServicioUseCase } from '../../core/application/servicio/UpdateServicioUseCase'
import { DeleteServicioUseCase } from '../../core/application/servicio/DeleteServicioUseCase'
import { GetProvidersByOrgUseCase } from '../../core/application/provider/GetProvidersByOrgUseCase'
import { CreateProviderUseCase } from '../../core/application/provider/CreateProviderUseCase'
import { UpdateProviderUseCase } from '../../core/application/provider/UpdateProviderUseCase'
import { DeleteProviderUseCase } from '../../core/application/provider/DeleteProviderUseCase'
import { useServicioStore } from '../stores/servicioStore'
import type { CreateServicioData, UpdateServicioData } from '../../core/ports/IServicioRepository'
import type { CreateProviderData, UpdateProviderData } from '../../core/ports/IProviderRepository'
import { useState } from 'react'

const svcRepo  = new SupabaseServicioRepository()
const provRepo = new SupabaseProviderRepository()
const getServiciosUC  = new GetServiciosByEventoUseCase(svcRepo)
const createSvcUC     = new CreateServicioUseCase(svcRepo)
const updateSvcUC     = new UpdateServicioUseCase(svcRepo)
const deleteSvcUC     = new DeleteServicioUseCase(svcRepo)
const getProvidersUC  = new GetProvidersByOrgUseCase(provRepo)
const createProvUC    = new CreateProviderUseCase(provRepo)
const updateProvUC    = new UpdateProviderUseCase(provRepo)
const deleteProvUC    = new DeleteProviderUseCase(provRepo)

export function useServicios(eventoId: string) {
  const {
    getServicios, setServicios, upsertServicio, removeServicio,
    providers, setProviders, upsertProvider, removeProvider,
  } = useServicioStore()

  const servicios = getServicios(eventoId)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [svcList, provList] = await Promise.all([
        getServiciosUC.execute(eventoId),
        getProvidersUC.execute(),
      ])
      setServicios(eventoId, svcList)
      setProviders(provList)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar servicios')
    } finally {
      setIsLoading(false)
    }
  }, [eventoId, setServicios, setProviders])

  useEffect(() => {
    load()

    const channel = supabase
      .channel(`servicios-${eventoId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'servicios', filter: `evento_id=eq.${eventoId}` },
        () => load(),
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [eventoId, load])

  return {
    servicios,
    providers,
    isLoading,
    error,
    reload: load,

    createServicio: async (data: Omit<CreateServicioData, 'eventoId'>) => {
      const item = await createSvcUC.execute({ ...data, eventoId })
      upsertServicio(eventoId, item)
      return item
    },

    updateServicio: async (id: string, data: UpdateServicioData) => {
      const item = await updateSvcUC.execute(id, data)
      upsertServicio(eventoId, item)
      return item
    },

    deleteServicio: async (id: string) => {
      await deleteSvcUC.execute(id)
      removeServicio(eventoId, id)
    },

    createProvider: async (data: CreateProviderData) => {
      const p = await createProvUC.execute(data)
      upsertProvider(p)
      return p
    },

    updateProvider: async (id: string, data: UpdateProviderData) => {
      const p = await updateProvUC.execute(id, data)
      upsertProvider(p)
      return p
    },

    deleteProvider: async (id: string) => {
      await deleteProvUC.execute(id)
      removeProvider(id)
    },
  }
}
