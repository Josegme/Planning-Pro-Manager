import { useState } from 'react'
import { Search, Utensils } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '../ui/Badge'
import { Input } from '../ui/Input'
import { InvitadoAvatar } from './InvitadoAvatar'
import { nombreCompleto } from '../../../core/domain/invitado/Invitado'
import type { Invitado } from '../../../core/domain/invitado/Invitado'

interface Props {
  invitados: Invitado[]
  draggedId: string | null
  onDragStart: (id: string) => void
  onDragEnd: () => void
}

export function UnassignedPanel({ invitados, draggedId, onDragStart, onDragEnd }: Props) {
  const [search, setSearch] = useState('')

  const filtered = invitados.filter((inv) => {
    if (!search) return true
    const q = search.toLowerCase()
    return nombreCompleto(inv).toLowerCase().includes(q)
  })

  return (
    <div className="lg:sticky lg:top-4 bg-white border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Sin asignar</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Arrastrá a una mesa</p>
        </div>
        <Badge variant="warning">{invitados.length}</Badge>
      </div>

      <div className="p-3">
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="pl-8 h-8 text-xs"
          />
        </div>

        <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-0.5">
          {filtered.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-6 italic">
              {invitados.length === 0 ? 'Todos están asignados' : 'Sin resultados'}
            </p>
          )}
          {filtered.map((inv) => (
            <div
              key={inv.id}
              draggable
              onDragStart={() => onDragStart(inv.id)}
              onDragEnd={onDragEnd}
              className={cn(
                'flex items-center gap-2 px-2 py-1.5 rounded-md border border-border bg-white',
                'cursor-grab active:cursor-grabbing text-xs',
                'hover:border-primary hover:bg-primary/5 transition-colors',
                draggedId === inv.id && 'opacity-40',
              )}
            >
              <InvitadoAvatar name={nombreCompleto(inv)} size={22} />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{nombreCompleto(inv)}</div>
                <div className="text-[10px] text-muted-foreground truncate">
                  {inv.grupo ?? 'Sin grupo'}
                  {inv.acompanantesEsperados > 0 && ` · +${inv.acompanantesEsperados}`}
                </div>
              </div>
              {inv.dietaryRestrictions.length > 0 && (
                <Utensils className="h-3 w-3 text-amber-500 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
