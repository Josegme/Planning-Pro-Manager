import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'
import { ProtectedRoute, roleHomePath } from './ProtectedRoute'

// Lazy-loaded pages — each route chunk loads on first navigation
const EventosPage      = lazy(() => import('../pages/eventos/EventosPage').then((m) => ({ default: m.EventosPage })))
const NuevoEventoPage  = lazy(() => import('../pages/eventos/NuevoEventoPage').then((m) => ({ default: m.NuevoEventoPage })))
const EventoDetailPage = lazy(() => import('../pages/eventos/EventoDetailPage').then((m) => ({ default: m.EventoDetailPage })))
const InvitadosPage    = lazy(() => import('../pages/invitados/InvitadosPage').then((m) => ({ default: m.InvitadosPage })))
const MesasPage        = lazy(() => import('../pages/mesas/MesasPage').then((m) => ({ default: m.MesasPage })))
const PlanoPage        = lazy(() => import('../pages/plano/PlanoPage').then((m) => ({ default: m.PlanoPage })))
const TimelinePage     = lazy(() => import('../pages/timeline/TimelinePage').then((m) => ({ default: m.TimelinePage })))
const RsvpPage         = lazy(() => import('../pages/rsvp/RsvpPage').then((m) => ({ default: m.RsvpPage })))
const CheckinPage      = lazy(() => import('../pages/checkin/CheckinPage').then((m) => ({ default: m.CheckinPage })))
const ServiciosPage    = lazy(() => import('../pages/servicios/ServiciosPage').then((m) => ({ default: m.ServiciosPage })))
const ChecklistPage    = lazy(() => import('../pages/checklist/ChecklistPage').then((m) => ({ default: m.ChecklistPage })))
const ComandaPage      = lazy(() => import('../pages/comanda/ComandaPage').then((m) => ({ default: m.ComandaPage })))
const ReportesPage     = lazy(() => import('../pages/reportes/ReportesPage').then((m) => ({ default: m.ReportesPage })))
const MockPaymentPage  = lazy(() => import('../pages/payment/MockPaymentPage').then((m) => ({ default: m.MockPaymentPage })))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  )
}

function AuthCallbackPage() {
  const { role, isLoading } = useAuth()
  if (isLoading) return <PageLoader />
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

function withSuspense(element: React.ReactNode) {
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>
}

const router = createBrowserRouter([
  { path: '/login',          element: <LoginPage /> },
  { path: '/auth/callback',  element: <AuthCallbackPage /> },
  { path: '/',               element: <AuthCallbackPage /> },
  { path: '/rsvp/:slug',     element: withSuspense(<RsvpPage />) },
  { path: '/payment/mock',   element: withSuspense(<MockPaymentPage />) },
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
        {withSuspense(<EventosPage />)}
      </ProtectedRoute>
    ),
  },
  {
    path: '/eventos/nuevo',
    element: (
      <ProtectedRoute allowedRoles={['organizador']}>
        {withSuspense(<NuevoEventoPage />)}
      </ProtectedRoute>
    ),
  },
  {
    path: '/eventos/:id',
    element: (
      <ProtectedRoute allowedRoles={['organizador']}>
        {withSuspense(<EventoDetailPage />)}
      </ProtectedRoute>
    ),
  },
  {
    path: '/eventos/:eventoId/invitados',
    element: (
      <ProtectedRoute allowedRoles={['organizador']}>
        {withSuspense(<InvitadosPage />)}
      </ProtectedRoute>
    ),
  },
  {
    path: '/eventos/:eventoId/mesas',
    element: (
      <ProtectedRoute allowedRoles={['organizador']}>
        {withSuspense(<MesasPage />)}
      </ProtectedRoute>
    ),
  },
  {
    path: '/eventos/:eventoId/plano',
    element: (
      <ProtectedRoute allowedRoles={['organizador']}>
        {withSuspense(<PlanoPage />)}
      </ProtectedRoute>
    ),
  },
  {
    path: '/eventos/:eventoId/timeline',
    element: (
      <ProtectedRoute allowedRoles={['organizador']}>
        {withSuspense(<TimelinePage />)}
      </ProtectedRoute>
    ),
  },
  {
    path: '/checkin',
    element: (
      <ProtectedRoute allowedRoles={['recepcion']}>
        {withSuspense(<CheckinPage />)}
      </ProtectedRoute>
    ),
  },
  {
    path: '/eventos/:eventoId/checkin',
    element: (
      <ProtectedRoute allowedRoles={['organizador']}>
        {withSuspense(<CheckinPage />)}
      </ProtectedRoute>
    ),
  },
  {
    path: '/eventos/:eventoId/servicios',
    element: (
      <ProtectedRoute allowedRoles={['organizador']}>
        {withSuspense(<ServiciosPage />)}
      </ProtectedRoute>
    ),
  },
  {
    path: '/eventos/:eventoId/checklist',
    element: (
      <ProtectedRoute allowedRoles={['organizador']}>
        {withSuspense(<ChecklistPage />)}
      </ProtectedRoute>
    ),
  },
  {
    path: '/comanda',
    element: (
      <ProtectedRoute allowedRoles={['chef']}>
        {withSuspense(<ComandaPage />)}
      </ProtectedRoute>
    ),
  },
  {
    path: '/eventos/:eventoId/comanda',
    element: (
      <ProtectedRoute allowedRoles={['organizador']}>
        {withSuspense(<ComandaPage />)}
      </ProtectedRoute>
    ),
  },
  {
    path: '/eventos/:eventoId/reportes',
    element: (
      <ProtectedRoute allowedRoles={['organizador']}>
        {withSuspense(<ReportesPage />)}
      </ProtectedRoute>
    ),
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
