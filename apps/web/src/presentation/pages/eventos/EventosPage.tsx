import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, CalendarX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEventos } from '../../hooks/useEventos'
import { useSubscription } from '../../hooks/useSubscription'
import { useOnboarding } from '../../hooks/useOnboarding'
import { EventoCard } from '../../components/eventos/EventoCard'
import { PaywallModal } from '../../components/ui/PaywallModal'
import { OnboardingWizard } from '../../components/onboarding/OnboardingWizard'

const btnBase = cn(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
  'bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
)

export function EventosPage() {
  const { eventos, isLoading, error } = useEventos()
  const { canCreate, isLoading: subLoading } = useSubscription()
  const { show: showOnboarding, dismiss: dismissOnboarding } = useOnboarding(eventos.length)
  const navigate = useNavigate()
  const [showPaywall, setShowPaywall] = useState(false)

  function handleNuevoEvento() {
    if (!canCreate) {
      setShowPaywall(true)
    } else {
      navigate('/eventos/nuevo')
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mis eventos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {eventos.length === 0
              ? 'Aún no tenés eventos'
              : `${eventos.length} evento${eventos.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <button
          onClick={handleNuevoEvento}
          disabled={subLoading}
          className={cn(btnBase, 'disabled:opacity-60')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo evento
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 rounded-lg border bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : eventos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <CalendarX className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h2 className="text-lg font-medium">Creá tu primer evento</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-sm">
            Empezá configurando el evento, luego cargá invitados y publicá el formulario RSVP.
          </p>
          <button onClick={handleNuevoEvento} disabled={subLoading} className={cn(btnBase, 'disabled:opacity-60')}>
            <Plus className="h-4 w-4 mr-2" />
            Crear evento
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {eventos.map((evento) => (
            <EventoCard key={evento.id} evento={evento} />
          ))}
        </div>
      )}

      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} />
      <OnboardingWizard open={showOnboarding} onDismiss={dismissOnboarding} />
    </div>
  )
}
