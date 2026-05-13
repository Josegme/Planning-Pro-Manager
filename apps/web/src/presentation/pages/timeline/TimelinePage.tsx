import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Plus, Bell, AlertCircle, ArrowLeft } from 'lucide-react'
import { useTimeline } from '../../hooks/useTimeline'
import { useEventoStore } from '../../stores/eventoStore'
import { TimelineItem } from '../../components/timeline/TimelineItem'
import { ProgressCard } from '../../components/timeline/ProgressCard'
import { EtapaDialog } from '../../components/timeline/EtapaDialog'
import { Button } from '../../components/ui/Button'
import type { TimelineEtapa } from '../../../core/domain/timeline/TimelineEtapa'

export function TimelinePage() {
  const { eventoId = '' } = useParams<{ eventoId: string }>()
  const evento = useEventoStore((s) => s.eventos.find((e) => e.id === eventoId))
  const {
    etapas,
    isLoading,
    error,
    create,
    update,
    remove,
    start,
    complete,
  } = useTimeline(eventoId)

  const [editingEtapa, setEditingEtapa] = useState<TimelineEtapa | null | undefined>(undefined)
  const [toastMsg, setToastMsg]         = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

  const handleStart = async (id: string) => {
    try {
      await start(id)
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error al iniciar etapa')
    }
  }

  const handleComplete = async (id: string) => {
    try {
      await complete(id)
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error al completar etapa')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await remove(id)
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error al eliminar etapa')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-muted-foreground">Cargando timeline...</p>
      </div>
    )
  }

  return (
    <div className="px-6 py-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to={`/eventos/${eventoId}`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-xl font-semibold">Timeline del evento</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-6">
            {evento?.name && <span>{evento.name} · </span>}
            Programa hora a hora con seguimiento en tiempo real
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Bell className="h-3.5 w-3.5" />
            Notificaciones
          </Button>
          <Button size="sm" onClick={() => setEditingEtapa(null)}>
            <Plus className="h-3.5 w-3.5" />
            Nueva etapa
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white text-sm px-4 py-2.5 rounded-lg shadow-xl animate-in fade-in slide-in-from-bottom-2">
          {toastMsg}
        </div>
      )}

      {etapas.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground text-sm">No hay etapas en el timeline de este evento.</p>
          <Button className="mt-4" onClick={() => setEditingEtapa(null)}>
            <Plus className="h-4 w-4" />
            Crear primera etapa
          </Button>
        </div>
      ) : (
        <>
          <ProgressCard etapas={etapas} onComplete={handleComplete} />

          <div className="rounded-lg border bg-white p-5">
            {etapas.map((e, idx) => (
              <TimelineItem
                key={e.id}
                etapa={e}
                index={idx}
                isLast={idx === etapas.length - 1}
                onStart={handleStart}
                onComplete={handleComplete}
                onEdit={setEditingEtapa}
              />
            ))}
          </div>
        </>
      )}

      <EtapaDialog
        open={editingEtapa !== undefined}
        etapa={editingEtapa}
        onClose={() => setEditingEtapa(undefined)}
        onCreate={async (data) => { await create(data) }}
        onUpdate={async (id, data) => { await update(id, data) }}
        onDelete={handleDelete}
      />
    </div>
  )
}
