export type EtapaStatus = 'pendiente' | 'en_curso' | 'completada'
export type SemaphoreStatus = 'verde' | 'amarillo' | 'rojo'

export interface TimelineEtapa {
  id: string
  eventoId: string
  nombre: string
  horaPlanificada: string        // "HH:MM" (postgres TIME → string)
  duracionEstimada: number | null
  horaInicioReal: string | null  // ISO timestamptz
  horaFinReal: string | null
  status: EtapaStatus
  displayOrder: number
  menuCourseId: string | null
  createdAt: string
  updatedAt: string
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + (m ?? 0)
}

export function getDesvioMinutos(etapa: TimelineEtapa): number | null {
  if (!etapa.horaInicioReal) return null
  const planned = timeToMinutes(etapa.horaPlanificada)
  const real = new Date(etapa.horaInicioReal)
  const actual = real.getHours() * 60 + real.getMinutes()
  return actual - planned
}

export function getAcumuladoMinutos(etapas: TimelineEtapa[]): number {
  return etapas.reduce((sum, e) => {
    const d = getDesvioMinutos(e)
    return sum + (d ?? 0)
  }, 0)
}

export function getSemaphore(desvioMinutos: number): SemaphoreStatus {
  const abs = Math.abs(desvioMinutos)
  if (abs < 5) return 'verde'
  if (abs < 15) return 'amarillo'
  return 'rojo'
}

export const ETAPA_STATUS_LABEL: Record<EtapaStatus, string> = {
  pendiente:  'Pendiente',
  en_curso:   'En curso',
  completada: 'Completada',
}

export const SEMAPHORE_COLOR: Record<SemaphoreStatus, string> = {
  verde:    'bg-emerald-500',
  amarillo: 'bg-amber-500',
  rojo:     'bg-rose-500',
}
