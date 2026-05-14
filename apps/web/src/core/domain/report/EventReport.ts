import type { Invitado } from '../invitado/Invitado'
import type { TimelineEtapa } from '../timeline/TimelineEtapa'
import { getDesvioMinutos } from '../timeline/TimelineEtapa'
import type { Servicio } from '../servicio/Servicio'
import { costoTotal } from '../servicio/Servicio'
import type { Mesa } from '../mesa/Mesa'

export interface CheckinSlot {
  time: string
  count: number
  cumulative: number
}

export interface HistoricoItem {
  eventoId: string
  name: string
  date: string
  asistenciaPct: number
  isCurrentEvento: boolean
}

export interface AsistenciaReport {
  invitados: Invitado[]
  confirmados: number
  presentes: number
  noShowRate: number
  checkinCurve: CheckinSlot[]
}

export interface ProviderSummary {
  providerId: string | null
  providerName: string
  totalCosto: number
  totalPagado: number
}

export interface FinancieroReport {
  servicios: Servicio[]
  totalPresupuesto: number
  totalPagado: number
  totalPendiente: number
  byProvider: ProviderSummary[]
}

export interface TimelineReport {
  etapas: TimelineEtapa[]
  desvioAcumuladoMin: number
}

export interface MesaReportRow {
  mesa: Mesa
  invitados: Invitado[]
  presentes: number
  occupancyPct: number
  dietaryRestrictions: string[]
}

export interface EventReport {
  asistencia: AsistenciaReport
  financiero: FinancieroReport
  timeline: TimelineReport
  mesas: MesaReportRow[]
}

export function buildCheckinCurve(invitados: Invitado[]): CheckinSlot[] {
  const presentes = invitados.filter(i => i.status === 'checkin' && i.checkinAt)
  if (presentes.length === 0) return []

  const bySlot: Record<string, number> = {}
  for (const inv of presentes) {
    const d = new Date(inv.checkinAt!)
    const hh = d.getHours()
    const mm = Math.floor(d.getMinutes() / 15) * 15
    const key = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
    bySlot[key] = (bySlot[key] ?? 0) + 1
  }

  const sorted = Object.entries(bySlot)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([time, count]) => ({ time, count, cumulative: 0 }))

  let acc = 0
  for (const slot of sorted) {
    acc += slot.count
    slot.cumulative = acc
  }

  return sorted
}

export function computeDesvioAcumulado(etapas: TimelineEtapa[]): number {
  return etapas.reduce((sum, e) => {
    const d = getDesvioMinutos(e)
    return sum + (d ?? 0)
  }, 0)
}

export function buildFinancieroReport(
  servicios: Servicio[],
  providerNames: Record<string, string>,
): FinancieroReport {
  const activos = servicios.filter(s => s.estado !== 'cancelado')
  const totalPresupuesto = activos.reduce((s, x) => s + costoTotal(x), 0)
  const totalPagado = activos.reduce((s, x) => s + x.montoPagado, 0)

  const byProviderMap: Record<string, ProviderSummary> = {}
  for (const sv of activos) {
    const key = sv.providerId ?? '__none__'
    if (!byProviderMap[key]) {
      byProviderMap[key] = {
        providerId: sv.providerId,
        providerName: sv.providerId ? (providerNames[sv.providerId] ?? 'Proveedor') : 'Sin proveedor',
        totalCosto: 0,
        totalPagado: 0,
      }
    }
    byProviderMap[key].totalCosto += costoTotal(sv)
    byProviderMap[key].totalPagado += sv.montoPagado
  }

  return {
    servicios: activos,
    totalPresupuesto,
    totalPagado,
    totalPendiente: totalPresupuesto - totalPagado,
    byProvider: Object.values(byProviderMap).sort((a, b) => b.totalCosto - a.totalCosto),
  }
}
