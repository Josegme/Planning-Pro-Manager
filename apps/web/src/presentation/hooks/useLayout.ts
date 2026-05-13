import { useEffect, useState, useCallback } from 'react'
import { useLayoutStore } from '../stores/layoutStore'
import { SupabaseEventLayoutRepository } from '../../infrastructure/supabase/SupabaseEventLayoutRepository'
import { GetLayoutUseCase } from '../../core/application/layout/GetLayoutUseCase'
import { SaveLayoutUseCase } from '../../core/application/layout/SaveLayoutUseCase'
import type { StructuralElement } from '../../core/domain/layout/EventLayout'

const repo    = new SupabaseEventLayoutRepository()
const getUC   = new GetLayoutUseCase(repo)
const saveUC  = new SaveLayoutUseCase(repo)

export function useLayout(eventoId: string) {
  const { getLayout, setLayout } = useLayoutStore()
  const layout = getLayout(eventoId)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]         = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getUC.execute(eventoId)
      setLayout(eventoId, data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar el plano')
    } finally {
      setIsLoading(false)
    }
  }, [eventoId, setLayout])

  useEffect(() => { load() }, [load])

  return {
    layout,
    isLoading,
    error,
    reload: load,
    saveElements: async (elements: StructuralElement[]) => {
      const saved = await saveUC.execute(eventoId, elements)
      setLayout(eventoId, saved)
      return saved
    },
  }
}
