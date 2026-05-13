import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Share2, Trash2, Settings2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { SupabaseEventoRepository } from '../../../infrastructure/supabase/SupabaseEventoRepository'
import { GetEventoByIdUseCase } from '../../../core/application/evento/GetEventoByIdUseCase'
import { useEventos } from '../../hooks/useEventos'
import { EventoStatusBadge } from '../../components/eventos/EventoStatusBadge'
import { RsvpConfigForm } from '../../components/eventos/RsvpConfigForm'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Dialog } from '../../components/ui/Dialog'
import type { Evento } from '../../../core/domain/evento/Evento'
import { EVENTO_TYPE_LABEL, isPublishable, isEditable } from '../../../core/domain/evento/Evento'

const repo = new SupabaseEventoRepository()
const getEventoById = new GetEventoByIdUseCase(repo)

export function EventoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { publish, remove } = useEventos()
  const [evento, setEvento] = useState<Evento | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [showRsvpConfig, setShowRsvpConfig] = useState(false)

  useEffect(() => {
    if (!id) return
    setIsLoading(true)
    getEventoById.execute(id)
      .then(setEvento)
      .catch((e) => setError(e instanceof Error ? e.message : 'Error al cargar el evento'))
      .finally(() => setIsLoading(false))
  }, [id])

  const handlePublish = async () => {
    if (!evento) return
    try {
      setIsActionLoading(true)
      const updated = await publish(evento.id)
      setEvento(updated)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al publicar')
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!evento) return
    if (!confirm(`¿Eliminar "${evento.name}"? Esta acción no se puede deshacer.`)) return
    try {
      setIsActionLoading(true)
      await remove(evento.id)
      navigate('/eventos')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al eliminar')
      setIsActionLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-4">
        <div className="h-8 w-48 rounded bg-muted animate-pulse" />
        <div className="h-32 rounded-lg bg-muted animate-pulse" />
      </div>
    )
  }

  if (error || !evento) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <p className="text-destructive">{error ?? 'Evento no encontrado'}</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/eventos')}>
          Volver a eventos
        </Button>
      </div>
    )
  }

  const dateLabel = (() => {
    try {
      return format(parseISO(evento.date), "EEEE d 'de' MMMM yyyy", { locale: es })
    } catch {
      return evento.date
    }
  })()

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            to="/eventos"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-semibold tracking-tight">{evento.name}</h1>
              <EventoStatusBadge status={evento.status} />
            </div>
            <p className="text-sm text-muted-foreground mt-0.5 capitalize">{dateLabel}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isPublishable(evento) && (
            <Button onClick={handlePublish} disabled={isActionLoading}>
              <Share2 className="h-4 w-4 mr-2" />
              Publicar
            </Button>
          )}
          {isEditable(evento) && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleDelete}
              disabled={isActionLoading}
              title="Eliminar evento"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive mb-4">
          {error}
        </div>
      )}

      {evento.rsvpSlug && (
        <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
          <p className="font-medium text-primary mb-1">Link RSVP público</p>
          <code className="text-xs bg-background rounded px-2 py-1 border">
            {window.location.origin}/rsvp/{evento.rsvpSlug}
          </code>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">{EVENTO_TYPE_LABEL[evento.type]}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Capacidad</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{evento.capacity}</p>
            <p className="text-xs text-muted-foreground">personas</p>
          </CardContent>
        </Card>

        {evento.venueName && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Salón</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{evento.venueName}</p>
              {evento.location && (
                <p className="text-sm text-muted-foreground mt-0.5">{evento.location}</p>
              )}
            </CardContent>
          </Card>
        )}

        {evento.time && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Hora</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{evento.time}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-8 space-y-3">
        {/* RSVP config */}
        <button
          type="button"
          onClick={() => setShowRsvpConfig(true)}
          className="w-full flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors group text-left"
        >
          <div>
            <p className="text-sm font-medium flex items-center gap-1.5">
              <Settings2 className="h-4 w-4" /> Configuración RSVP
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {evento.rsvpSlug
                ? 'Formulario publicado · Editar campos, mensaje y banner'
                : 'Configurar formulario de confirmación de asistencia'}
            </p>
          </div>
          <span className="text-muted-foreground group-hover:text-foreground text-sm">→</span>
        </button>

        <Link
          to={`/eventos/${evento.id}/invitados`}
          className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors group"
        >
          <div>
            <p className="text-sm font-medium">Invitados</p>
            <p className="text-xs text-muted-foreground mt-0.5">Gestionar lista, importar Excel y ver estados</p>
          </div>
          <span className="text-muted-foreground group-hover:text-foreground text-sm">→</span>
        </Link>
        {['Mesas (M4)', 'Plano del salón (M5)', 'Timeline (M6)', 'Check-in (M10)'].map((label) => (
          <div
            key={label}
            className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground text-center"
          >
            {label} — disponible próximamente
          </div>
        ))}
      </div>

      {/* RSVP config dialog */}
      <Dialog
        open={showRsvpConfig}
        onClose={() => setShowRsvpConfig(false)}
        title="Configurar RSVP"
        maxWidth="lg"
      >
        <RsvpConfigForm
          evento={evento}
          onSaved={(updated) => {
            setEvento(updated)
            setShowRsvpConfig(false)
          }}
          onCancel={() => setShowRsvpConfig(false)}
        />
      </Dialog>
    </div>
  )
}
