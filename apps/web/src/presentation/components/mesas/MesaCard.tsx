import { X, Utensils } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '../ui/Badge'
import { MesaOccupancyBar } from './MesaOccupancyBar'
import { InvitadoAvatar } from './InvitadoAvatar'
import { getMesaOccupancyStatus, calcOccupied } from '../../../core/domain/mesa/Mesa'
import { nombreCompleto } from '../../../core/domain/invitado/Invitado'
import type { Mesa } from '../../../core/domain/mesa/Mesa'
import type { Invitado } from '../../../core/domain/invitado/Invitado'

interface Props {
  mesa: Mesa
  invitados: Invitado[]
  isDragOver: boolean
  onDragOver: () => void
  onDragLeave: () => void
  onDrop: () => void
  onUnassign: (invitadoId: string) => void
  onEdit: () => void
}

const ringColor = {
  empty:   'ring-slate-200',
  partial: 'ring-amber-300',
  full:    'ring-orange-400',
  checkin: 'ring-blue-400',
}

const numBg = {
  empty:   'bg-slate-100 text-slate-500',
  partial: 'bg-amber-50 text-amber-700',
  full:    'bg-orange-50 text-orange-700',
  checkin: 'bg-blue-50 text-blue-700',
}

export function MesaCard({
  mesa,
  invitados,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onUnassign,
  onEdit,
}: Props) {
  const occupied   = calcOccupied(invitados)
  const hasCheckin = invitados.some((i) => i.status === 'checkin')
  const status     = getMesaOccupancyStatus(occupied, mesa.capacity, hasCheckin)

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); onDragOver() }}
      onDragLeave={onDragLeave}
      onDrop={(e) => { e.preventDefault(); onDrop() }}
      onClick={onEdit}
      className={cn(
        'rounded-lg border bg-white p-3 cursor-pointer transition-all select-none',
        isDragOver
          ? 'ring-2 ring-primary border-primary bg-primary/5'
          : `ring-1 ${ringColor[status]}`,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn('h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0', numBg[status])}>
            {mesa.number}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate leading-tight">
              {mesa.name ?? `Mesa ${mesa.number}`}
            </div>
            <div className="text-[10px] text-muted-foreground">cap. {mesa.capacity}</div>
          </div>
        </div>
        <div className="text-sm font-mono font-semibold tabular-nums text-right shrink-0">
          {occupied}
          <span className="text-muted-foreground font-normal">/{mesa.capacity}</span>
        </div>
      </div>

      <MesaOccupancyBar occupied={occupied} capacity={mesa.capacity} status={status} />

      {mesa.menuEspecial && (
        <div className="mt-2">
          <Badge variant="warning" className="text-[10px] gap-1">
            <Utensils className="h-2.5 w-2.5" />
            {mesa.menuEspecial}
          </Badge>
        </div>
      )}

      {/* Invitado list */}
      <div className="mt-2.5 space-y-1 min-h-[40px]">
        {invitados.length === 0 ? (
          <div className="text-[11px] text-muted-foreground italic text-center py-3 border border-dashed border-border rounded">
            Arrastrá invitados aquí
          </div>
        ) : (
          <>
            {invitados.slice(0, 4).map((inv) => (
              <div
                key={inv.id}
                className="flex items-center gap-1.5 text-xs group"
                onClick={(e) => e.stopPropagation()}
              >
                <InvitadoAvatar name={nombreCompleto(inv)} size={18} />
                <span className="truncate flex-1">
                  {inv.nombre} {inv.apellido[0]}.
                  {inv.acompanantesEsperados > 0 && (
                    <span className="text-muted-foreground"> +{inv.acompanantesEsperados}</span>
                  )}
                </span>
                <button
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                  onClick={(e) => { e.stopPropagation(); onUnassign(inv.id) }}
                  title="Quitar de la mesa"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {invitados.length > 4 && (
              <div className="text-[11px] text-muted-foreground pl-1">
                +{invitados.length - 4} más
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
