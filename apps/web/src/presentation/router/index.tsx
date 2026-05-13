import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'
import { ProtectedRoute, roleHomePath } from './ProtectedRoute'
import { EventosPage } from '../pages/eventos/EventosPage'
import { NuevoEventoPage } from '../pages/eventos/NuevoEventoPage'
import { EventoDetailPage } from '../pages/eventos/EventoDetailPage'
import { InvitadosPage } from '../pages/invitados/InvitadosPage'
import { RsvpPage } from '../pages/rsvp/RsvpPage'

function AuthCallbackPage() {
  const { role, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-slate-400">Verificando sesión...</p>
      </div>
    )
  }

  return <Navigate to={role ? roleHomePath(role) : '/login'} replace />
}

function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Planning Pro</h1>
        <p className="text-sm text-slate-400">Login — se implementa en M0 Fase 2</p>
      </div>
    </div>
  )
}

function CheckinPage() {
  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold text-slate-900">Check-in</h1>
      <p className="text-sm text-slate-400 mt-1">M10 — Fase 3</p>
    </div>
  )
}

function ComandaPage() {
  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold text-slate-900">Comanda del Chef</h1>
      <p className="text-sm text-slate-400 mt-1">M9 — Fase 4</p>
    </div>
  )
}

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/auth/callback', element: <AuthCallbackPage /> },
  { path: '/', element: <AuthCallbackPage /> },
  { path: '/rsvp/:slug', element: <RsvpPage /> },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['organizador']}>
        <Navigate to="/eventos" replace />
      </ProtectedRoute>
    ),
  },
  {
    path: '/eventos',
    element: (
      <ProtectedRoute allowedRoles={['organizador']}>
        <EventosPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/eventos/nuevo',
    element: (
      <ProtectedRoute allowedRoles={['organizador']}>
        <NuevoEventoPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/eventos/:id',
    element: (
      <ProtectedRoute allowedRoles={['organizador']}>
        <EventoDetailPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/eventos/:eventoId/invitados',
    element: (
      <ProtectedRoute allowedRoles={['organizador']}>
        <InvitadosPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/checkin',
    element: (
      <ProtectedRoute allowedRoles={['recepcion']}>
        <CheckinPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/comanda',
    element: (
      <ProtectedRoute allowedRoles={['chef']}>
        <ComandaPage />
      </ProtectedRoute>
    ),
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
