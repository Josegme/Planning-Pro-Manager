import type { Mesa } from '../../../core/domain/mesa/Mesa'
import type { Invitado } from '../../../core/domain/invitado/Invitado'
import { Badge } from '../ui/Badge'

interface Props {
  mesa: Mesa
  invitados: Invitado[]
}

export function PlanoTooltip({ mesa, invitados }: Props) {
  const occ = invitados.reduce((s, i) => s + 1 + i.acompanantesEsperados, 0)
  const checkin = invitados.filter((i) => i.status === 'checkin').length
  const pct = mesa.capacity > 0 ? Math.round((occ / mesa.capacity) * 100) : 0

  return (
    <div className="w-56 rounded-lg border bg-white shadow-xl text-sm pointer-events-none">
      <div className="px-3 py-2.5 border-b flex items-center justify-between">
        <span className="font-semibold">{mesa.name ?? `Mesa ${mesa.number}`}</span>
        <Badge variant="outline" className="text-[10px]">cap. {mesa.capacity}</Badge>
      </div>

      {mesa.menuEspecial && (
        <div className="px-3 py-1.5 border-b bg-amber-50">
          <span className="text-[11px] text-amber-700 font-medium">Menú: {mesa.menuEspecial}</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-1 px-3 py-2 border-b">
        <div>
          <div className="text-[10px] text-muted-foreground">Confirmados</div>
          <div className="font-mono font-semibold mt-0.5">{occ}</div>
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground">Check-in</div>
          <div className="font-mono font-semibold mt-0.5 text-blue-600">{checkin}</div>
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground">Ocupación</div>
          <div className="font-mono font-semibold mt-0.5">{pct}%</div>
        </div>
      </div>

      {invitados.length > 0 && (
        <div className="px-3 py-2 max-h-32 overflow-hidden">
          <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wide">Invitados</div>
          <div className="space-y-0.5">
            {invitados.slice(0, 5).map((i) => (
              <div key={i.id} className="flex items-center justify-between text-xs">
                <span className="truncate">{i.nombre} {i.apellido}</span>
                {i.dietaryRestrictions.length > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 ml-1" />
                )}
              </div>
            ))}
            {invitados.length > 5 && (
              <div className="text-[10px] text-muted-foreground">+{invitados.length - 5} más</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
