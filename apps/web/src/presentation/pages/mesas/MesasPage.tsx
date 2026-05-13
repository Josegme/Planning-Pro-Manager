import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Sparkles, Plus, Map, AlertCircle } from 'lucide-react'
import { useMesas } from '../../hooks/useMesas'
import { useEventoStore } from '../../stores/eventoStore'
import { MesaCard } from '../../components/mesas/MesaCard'
import { UnassignedPanel } from '../../components/mesas/UnassignedPanel'
import { MesaDialog } from '../../components/mesas/MesaDialog'
import { Button } from '../../components/ui/Button'
import type { Mesa } from '../../../core/domain/mesa/Mesa'

export function MesasPage() {
  const { eventoId = '' } = useParams<{ eventoId: string }>()
  const evento = useEventoStore((s) => s.eventos.find((e) => e.id === eventoId))
  const { mesas, invitados, isLoading, error, create, update, remove, assign, unassign, autoAssign } = useMesas(eventoId)

  const [draggedId, setDraggedId]   = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [editingMesa, setEditingMesa] = useState<Mesa | null | undefined>(undefined)
  const [toastMsg, setToastMsg]     = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

  const invitadosByMesa = useMemo(() => {
    const map: Record<string, typeof invitados> = {}
    mesas.forEach((m) => { map[m.id] = [] })
    invitados.forEach((inv) => {
      if (inv.mesaId && map[inv.mesaId]) map[inv.mesaId].push(inv)
    })
    return map
  }, [mesas, invitados])

  const unassigned = useMemo(
    () => invitados.filter((i) => i.mesaId === null && i.status === 'confirmado'),
    [invitados],
  )

  const totalAssigned  = invitados.filter((i) => i.mesaId !== null).length
  const totalCapacity  = mesas.reduce((s, m) => s + m.capacity, 0)
  const nextNumber     = mesas.length > 0 ? Math.max(...mesas.map((m) => m.number)) + 1 : 1

  const handleDrop = async (mesaId: string) => {
    if (!draggedId) return
    setDragOverId(null)
    try {
      await assign(draggedId, mesaId)
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'No se pudo asignar')
    } finally {
      setDraggedId(null)
    }
  }

  const handleUnassign = async (invitadoId: string) => {
    try {
      await unassign(invitadoId)
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error al quitar invitado')
    }
  }

  const handleAutoAssign = async () => {
    try {
      const result = await autoAssign()
      if (result.placed === 0) {
        showToast('No hay invitados confirmados sin asignar o no hay capacidad disponible')
      } else if (result.unplaced > 0) {
        showToast(`Se asignaron ${result.placed} invitados. ${result.unplaced} no entraron en ninguna mesa.`)
      } else {
        showToast(`Se asignaron ${result.placed} invitados automáticamente`)
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error en asignación automática')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-muted-foreground">Cargando mesas...</p>
      </div>
    )
  }

  return (
    <div className="px-6 py-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">Mesas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {evento?.name && <span>{evento.name} · </span>}
            {mesas.length} mesas · {totalAssigned} invitados asignados · cap. total {totalCapacity}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleAutoAssign} disabled={unassigned.length === 0}>
            <Sparkles className="h-3.5 w-3.5" />
            Asignación automática
          </Button>
          <Button variant="outline" size="sm" onClick={() => setEditingMesa(null)}>
            <Plus className="h-3.5 w-3.5" />
            Nueva mesa
          </Button>
          <Link
            to={`/eventos/${eventoId}/plano`}
            className="inline-flex items-center gap-1.5 h-9 rounded-md px-3 text-sm border border-input bg-background hover:bg-accent hover:text-accent-foreground font-medium transition-colors"
          >
            <Map className="h-3.5 w-3.5" />
            Ver en plano
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white text-sm px-4 py-2.5 rounded-lg shadow-xl animate-in fade-in slide-in-from-bottom-2">
          {toastMsg}
        </div>
      )}

      {mesas.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground text-sm">No hay mesas configuradas para este evento.</p>
          <Button className="mt-4" onClick={() => setEditingMesa(null)}>
            <Plus className="h-4 w-4" />
            Crear primera mesa
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-4">
          {/* Unassigned sidebar */}
          <div className="col-span-12 lg:col-span-3">
            <UnassignedPanel
              invitados={unassigned}
              draggedId={draggedId}
              onDragStart={setDraggedId}
              onDragEnd={() => setDraggedId(null)}
            />
          </div>

          {/* Mesas grid */}
          <div className="col-span-12 lg:col-span-9">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {mesas.map((mesa) => (
                <MesaCard
                  key={mesa.id}
                  mesa={mesa}
                  invitados={invitadosByMesa[mesa.id] ?? []}
                  isDragOver={dragOverId === mesa.id}
                  onDragOver={() => setDragOverId(mesa.id)}
                  onDragLeave={() => setDragOverId(null)}
                  onDrop={() => handleDrop(mesa.id)}
                  onUnassign={handleUnassign}
                  onEdit={() => setEditingMesa(mesa)}
                />
              ))}

              {/* Add mesa card */}
              <button
                onClick={() => setEditingMesa(null)}
                className="rounded-lg border border-dashed border-border p-3 flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors min-h-[120px]"
              >
                <Plus className="h-5 w-5" />
                <span className="text-xs">Nueva mesa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog */}
      <MesaDialog
        open={editingMesa !== undefined}
        mesa={editingMesa}
        nextNumber={nextNumber}
        onClose={() => setEditingMesa(undefined)}
        onCreate={async (data) => { await create(data) }}
        onUpdate={async (id, data) => { await update(id, data) }}
        onDelete={(id) => remove(id)}
      />
    </div>
  )
}
