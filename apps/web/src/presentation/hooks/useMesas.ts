import { useEffect, useState, useCallback } from 'react'
import { useMesaStore } from '../stores/mesaStore'
import { useInvitadoStore } from '../stores/invitadoStore'
import { SupabaseMesaRepository } from '../../infrastructure/supabase/SupabaseMesaRepository'
import { CreateMesaUseCase } from '../../core/application/mesa/CreateMesaUseCase'
import { UpdateMesaUseCase } from '../../core/application/mesa/UpdateMesaUseCase'
import { DeleteMesaUseCase } from '../../core/application/mesa/DeleteMesaUseCase'
import { AssignInvitadoUseCase } from '../../core/application/mesa/AssignInvitadoUseCase'
import { UnassignInvitadoUseCase } from '../../core/application/mesa/UnassignInvitadoUseCase'
import { AutoAssignMesasUseCase } from '../../core/application/mesa/AutoAssignMesasUseCase'
import { SupabaseInvitadoRepository } from '../../infrastructure/supabase/SupabaseInvitadoRepository'
import { supabase } from '../../infrastructure/supabase/client'
import { calcOccupied } from '../../core/domain/mesa/Mesa'
import type { CreateMesaData, UpdateMesaData } from '../../core/ports/IMesaRepository'

const mesaRepo      = new SupabaseMesaRepository()
const invitadoRepo  = new SupabaseInvitadoRepository()
const createUC      = new CreateMesaUseCase(mesaRepo)
const updateUC      = new UpdateMesaUseCase(mesaRepo)
const deleteUC      = new DeleteMesaUseCase(mesaRepo)
const assignUC      = new AssignInvitadoUseCase(mesaRepo, invitadoRepo)
const unassignUC    = new UnassignInvitadoUseCase(mesaRepo)
const autoAssignUC  = new AutoAssignMesasUseCase()

export function useMesas(eventoId: string) {
  const { getMesas, setMesas, upsertMesa, removeMesa } = useMesaStore()
  const { getInvitados, setInvitados, upsertInvitado } = useInvitadoStore()

  const mesas     = getMesas(eventoId)
  const invitados = getInvitados(eventoId)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]         = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [mesaList, invList] = await Promise.all([
        mesaRepo.findByEvento(eventoId),
        invitadoRepo.findByEvento(eventoId),
      ])
      setMesas(eventoId, mesaList)
      setInvitados(eventoId, invList)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar mesas')
    } finally {
      setIsLoading(false)
    }
  }, [eventoId, setMesas, setInvitados])

  useEffect(() => {
    load()

    const channel = supabase
      .channel(`mesas-${eventoId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'mesas', filter: `evento_id=eq.${eventoId}` },
        () => load(),
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'invitados', filter: `evento_id=eq.${eventoId}` },
        () => load(),
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [eventoId, load])

  return {
    mesas,
    invitados,
    isLoading,
    error,
    reload: load,

    create: async (data: Omit<CreateMesaData, 'eventoId'>) => {
      const mesa = await createUC.execute({ ...data, eventoId })
      upsertMesa(eventoId, mesa)
      return mesa
    },

    update: async (id: string, data: UpdateMesaData) => {
      const mesa = await updateUC.execute(id, data)
      upsertMesa(eventoId, mesa)
      return mesa
    },

    remove: async (id: string) => {
      await deleteUC.execute(id)
      removeMesa(eventoId, id)
    },

    assign: async (invitadoId: string, mesaId: string) => {
      await assignUC.execute(invitadoId, mesaId)
      const inv = invitados.find((i) => i.id === invitadoId)
      if (inv) upsertInvitado(eventoId, { ...inv, mesaId })
    },

    unassign: async (invitadoId: string) => {
      await unassignUC.execute(invitadoId)
      const inv = invitados.find((i) => i.id === invitadoId)
      if (inv) upsertInvitado(eventoId, { ...inv, mesaId: null })
    },

    autoAssign: async () => {
      const unassigned = invitados.filter(
        (i) => i.mesaId === null && i.status === 'confirmado',
      )
      const currentOccupied: Record<string, number> = {}
      mesas.forEach((m) => {
        const asignados = invitados.filter((i) => i.mesaId === m.id)
        currentOccupied[m.id] = calcOccupied(asignados)
      })

      const { assignments, unplaced } = autoAssignUC.execute(
        unassigned,
        mesas,
        currentOccupied,
      )

      if (assignments.length === 0) return { placed: 0, unplaced: unplaced.length }

      await mesaRepo.bulkAssign(assignments)
      await load()

      return { placed: assignments.length, unplaced: unplaced.length }
    },
  }
}
