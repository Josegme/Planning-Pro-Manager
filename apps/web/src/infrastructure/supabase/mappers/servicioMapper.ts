import type { Servicio, ServicioEstado, ServicioMoneda } from '../../../core/domain/servicio/Servicio'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toServicio(raw: any): Servicio {
  return {
    id: raw.id,
    eventoId: raw.evento_id,
    orgId: raw.org_id,
    providerId: raw.provider_id ?? null,
    templateId: raw.template_id ?? null,
    nombre: raw.nombre,
    descripcion: raw.descripcion ?? null,
    costoUnitario: Number(raw.costo_unitario ?? 0),
    cantidad: raw.cantidad ?? 1,
    moneda: (raw.moneda ?? 'ARS') as ServicioMoneda,
    montoPagado: Number(raw.monto_pagado ?? 0),
    vencimiento: raw.vencimiento ?? null,
    estado: (raw.estado ?? 'cotizado') as ServicioEstado,
    checklistStatus: (raw.checklist_status ?? 'pendiente') as Servicio['checklistStatus'],
    checklistNote: raw.checklist_note ?? null,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  }
}
