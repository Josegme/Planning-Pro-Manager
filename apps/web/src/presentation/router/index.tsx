import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'
import { ProtectedRoute, roleHomePath } from './ProtectedRoute'
import { EventosPage } from '../pages/eventos/EventosPage'
import { NuevoEventoPage } from '../pages/eventos/NuevoEventoPage'
import { EventoDetailPage } from '../pages/eventos/EventoDetailPage'
import { InvitadosPage } from '../pages/invitados/InvitadosPage'
import { MesasPage } from '../pages/mesas/MesasPage'
import { PlanoPage } from '../pages/plano/PlanoPage'
import { TimelinePage } from '../pages/timeline/TimelinePage'
import { RsvpPage } from '../pages/rsvp/RsvpPage'
import { CheckinPage } from '../pages/checkin/CheckinPage'
import { ServiciosPage } from '../pages/servicios/ServiciosPage'
import { ChecklistPage } from '../pages/checklist/ChecklistPage'
import { ComandaPage } from '../pages/comanda/ComandaPage'
import { ReportesPage } from '../pages/reportes/ReportesPage'

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
    path: '/eventos/:eventoId/mesas',
    element: (
      <ProtectedRoute allowedRoles={['organizador']}>
        <MesasPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/eventos/:eventoId/plano',
    element: (
      <ProtectedRoute allowedRoles={['organizador']}>
        <PlanoPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/eventos/:eventoId/timeline',
    element: (
      <ProtectedRoute allowedRoles={['organizador']}>
        <TimelinePage />
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
    path: '/eventos/:eventoId/servicios',
    element: (
      <ProtectedRoute allowedRoles={['organizador']}>
        <ServiciosPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/eventos/:eventoId/checklist',
    element: (
      <ProtectedRoute allowedRoles={['organizador']}>
        <ChecklistPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/eventos/:eventoId/checkin',
    element: (
      <ProtectedRoute allowedRoles={['organizador']}>
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
  {
    path: '/eventos/:eventoId/comanda',
    element: (
      <ProtectedRoute allowedRoles={['organizador']}>
        <ComandaPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/eventos/:eventoId/reportes',
    element: (
      <ProtectedRoute allowedRoles={['organizador']}>
        <ReportesPage />
      </ProtectedRoute>
    ),
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
