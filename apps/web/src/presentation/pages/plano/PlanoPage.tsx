import { useState, useMemo, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Printer, AlertCircle } from 'lucide-react'
import { useMesas } from '../../hooks/useMesas'
import { useLayout } from '../../hooks/useLayout'
import { useEventoStore } from '../../stores/eventoStore'
import { MesaRing } from '../../components/plano/MesaRing'
import { StructuralEl } from '../../components/plano/StructuralEl'
import { PlanoTooltip } from '../../components/plano/PlanoTooltip'
import { DEFAULT_ELEMENTS, autoPositionMesas } from '../../../core/domain/layout/EventLayout'
import type { Mesa } from '../../../core/domain/mesa/Mesa'

const VP = { W: 1000, H: 640 }

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs">
      <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  )
}

function StatRow({
  label,
  value,
  color = 'text-foreground',
  sub,
}: {
  label: string
  value: number
  color?: string
  sub?: string
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-semibold tabular-nums ${color}`}>
        {value}
        {sub && <span className="text-xs text-muted-foreground font-normal ml-1.5">({sub})</span>}
      </span>
    </div>
  )
}

export function PlanoPage() {
  const { eventoId = '' } = useParams<{ eventoId: string }>()
  const evento = useEventoStore((s) => s.eventos.find((e) => e.id === eventoId))
  const { mesas, invitados, isLoading: mesasLoading, error: mesasError } = useMesas(eventoId)
  const { layout, isLoading: layoutLoading } = useLayout(eventoId)

  const [hoverMesa, setHoverMesa] = useState<Mesa | null>(null)
  const [mousePos, setMousePos]   = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const elements = layout?.elements ?? DEFAULT_ELEMENTS

  const mesaPositions = useMemo(() => {
    const autoPos = autoPositionMesas(mesas.length)
    return mesas.map((m, i) => ({
      mesa: m,
      cx: (m.position?.x ?? autoPos[i]?.x ?? 0.5) * VP.W,
      cy: (m.position?.y ?? autoPos[i]?.y ?? 0.5) * VP.H,
    }))
  }, [mesas])

  const invitadosByMesa = useMemo(() => {
    const map: Record<string, typeof invitados> = {}
    mesas.forEach((m) => { map[m.id] = [] })
    invitados.forEach((inv) => {
      if (inv.mesaId && map[inv.mesaId]) map[inv.mesaId].push(inv)
    })
    return map
  }, [mesas, invitados])

  const stats = useMemo(() => {
    const cap  = mesas.reduce((s, m) => s + m.capacity, 0)
    const conf = invitados
      .filter((i) => i.mesaId !== null)
      .reduce((s, i) => s + 1 + i.acompanantesEsperados, 0)
    const chk = invitados.filter((i) => i.status === 'checkin').length
    return { cap, conf, chk }
  }, [mesas, invitados])

  const isLoading = mesasLoading || layoutLoading

  return (
    <div className="px-6 py-6 max-w-[1600px] mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to={`/eventos/${eventoId}/mesas`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-xl font-semibold">Plano del salón</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-6">
            {evento?.name && <span>{evento.name} · </span>}
            {mesas.length} mesas configuradas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 h-9 rounded-md px-3 text-sm border border-input bg-background hover:bg-accent font-medium transition-colors">
            <Printer className="h-3.5 w-3.5" />
            Imprimir
          </button>
        </div>
      </div>

      {mesasError && (
        <div className="mb-4 flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {mesasError}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-muted-foreground">Cargando plano...</p>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-4">
          {/* SVG canvas */}
          <div className="col-span-12 lg:col-span-9">
            <div className="rounded-lg border bg-white overflow-hidden">
              <div className="border-b px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground">Estado:</span>
                  <Legend color="#94a3b8" label="Sin asignar" />
                  <Legend color="#f59e0b" label="Parcial" />
                  <Legend color="#fb923c" label="Completa" />
                  <Legend color="#3b82f6" label="Check-in" />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Tiempo real
                </div>
              </div>

              <div
                ref={containerRef}
                className="relative"
                style={{ aspectRatio: `${VP.W}/${VP.H}`, background: '#f8fafc' }}
                onMouseMove={(e) => {
                  const rect = containerRef.current?.getBoundingClientRect()
                  if (rect) setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
                }}
              >
                <svg viewBox={`0 0 ${VP.W} ${VP.H}`} className="absolute inset-0 w-full h-full">
                  {/* Room outline */}
                  <rect x={20} y={20} width={960} height={600} rx={12} fill="white" stroke="#cbd5e1" strokeWidth={2} />
                  {/* Structural elements */}
                  {elements.map((el) => (
                    <StructuralEl key={el.id} el={el} />
                  ))}
                  {/* Mesas */}
                  {mesaPositions.map(({ mesa, cx, cy }) => (
                    <MesaRing
                      key={mesa.id}
                      mesa={mesa}
                      invitados={invitadosByMesa[mesa.id] ?? []}
                      cx={cx}
                      cy={cy}
                      r={26}
                      onHover={setHoverMesa}
                    />
                  ))}
                </svg>

                {hoverMesa && (
                  <div
                    className="absolute pointer-events-none z-10"
                    style={{
                      left: mousePos.x + 16,
                      top:  Math.max(0, mousePos.y - 20),
                    }}
                  >
                    <PlanoTooltip
                      mesa={hoverMesa}
                      invitados={invitadosByMesa[hoverMesa.id] ?? []}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <div className="rounded-lg border bg-white p-4 space-y-3">
              <h2 className="text-sm font-semibold">Resumen</h2>
              <StatRow label="Capacidad total" value={stats.cap} />
              <StatRow
                label="Confirmados asignados"
                value={stats.conf}
                sub={stats.cap > 0 ? `${Math.round((stats.conf / stats.cap) * 100)}%` : undefined}
              />
              <StatRow label="Check-in realizado" value={stats.chk} color="text-blue-600" />
              <StatRow label="Lugares libres" value={Math.max(0, stats.cap - stats.conf)} />
            </div>

            {mesas.length > 0 && (
              <div className="rounded-lg border bg-white p-4">
                <h2 className="text-sm font-semibold mb-3">Ocupación por mesa</h2>
                <div className="space-y-2">
                  {mesas.map((m) => {
                    const inv  = invitadosByMesa[m.id] ?? []
                    const occ  = inv.reduce((s, i) => s + 1 + i.acompanantesEsperados, 0)
                    const pct  = m.capacity > 0 ? Math.round((occ / m.capacity) * 100) : 0
                    const barColor =
                      occ === 0
                        ? 'bg-slate-300'
                        : pct >= 100
                        ? 'bg-orange-400'
                        : 'bg-amber-400'
                    return (
                      <div key={m.id} className="flex items-center gap-2 text-xs">
                        <span className="w-14 tabular-nums text-muted-foreground shrink-0">
                          Mesa {m.number}
                        </span>
                        <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${barColor} transition-all`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-10 text-right tabular-nums shrink-0">
                          {occ}/{m.capacity}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
