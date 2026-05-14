import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus, MoreHorizontal, Pencil, Trash2, Phone, Mail, AlertTriangle } from 'lucide-react'
import { useServicios } from '../../hooks/useServicios'
import { useEventoStore } from '../../stores/eventoStore'
import { ServicioDialog } from '../../components/servicios/ServicioDialog'
import { ProviderDialog } from '../../components/servicios/ProviderDialog'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { cn } from '@/lib/utils'
import type { Servicio, ServicioEstado } from '../../../core/domain/servicio/Servicio'
import {
  costoTotal,
  pctPagado,
  vencimientoProximo,
  formatMoney,
  SERVICIO_ESTADO_LABEL,
} from '../../../core/domain/servicio/Servicio'
import type { Provider } from '../../../core/domain/provider/Provider'
import type { CreateServicioData, UpdateServicioData } from '../../../core/ports/IServicioRepository'

const ESTADO_VARIANT: Record<ServicioEstado, string> = {
  cotizado:   'bg-slate-100 text-slate-700',
  contratado: 'bg-blue-100 text-blue-700',
  pagado:     'bg-emerald-100 text-emerald-700',
  cancelado:  'bg-red-100 text-red-600',
}

type Tab = 'servicios' | 'proveedores'

export function ServiciosPage() {
  const { eventoId = '' } = useParams<{ eventoId: string }>()
  const evento = useEventoStore((s) => s.eventos.find((e) => e.id === eventoId))
  const {
    servicios, providers, isLoading, error,
    createServicio, updateServicio, deleteServicio,
    createProvider, updateProvider, deleteProvider,
  } = useServicios(eventoId)

  const [tab, setTab] = useState<Tab>('servicios')
  const [editingServicio, setEditingServicio] = useState<Servicio | null | undefined>(undefined)
  const [editingProvider, setEditingProvider] = useState<Provider | null | undefined>(undefined)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

  // Financial summary
  const summary = useMemo(() => {
    const total  = servicios.reduce((s, x) => s + costoTotal(x), 0)
    const pagado = servicios.reduce((s, x) => s + x.montoPagado, 0)
    const proximos = servicios.filter((x) => vencimientoProximo(x)).length
    return { total, pagado, pendiente: total - pagado, proximos }
  }, [servicios])

  const pctPagadoTotal = summary.total > 0 ? Math.round((summary.pagado / summary.total) * 100) : 0

  // Counts for "this week" vencimientos
  const proximosEstaSemana = useMemo(
    () => servicios.filter((x) => vencimientoProximo(x, 7)).length,
    [servicios],
  )

  async function handleSaveServicio(data: Omit<CreateServicioData, 'eventoId'> & Partial<UpdateServicioData>) {
    if (editingServicio) {
      await updateServicio(editingServicio.id, data as UpdateServicioData)
      showToast('Servicio actualizado')
    } else {
      await createServicio(data as Omit<CreateServicioData, 'eventoId'>)
      showToast('Servicio creado')
    }
  }

  async function handleDeleteServicio(s: Servicio) {
    if (!confirm(`¿Eliminar "${s.nombre}"?`)) return
    await deleteServicio(s.id)
    showToast('Servicio eliminado')
  }

  async function handleSaveProvider(data: Parameters<typeof createProvider>[0]) {
    if (editingProvider) {
      await updateProvider(editingProvider.id, data)
      showToast('Proveedor actualizado')
    } else {
      await createProvider(data)
      showToast('Proveedor creado')
    }
  }

  async function handleDeleteProvider(p: Provider) {
    if (!confirm(`¿Eliminar a "${p.name}"? Los servicios vinculados perderán el proveedor asignado.`)) return
    await deleteProvider(p.id)
    showToast('Proveedor eliminado')
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="px-6 py-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            to={`/eventos/${eventoId}`}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Servicios y proveedores</h1>
            {evento && <p className="text-sm text-muted-foreground mt-0.5">{evento.name}</p>}
          </div>
        </div>
        <Button onClick={() => setEditingServicio(null)}>
          <Plus className="h-4 w-4 mr-2" /> Nuevo servicio
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive mb-4">
          {error}
        </div>
      )}

      {/* Financial summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Presupuesto total</div>
            <div className="text-2xl font-semibold mt-1">{formatMoney(summary.total)}</div>
            <div className="text-xs text-muted-foreground mt-1">{servicios.length} servicio{servicios.length !== 1 ? 's' : ''}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Pagado</div>
            <div className="text-2xl font-semibold text-emerald-600 mt-1">{formatMoney(summary.pagado)}</div>
            <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${pctPagadoTotal}%` }}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Pendiente</div>
            <div className="text-2xl font-semibold text-rose-600 mt-1">{formatMoney(summary.pendiente)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {summary.total > 0 ? `${100 - pctPagadoTotal}% sin pagar` : '—'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Próximos vencimientos</div>
            <div className="text-2xl font-semibold mt-1">{summary.proximos}</div>
            {proximosEstaSemana > 0 && (
              <div className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {proximosEstaSemana} esta semana
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-4">
        {([
          { value: 'servicios', label: 'Servicios del evento', count: servicios.length },
          { value: 'proveedores', label: 'Proveedores (CRM)', count: providers.length },
        ] as { value: Tab; label: string; count: number }[]).map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-1.5',
              tab === t.value
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
            <span className={cn(
              'text-xs rounded-full px-1.5 py-0.5',
              tab === t.value ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
            )}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab: Servicios */}
      {tab === 'servicios' && (
        <Card>
          {servicios.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <p className="text-muted-foreground text-sm">No hay servicios registrados para este evento.</p>
              <Button onClick={() => setEditingServicio(null)} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" /> Crear primer servicio
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50/50 text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="text-left font-medium px-4 py-2.5">Servicio</th>
                    <th className="text-left font-medium px-4 py-2.5">Proveedor</th>
                    <th className="text-left font-medium px-4 py-2.5">Estado</th>
                    <th className="text-right font-medium px-4 py-2.5">Costo total</th>
                    <th className="text-right font-medium px-4 py-2.5">Pagado</th>
                    <th className="text-left font-medium px-4 py-2.5 w-36">Progreso</th>
                    <th className="text-left font-medium px-4 py-2.5">Vencimiento</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {servicios.map((sv) => {
                    const prov = providers.find((p) => p.id === sv.providerId)
                    const total = costoTotal(sv)
                    const pct = pctPagado(sv)
                    const esProximo = vencimientoProximo(sv)
                    return (
                      <tr key={sv.id} className="border-b last:border-0 hover:bg-slate-50/60">
                        <td className="px-4 py-3">
                          <div className="font-medium">{sv.nombre}</div>
                          {sv.descripcion && (
                            <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]">
                              {sv.descripcion}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {prov?.name ?? <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', ESTADO_VARIANT[sv.estado])}>
                            {SERVICIO_ESTADO_LABEL[sv.estado]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-sm">
                          {formatMoney(total, sv.moneda)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-sm">
                          {formatMoney(sv.montoPagado, sv.moneda)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={cn(
                                  'h-full transition-all',
                                  pct === 100 ? 'bg-emerald-500' : pct > 0 ? 'bg-amber-500' : 'bg-slate-300',
                                )}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground tabular-nums w-8 text-right">
                              {pct}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {sv.vencimiento ? (
                            <span className={cn('text-xs', esProximo ? 'text-rose-600 font-medium flex items-center gap-1' : 'text-muted-foreground')}>
                              {esProximo && <AlertTriangle className="h-3 w-3" />}
                              {new Date(sv.vencimiento).toLocaleDateString('es-AR')}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="relative inline-block">
                            <button
                              onClick={() => setMenuOpenId(menuOpenId === sv.id ? null : sv.id)}
                              className="h-7 w-7 flex items-center justify-center rounded hover:bg-accent"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                            {menuOpenId === sv.id && (
                              <div className="absolute right-0 z-10 mt-1 w-36 rounded-md border bg-popover shadow-md text-sm">
                                <button
                                  onClick={() => { setEditingServicio(sv); setMenuOpenId(null) }}
                                  className="flex w-full items-center gap-2 px-3 py-2 hover:bg-accent"
                                >
                                  <Pencil className="h-3.5 w-3.5" /> Editar
                                </button>
                                <button
                                  onClick={() => { handleDeleteServicio(sv); setMenuOpenId(null) }}
                                  className="flex w-full items-center gap-2 px-3 py-2 hover:bg-accent text-destructive"
                                >
                                  <Trash2 className="h-3.5 w-3.5" /> Eliminar
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Tab: Proveedores */}
      {tab === 'proveedores' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {providers.map((p) => {
            const svcCount = servicios.filter((s) => s.providerId === p.id).length
            const initials = p.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
            return (
              <Card key={p.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-600 shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{p.name}</div>
                      {p.phone && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3" /> {p.phone}
                        </div>
                      )}
                      {p.email && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Mail className="h-3 w-3" /> {p.email}
                        </div>
                      )}
                      {p.notes && (
                        <p className="text-xs italic text-muted-foreground mt-2 line-clamp-2">
                          "{p.notes}"
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        <Badge variant="secondary" className="text-[11px]">
                          {svcCount} servicio{svcCount !== 1 ? 's' : ''} en este evento
                        </Badge>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditingProvider(p)}
                            className="h-7 w-7 flex items-center justify-center rounded hover:bg-accent"
                            title="Editar"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProvider(p)}
                            className="h-7 w-7 flex items-center justify-center rounded hover:bg-accent text-destructive"
                            title="Eliminar"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {/* Add provider card */}
          <button
            onClick={() => setEditingProvider(null)}
            className="rounded-xl border border-dashed p-6 text-center hover:bg-accent/40 transition-colors flex flex-col items-center justify-center gap-2"
          >
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
              <Plus className="h-5 w-5 text-slate-500" />
            </div>
            <div className="text-sm font-medium">Agregar proveedor</div>
            <div className="text-xs text-muted-foreground">Disponible para todos tus eventos</div>
          </button>
        </div>
      )}

      {/* Dialogs */}
      <ServicioDialog
        open={editingServicio !== undefined}
        onClose={() => setEditingServicio(undefined)}
        onSave={handleSaveServicio}
        servicio={editingServicio}
        providers={providers}
      />

      <ProviderDialog
        open={editingProvider !== undefined}
        onClose={() => setEditingProvider(undefined)}
        onSave={handleSaveProvider}
        provider={editingProvider}
      />

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-slate-900 text-white text-sm px-4 py-2.5 shadow-lg">
          {toastMsg}
        </div>
      )}

      {/* Close menu on outside click */}
      {menuOpenId && (
        <div className="fixed inset-0 z-0" onClick={() => setMenuOpenId(null)} />
      )}
    </div>
  )
}
