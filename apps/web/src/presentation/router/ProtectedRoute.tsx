import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'

type Role = 'organizador' | 'recepcion' | 'chef'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: Role[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { session, role, isLoading, profileError } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-slate-400">Cargando...</p>
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />

  // A-3: si el perfil falló, AuthProvider ya hizo sign-out → redirige a login
  if (profileError) return <Navigate to="/login" replace />

  // A-3: session existe pero role es null (estado inesperado) → redirige a login
  if (!role) return <Navigate to="/login" replace />

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={roleHomePath(role)} replace />
  }

  return <>{children}</>
}

export function roleHomePath(role: Role): string {
  if (role === 'recepcion') return '/checkin'
  if (role === 'chef') return '/comanda'
  return '/dashboard'
}
