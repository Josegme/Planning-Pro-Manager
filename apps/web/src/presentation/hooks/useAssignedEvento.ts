import { useEffect, useState } from 'react'
import { SupabaseEventoRepository } from '../../infrastructure/supabase/SupabaseEventoRepository'
import { useAuth } from '../providers/AuthProvider'

const repo = new SupabaseEventoRepository()

export function useAssignedEvento(role?: 'recepcion' | 'chef', skip = false) {
  const { user } = useAuth()
  const [eventoId, setEventoId] = useState<string | null>(null)
  const [eventoName, setEventoName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(!skip)

  useEffect(() => {
    if (skip || !user) { setIsLoading(false); return }
    setIsLoading(true)
    repo.getAssignedToUser(user.id, role)
      .then((result) => {
        if (result) {
          setEventoId(result.id)
          setEventoName(result.name)
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [user, role, skip])

  return { eventoId, eventoName, isLoading }
}
