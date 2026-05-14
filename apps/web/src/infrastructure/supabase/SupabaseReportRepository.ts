import { supabase } from './client'
import { toInvitado } from './mappers/invitadoMapper'
import { toMesa } from './mappers/mesaMapper'
import type { IReportRepository } from '../../core/ports/IReportRepository'
import type { EventReport, HistoricoItem, MesaReportRow } from '../../core/domain/report/EventReport'
import {
  buildCheckinCurve,
  computeDesvioAcumulado,
  buildFinancieroReport,
} from '../../core/domain/report/EventReport'
import type { TimelineEtapa, EtapaStatus } from '../../core/domain/timeline/TimelineEtapa'
import type { Servicio, ServicioEstado, ServicioMoneda } from '../../core/domain/servicio/Servicio'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toEtapa(raw: any): TimelineEtapa {
  return {
    id: raw.id,
    eventoId: raw.evento_id,
    nombre: raw.nombre,
    horaPlanificada: raw.hora_planificada?.slice(0, 5) ?? '00:00',
    duracionEstimada: raw.duracion_estimada ?? null,
    horaInicioReal: raw.hora_inicio_real ?? null,
    horaFinReal: raw.hora_fin_real ?? null,
    status: raw.status as EtapaStatus,
    displayOrder: raw.display_order ?? 0,
    menuCourseId: raw.menu_course_id ?? null,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toServicio(raw: any): Servicio {
  return {
    id: raw.id,
    eventoId: raw.evento_id,
    orgId: raw.org_id,
    providerId: raw.provider_id ?? null,
    templateId: raw.template_id ?? null,
    nombre: raw.nombre,
    descripcion: raw.descripcion ?? null,
    costoUnitario: raw.costo_unitario ?? 0,
    cantidad: raw.cantidad ?? 1,
    moneda: (raw.moneda ?? 'ARS') as ServicioMoneda,
    montoPagado: raw.monto_pagado ?? 0,
    vencimiento: raw.vencimiento ?? null,
    estado: raw.estado as ServicioEstado,
    checklistStatus: raw.checklist_status ?? 'pendiente',
    checklistNote: raw.checklist_note ?? null,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  }
}

export class SupabaseReportRepository implements IReportRepository {
  async getEventReport(eventoId: string): Promise<EventReport> {
    const [invResult, svResult, etapaResult, mesaResult] = await Promise.all([
      supabase.from('invitados').select('*').eq('evento_id', eventoId),
      supabase.from('servicios').select('*').eq('evento_id', eventoId),
      supabase.from('timeline_etapas').select('*').eq('evento_id', eventoId).order('display_order'),
      supabase.from('mesas').select('*').eq('evento_id', eventoId).order('number'),
    ])

    const invitados = (invResult.data ?? []).map(toInvitado)
    const servicios = (svResult.data ?? []).map(toServicio)
    const etapas = (etapaResult.data ?? []).map(toEtapa)
    const mesas = (mesaResult.data ?? []).map(toMesa)

    const confirmados = invitados.filter(i => i.status === 'confirmado' || i.status === 'checkin')
    const presentes = invitados.filter(i => i.status === 'checkin')
    const noShowRate =
      confirmados.length > 0
        ? ((confirmados.length - presentes.length) / confirmados.length) * 100
        : 0

    // Fetch provider names for financial grouping
    const providerIds = [...new Set(servicios.map(s => s.providerId).filter(Boolean))] as string[]
    const providerNames: Record<string, string> = {}
    if (providerIds.length > 0) {
      const { data: providers } = await supabase
        .from('providers')
        .select('id, name')
        .in('id', providerIds)
      for (const p of providers ?? []) {
        providerNames[p.id] = p.name
      }
    }

    const mesaRows: MesaReportRow[] = mesas.map(mesa => {
      const mesaInvitados = invitados.filter(i => i.mesaId === mesa.id)
      const mesaPresentes = mesaInvitados.filter(i => i.status === 'checkin').length
      const restrictions = [...new Set(mesaInvitados.flatMap(i => i.dietaryRestrictions))]
      return {
        mesa,
        invitados: mesaInvitados,
        presentes: mesaPresentes,
        occupancyPct: mesa.capacity > 0 ? Math.round((mesaInvitados.length / mesa.capacity) * 100) : 0,
        dietaryRestrictions: restrictions,
      }
    })

    return {
      asistencia: {
        invitados,
        confirmados: confirmados.length,
        presentes: presentes.length,
        noShowRate,
        checkinCurve: buildCheckinCurve(invitados),
      },
      financiero: buildFinancieroReport(servicios, providerNames),
      timeline: {
        etapas,
        desvioAcumuladoMin: computeDesvioAcumulado(etapas),
      },
      mesas: mesaRows,
    }
  }

  async getHistorico(eventoId: string): Promise<HistoricoItem[]> {
    // Get the current evento's type to filter similar events
    const { data: currentEvento } = await supabase
      .from('eventos')
      .select('id, name, date, type')
      .eq('id', eventoId)
      .single()

    if (!currentEvento) return []

    const { data: eventos } = await supabase
      .from('eventos')
      .select('id, name, date, type')
      .eq('type', currentEvento.type)
      .order('date', { ascending: false })
      .limit(8)

    if (!eventos || eventos.length === 0) return []

    // Get invitado counts for each evento
    const eventoIds = eventos.map(e => e.id)
    const { data: counts } = await supabase
      .from('invitados')
      .select('evento_id, status')
      .in('evento_id', eventoIds)

    const byEvento: Record<string, { confirmados: number; presentes: number }> = {}
    for (const inv of counts ?? []) {
      if (!byEvento[inv.evento_id]) byEvento[inv.evento_id] = { confirmados: 0, presentes: 0 }
      if (inv.status === 'confirmado' || inv.status === 'checkin') byEvento[inv.evento_id].confirmados++
      if (inv.status === 'checkin') byEvento[inv.evento_id].presentes++
    }

    return eventos.map(e => {
      const stats = byEvento[e.id] ?? { confirmados: 0, presentes: 0 }
      const asistenciaPct =
        stats.confirmados > 0
          ? Math.round((stats.presentes / stats.confirmados) * 100)
          : 0
      return {
        eventoId: e.id,
        name: e.name,
        date: e.date,
        asistenciaPct,
        isCurrentEvento: e.id === eventoId,
      }
    })
  }
}
