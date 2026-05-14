export type ServicioEstado = 'cotizado' | 'contratado' | 'pagado' | 'cancelado'
export type ServicioMoneda = 'ARS' | 'USD' | 'EUR'

export interface Servicio {
  id: string
  eventoId: string
  orgId: string
  providerId: string | null
  templateId: string | null
  nombre: string
  descripcion: string | null
  costoUnitario: number
  cantidad: number
  moneda: ServicioMoneda
  montoPagado: number
  vencimiento: string | null
  estado: ServicioEstado
  checklistStatus: 'pendiente' | 'confirmado' | 'problema'
  checklistNote: string | null
  createdAt: string
  updatedAt: string
}

export const SERVICIO_ESTADO_LABEL: Record<ServicioEstado, string> = {
  cotizado:   'Cotizado',
  contratado: 'Contratado',
  pagado:     'Pagado',
  cancelado:  'Cancelado',
}

export const SERVICIO_MONEDA_SYMBOL: Record<ServicioMoneda, string> = {
  ARS: '$',
  USD: 'U$S',
  EUR: '€',
}

export function costoTotal(s: Pick<Servicio, 'costoUnitario' | 'cantidad'>): number {
  return s.costoUnitario * s.cantidad
}

export function montoPendiente(s: Pick<Servicio, 'costoUnitario' | 'cantidad' | 'montoPagado'>): number {
  return Math.max(0, costoTotal(s) - s.montoPagado)
}

export function pctPagado(s: Pick<Servicio, 'costoUnitario' | 'cantidad' | 'montoPagado'>): number {
  const total = costoTotal(s)
  if (total === 0) return 0
  return Math.min(100, Math.round((s.montoPagado / total) * 100))
}

export function vencimientoProximo(s: Pick<Servicio, 'vencimiento' | 'estado'>, daysAhead = 7): boolean {
  if (!s.vencimiento || s.estado === 'pagado' || s.estado === 'cancelado') return false
  const diff = (new Date(s.vencimiento).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  return diff >= 0 && diff <= daysAhead
}

export function formatMoney(amount: number, moneda: ServicioMoneda = 'ARS'): string {
  const sym = SERVICIO_MONEDA_SYMBOL[moneda]
  return `${sym} ${amount.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}
