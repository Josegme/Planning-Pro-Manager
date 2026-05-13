export interface Mesa {
  id: string
  eventoId: string
  number: number
  name: string | null
  capacity: number
  menuEspecial: string | null
  position: { x: number; y: number } | null
  createdAt: string
  updatedAt: string
}

export type MesaOccupancyStatus = 'empty' | 'partial' | 'full' | 'checkin'

export function getMesaOccupancyStatus(
  occupied: number,
  capacity: number,
  hasCheckins: boolean,
): MesaOccupancyStatus {
  if (occupied === 0) return 'empty'
  if (hasCheckins && occupied >= capacity) return 'checkin'
  if (occupied >= capacity) return 'full'
  return 'partial'
}

export function calcOccupied(
  invitados: { acompanantesEsperados: number }[],
): number {
  return invitados.reduce((sum, i) => sum + 1 + i.acompanantesEsperados, 0)
}
