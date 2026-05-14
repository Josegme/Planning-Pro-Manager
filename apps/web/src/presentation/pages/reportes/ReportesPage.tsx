import { useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Download, Printer, Users, Clock,
  DollarSign, FileText, BarChart2, Table2, ChefHat, Eye,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useReportes } from '../../hooks/useReportes'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Dialog } from '../../components/ui/Dialog'
import { formatMoney } from '../../../core/domain/servicio/Servicio'
import { DIETARY_OPTIONS } from '../../../core/domain/invitado/Invitado'
import { ETAPA_STATUS_LABEL } from '../../../core/domain/timeline/TimelineEtapa'
import { getDesvioMinutos, getSemaphore } from '../../../core/domain/timeline/TimelineEtapa'
import type { EventReport } from '../../../core/domain/report/EventReport'

type ReportType = 'asistencia' | 'financiero' | 'mesas' | 'timeline' | 'comanda' | 'ejecutivo'

const REPORT_CARDS = [
  { id: 'asistencia' as ReportType, title: 'Reporte de asistencia', desc: 'Confirmados vs presentes, acompañantes, hora de llegada.', Icon: Users },
  { id: 'financiero' as ReportType, title: 'Reporte financiero', desc: 'Servicios, costos, pagos realizados y deuda por proveedor.', Icon: DollarSign },
  { id: 'mesas' as ReportType, title: 'Distribución de mesas', desc: 'Ocupación real vs capacidad, restricciones por mesa.', Icon: Table2 },
  { id: 'timeline' as ReportType, title: 'Cumplimiento de timeline', desc: 'Etapas planificadas vs tiempos reales, desvíos.', Icon: Clock },
  { id: 'comanda' as ReportType, title: 'Comanda servida', desc: 'Cantidades finales basadas en check-in real.', Icon: ChefHat },
  { id: 'ejecutivo' as ReportType, title: 'Resumen ejecutivo', desc: 'PDF auto-generado con el resumen completo del evento.', Icon: FileText },
]

const dietaryLabel = (id: string) =>
  DIETARY_OPTIONS.find(o => o.id === id)?.label ?? id

// ─── Checkin curve bar chart ──────────────────────────────────────────────────

function CheckinCurve({ curve }: { curve: EventReport['asistencia']['checkinCurve'] }) {
  if (curve.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><BarChart2 className="h-4 w-4" /> Curva de check-in</CardTitle>
          <CardDescription>Llegadas por franja de 15 minutos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
            No hay datos de check-in aún
          </div>
        </CardContent>
      </Card>
    )
  }

  const maxCount = Math.max(...curve.map(s => s.count), 1)
  const pico = curve.reduce((a, b) => (b.count > a.count ? b : a), curve[0])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2"><BarChart2 className="h-4 w-4" /> Curva de check-in</CardTitle>
        <CardDescription>Llegadas por franja de 15 minutos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-1 h-36">
          {curve.map(s => (
            <div key={s.time} className="flex-1 flex flex-col items-center gap-1 group min-w-0">
              <div className="text-[9px] text-muted-foreground font-mono tabular-nums">
                {s.count > 0 ? s.count : ''}
              </div>
              <div
                className="w-full bg-blue-500 rounded-t group-hover:bg-blue-600 transition-colors"
                style={{ height: `${Math.max(2, (s.count / maxCount) * 100)}%` }}
              />
              <div className="text-[9px] text-muted-foreground font-mono hidden sm:block truncate w-full text-center">
                {s.time}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
          <div>Pico: <strong className="text-foreground">{pico.time} · {pico.count} personas</strong></div>
          <div>Total: <strong className="text-foreground">{curve[curve.length - 1]?.cumulative ?? 0}</strong></div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Historical comparison ────────────────────────────────────────────────────

function HistoricoComparativa({ historico }: { historico: ReturnType<typeof useReportes>['historico'] }) {
  if (historico.length === 0) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Comparativa histórica</CardTitle>
        <CardDescription>Tasa de asistencia por evento del mismo tipo</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {historico.map(e => (
          <div key={e.eventoId}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className={cn('truncate', e.isCurrentEvento && 'font-semibold')}>
                {e.name}{e.isCurrentEvento && ' (este)'}
              </span>
              <span className="font-mono ml-2 shrink-0">{e.asistenciaPct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', e.isCurrentEvento ? 'bg-blue-500' : 'bg-slate-400')}
                style={{ width: `${e.asistenciaPct}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ─── Report preview content ───────────────────────────────────────────────────

function AsistenciaPreview({ report }: { report: EventReport }) {
  const { invitados } = report.asistencia
  const sorted = [...invitados].sort((a, b) => a.apellido.localeCompare(b.apellido))
  return (
    <div className="text-sm">
      <table className="w-full">
        <thead>
          <tr className="border-b text-xs uppercase tracking-wider text-muted-foreground">
            <th className="text-left py-2 pr-3">Apellido</th>
            <th className="text-left py-2 pr-3">Nombre</th>
            <th className="text-left py-2 pr-3">Estado</th>
            <th className="text-left py-2 pr-3">Hora</th>
            <th className="text-right py-2">Acomp.</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(inv => (
            <tr key={inv.id} className="border-b last:border-0">
              <td className="py-1.5 pr-3 font-medium">{inv.apellido}</td>
              <td className="py-1.5 pr-3">{inv.nombre}</td>
              <td className="py-1.5 pr-3">
                <Badge variant={inv.status === 'checkin' ? 'success' : 'secondary'} className="text-[10px]">
                  {inv.status === 'checkin' ? 'Presente' : inv.status === 'confirmado' ? 'No llegó' : inv.status}
                </Badge>
              </td>
              <td className="py-1.5 pr-3 font-mono text-xs text-muted-foreground">
                {inv.checkinAt
                  ? format(new Date(inv.checkinAt), 'HH:mm')
                  : '—'}
              </td>
              <td className="py-1.5 text-right text-muted-foreground">{inv.acompanantesPresentes ?? inv.acompanantesEsperados}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FinancieroPreview({ report }: { report: EventReport }) {
  const { servicios, totalPresupuesto, totalPagado, totalPendiente, byProvider } = report.financiero
  return (
    <div className="space-y-4 text-sm">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-md border p-3 text-center">
          <div className="text-xs text-muted-foreground">Total</div>
          <div className="font-semibold">{formatMoney(totalPresupuesto)}</div>
        </div>
        <div className="rounded-md border p-3 text-center">
          <div className="text-xs text-muted-foreground">Pagado</div>
          <div className="font-semibold text-emerald-600">{formatMoney(totalPagado)}</div>
        </div>
        <div className="rounded-md border p-3 text-center">
          <div className="text-xs text-muted-foreground">Pendiente</div>
          <div className="font-semibold text-rose-600">{formatMoney(totalPendiente)}</div>
        </div>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b text-xs uppercase tracking-wider text-muted-foreground">
            <th className="text-left py-2 pr-3">Servicio</th>
            <th className="text-left py-2 pr-3">Estado</th>
            <th className="text-right py-2 pr-3">Costo</th>
            <th className="text-right py-2">Pagado</th>
          </tr>
        </thead>
        <tbody>
          {servicios.map(sv => (
            <tr key={sv.id} className="border-b last:border-0">
              <td className="py-1.5 pr-3 font-medium">{sv.nombre}</td>
              <td className="py-1.5 pr-3 text-muted-foreground capitalize">{sv.estado}</td>
              <td className="py-1.5 pr-3 text-right font-mono">{formatMoney(sv.costoUnitario * sv.cantidad, sv.moneda)}</td>
              <td className="py-1.5 text-right font-mono">{formatMoney(sv.montoPagado, sv.moneda)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {byProvider.length > 0 && (
        <div>
          <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">Por proveedor</p>
          {byProvider.map(p => (
            <div key={p.providerId ?? 'none'} className="flex items-center justify-between py-1.5 border-b last:border-0">
              <span>{p.providerName}</span>
              <span className="font-mono">{formatMoney(p.totalPagado)} / {formatMoney(p.totalCosto)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MesasPreview({ report }: { report: EventReport }) {
  return (
    <div className="text-sm">
      <table className="w-full">
        <thead>
          <tr className="border-b text-xs uppercase tracking-wider text-muted-foreground">
            <th className="text-left py-2 pr-3">Mesa</th>
            <th className="text-right py-2 pr-3">Cap.</th>
            <th className="text-right py-2 pr-3">Asignados</th>
            <th className="text-right py-2 pr-3">Presentes</th>
            <th className="text-left py-2">Restricciones</th>
          </tr>
        </thead>
        <tbody>
          {report.mesas.map(({ mesa, invitados, presentes, occupancyPct, dietaryRestrictions }) => (
            <tr key={mesa.id} className="border-b last:border-0">
              <td className="py-1.5 pr-3 font-medium">
                Mesa {mesa.number}{mesa.name ? ` · ${mesa.name}` : ''}
              </td>
              <td className="py-1.5 pr-3 text-right text-muted-foreground">{mesa.capacity}</td>
              <td className="py-1.5 pr-3 text-right">{invitados.length} <span className="text-xs text-muted-foreground">({occupancyPct}%)</span></td>
              <td className="py-1.5 pr-3 text-right">{presentes}</td>
              <td className="py-1.5">
                {dietaryRestrictions.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {dietaryRestrictions.map(r => (
                      <Badge key={r} variant="warning" className="text-[9px]">{dietaryLabel(r)}</Badge>
                    ))}
                  </div>
                ) : <span className="text-muted-foreground text-xs">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TimelinePreview({ report }: { report: EventReport }) {
  return (
    <div className="text-sm">
      <table className="w-full">
        <thead>
          <tr className="border-b text-xs uppercase tracking-wider text-muted-foreground">
            <th className="text-left py-2 pr-3">Etapa</th>
            <th className="text-left py-2 pr-3">Planificado</th>
            <th className="text-left py-2 pr-3">Real</th>
            <th className="text-right py-2 pr-3">Desvío</th>
            <th className="text-left py-2">Estado</th>
          </tr>
        </thead>
        <tbody>
          {report.timeline.etapas.map(e => {
            const desvio = getDesvioMinutos(e)
            const semaforo = desvio !== null ? getSemaphore(desvio) : null
            const semColor = semaforo === 'verde' ? 'text-emerald-600' : semaforo === 'amarillo' ? 'text-amber-600' : 'text-rose-600'
            return (
              <tr key={e.id} className="border-b last:border-0">
                <td className="py-1.5 pr-3 font-medium">{e.nombre}</td>
                <td className="py-1.5 pr-3 font-mono text-muted-foreground">{e.horaPlanificada}</td>
                <td className="py-1.5 pr-3 font-mono text-muted-foreground">
                  {e.horaInicioReal ? format(new Date(e.horaInicioReal), 'HH:mm') : '—'}
                </td>
                <td className={cn('py-1.5 pr-3 text-right font-mono', semColor)}>
                  {desvio !== null ? `${desvio > 0 ? '+' : ''}${desvio} min` : '—'}
                </td>
                <td className="py-1.5 text-muted-foreground text-xs">{ETAPA_STATUS_LABEL[e.status]}</td>
              </tr>
            )
          })}
        </tbody>
        {report.timeline.desvioAcumuladoMin !== 0 && (
          <tfoot>
            <tr className="border-t">
              <td colSpan={3} className="py-2 text-xs text-muted-foreground font-medium">Desvío acumulado</td>
              <td className={cn('py-2 text-right font-mono font-semibold', report.timeline.desvioAcumuladoMin > 14 ? 'text-rose-600' : report.timeline.desvioAcumuladoMin > 4 ? 'text-amber-600' : 'text-emerald-600')}>
                {report.timeline.desvioAcumuladoMin > 0 ? '+' : ''}{report.timeline.desvioAcumuladoMin} min
              </td>
              <td />
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}

function ComandaPreview({ report }: { report: EventReport }) {
  const presentes = report.asistencia.invitados.filter(i => i.status === 'checkin')
  const total = presentes.length
  const byRestriction: Record<string, number> = {}
  for (const inv of presentes) {
    for (const r of inv.dietaryRestrictions) {
      byRestriction[r] = (byRestriction[r] ?? 0) + 1
    }
  }
  const standard = Math.max(0, total - Object.values(byRestriction).reduce((a, b) => a + b, 0))

  return (
    <div className="space-y-4 text-sm">
      <div className="rounded-md border p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Comensales reales (check-in)</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-2xl font-semibold">{total}</div>
            <div className="text-xs text-muted-foreground mt-1">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold">{standard}</div>
            <div className="text-xs text-muted-foreground mt-1">Estándar</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-amber-600">{total - standard}</div>
            <div className="text-xs text-muted-foreground mt-1">Especiales</div>
          </div>
        </div>
      </div>
      {Object.entries(byRestriction).length > 0 && (
        <table className="w-full">
          <thead>
            <tr className="border-b text-xs uppercase tracking-wider text-muted-foreground">
              <th className="text-left py-2 pr-3">Restricción</th>
              <th className="text-right py-2">Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(byRestriction).map(([r, count]) => (
              <tr key={r} className="border-b last:border-0">
                <td className="py-1.5 pr-3">{dietaryLabel(r)}</td>
                <td className="py-1.5 text-right font-semibold">{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function EjecutivoPreview({ report, noShowRate, desvioAcumulado }: {
  report: EventReport
  noShowRate: number
  desvioAcumulado: number
}) {
  const { confirmados, presentes } = report.asistencia
  const { totalPresupuesto, totalPendiente } = report.financiero
  const etapasCompletadas = report.timeline.etapas.filter(e => e.status === 'completada').length
  const mesasOcupadas = report.mesas.filter(m => m.invitados.length > 0).length

  return (
    <div className="space-y-4 text-sm">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">Asistencia</div>
          <div className="text-xl font-semibold mt-1">{presentes} / {confirmados}</div>
          <div className="text-xs text-muted-foreground">{noShowRate.toFixed(1)}% no-show</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">Presupuesto</div>
          <div className="text-xl font-semibold mt-1">{formatMoney(totalPresupuesto)}</div>
          <div className="text-xs text-muted-foreground">{formatMoney(totalPendiente)} pendiente</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">Timeline</div>
          <div className="text-xl font-semibold mt-1">{etapasCompletadas} / {report.timeline.etapas.length}</div>
          <div className={cn('text-xs', desvioAcumulado > 14 ? 'text-rose-600' : 'text-muted-foreground')}>
            {desvioAcumulado > 0 ? '+' : ''}{desvioAcumulado} min acumulados
          </div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">Mesas</div>
          <div className="text-xl font-semibold mt-1">{mesasOcupadas} / {report.mesas.length}</div>
          <div className="text-xs text-muted-foreground">con invitados asignados</div>
        </div>
      </div>
      <div className="text-xs text-muted-foreground italic border-t pt-3">
        Resumen ejecutivo · Generado el {format(new Date(), "d 'de' MMMM yyyy 'a las' HH:mm", { locale: es })}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function ReportesPage() {
  const { eventoId } = useParams<{ eventoId: string }>()
  const { report, historico, isLoading, error } = useReportes(eventoId ?? '')
  const [previewReport, setPreviewReport] = useState<ReportType | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  function handlePrint(type: ReportType) {
    setPreviewReport(type)
    // Give React a tick to render the dialog, then print
    setTimeout(() => window.print(), 300)
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-4">
        <div className="h-8 w-64 rounded bg-muted animate-pulse" />
        <div className="grid grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />)}
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <p className="text-destructive">{error ?? 'No se pudo cargar el reporte'}</p>
        <Link to={`/eventos/${eventoId}`} className="text-sm text-muted-foreground hover:underline mt-3 inline-block">
          ← Volver al evento
        </Link>
      </div>
    )
  }

  const { asistencia, financiero, timeline } = report
  const noShowRate = asistencia.noShowRate
  const desvioAcumulado = timeline.desvioAcumuladoMin
  const margenPresupuesto = financiero.totalPendiente

  return (
    <div className="p-6 max-w-5xl mx-auto print:p-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            to={`/eventos/${eventoId}`}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Reportes y analytics</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Métricas y documentos exportables del evento</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-2" />
          Imprimir todo
        </Button>
      </div>

      {/* Metrics cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Asistencia</div>
            <div className="text-2xl font-semibold mt-1">{asistencia.presentes} / {asistencia.confirmados}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {asistencia.confirmados > 0
                ? `${Math.round((asistencia.presentes / asistencia.confirmados) * 100)}% de asistencia`
                : 'Sin confirmados'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">No-show</div>
            <div className={cn('text-2xl font-semibold mt-1', noShowRate > 10 ? 'text-rose-600' : noShowRate > 5 ? 'text-amber-600' : 'text-slate-900')}>
              {noShowRate.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">{asistencia.confirmados - asistencia.presentes} personas no llegaron</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Desvío timeline</div>
            <div className={cn('text-2xl font-semibold mt-1', desvioAcumulado > 14 ? 'text-rose-600' : desvioAcumulado > 4 ? 'text-amber-600' : 'text-emerald-600')}>
              {desvioAcumulado > 0 ? '+' : ''}{desvioAcumulado} min
            </div>
            <div className="text-xs text-muted-foreground mt-1">desvío acumulado</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Presupuesto</div>
            <div className="text-2xl font-semibold mt-1">{formatMoney(financiero.totalPresupuesto)}</div>
            <div className={cn('text-xs mt-1', margenPresupuesto > 0 ? 'text-emerald-600' : 'text-rose-600')}>
              {formatMoney(Math.abs(margenPresupuesto))} {margenPresupuesto >= 0 ? 'pendiente de pago' : 'sobre presupuesto'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Curve + Historical */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <CheckinCurve curve={asistencia.checkinCurve} />
        </div>
        <HistoricoComparativa historico={historico} />
      </div>

      {/* Report cards */}
      <div className="mb-4">
        <h2 className="text-base font-semibold">Documentos exportables</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Vista previa en pantalla o descarga en PDF via impresión</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 print:hidden">
        {REPORT_CARDS.map(({ id, title, desc, Icon }) => (
          <Card key={id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center mb-3">
                <Icon className="h-4 w-4" />
              </div>
              <div className="font-semibold text-sm">{title}</div>
              <div className="text-xs text-muted-foreground mt-1">{desc}</div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => setPreviewReport(id)}>
                  <Eye className="h-3 w-3 mr-1" /> Vista previa
                </Button>
                <Button size="sm" variant="outline" onClick={() => handlePrint(id)} title="Descargar PDF">
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview dialog */}
      <Dialog
        open={previewReport !== null}
        onClose={() => setPreviewReport(null)}
        title={REPORT_CARDS.find(r => r.id === previewReport)?.title ?? ''}
        maxWidth="2xl"
      >
        <div ref={printRef} className="max-h-[70vh] overflow-y-auto">
          {previewReport === 'asistencia' && <AsistenciaPreview report={report} />}
          {previewReport === 'financiero' && <FinancieroPreview report={report} />}
          {previewReport === 'mesas' && <MesasPreview report={report} />}
          {previewReport === 'timeline' && <TimelinePreview report={report} />}
          {previewReport === 'comanda' && <ComandaPreview report={report} />}
          {previewReport === 'ejecutivo' && (
            <EjecutivoPreview report={report} noShowRate={noShowRate} desvioAcumulado={desvioAcumulado} />
          )}
        </div>
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
          <Button variant="outline" onClick={() => setPreviewReport(null)}>Cerrar</Button>
          <Button onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" /> Imprimir / Guardar PDF
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
