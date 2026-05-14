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
  profileError: boolean
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  role: null,
  orgId: null,
  isLoading: true,
  profileError: false,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [orgId, setOrgId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [profileError, setProfileError] = useState(false)

  useEffect(() => {
    // B-2: getUser() verifica el token en el servidor (no solo el storage local)
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          setSession(session)
          loadUserProfile(user.id)
        })
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
        setProfileError(false)
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadUserProfile(userId: string) {
    try {
      setProfileError(false)
      const { data, error } = await supabase
        .from('users')
        .select('role, org_id')
        .eq('id', userId)
        .single()

      if (error || !data) {
        // A-3: si falla la carga del perfil, marcamos error y forzamos sign-out
        setProfileError(true)
        await supabase.auth.signOut()
        return
      }
      setRole(data.role as Role)
      setOrgId(data.org_id)
    } catch {
      setProfileError(true)
      await supabase.auth.signOut()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, role, orgId, isLoading, profileError }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
