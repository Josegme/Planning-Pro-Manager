import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../../infrastructure/supabase/client'

type Role = 'organizador' | 'recepcion' | 'chef'

interface AuthContextValue {
  session: Session | null
  user: User | null
  role: Role | null
  orgId: string | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  role: null,
  orgId: null,
  isLoading: true,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [orgId, setOrgId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        loadUserProfile(session.user.id)
      } else {
        setIsLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        loadUserProfile(session.user.id)
      } else {
        setRole(null)
        setOrgId(null)
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadUserProfile(userId: string) {
    try {
      const { data } = await supabase
        .from('users')
        .select('role, org_id')
        .eq('id', userId)
        .single()

      if (data) {
        setRole(data.role as Role)
        setOrgId(data.org_id)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, role, orgId, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
